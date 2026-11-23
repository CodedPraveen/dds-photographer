from __future__ import annotations

import os
import platform
import ipaddress
import re
from pathlib import Path


class IsolationError(RuntimeError):
    pass


_FORBIDDEN = ("DATABASE_URL", "DIRECT_URL", "R2", "REDIS", "BULLMQ", "SUPABASE", "PRISMA")
_CAPABILITY_FIELDS = ("CapEff", "CapPrm", "CapInh", "CapBnd", "CapAmb")


def _read(proc_root: Path, name: str) -> str:
    try:
        return (proc_root / name).read_text(encoding="utf-8")
    except OSError as exc:
        raise IsolationError(f"unable to read {name}") from exc


def verify_capabilities(status: str) -> None:
    for field in _CAPABILITY_FIELDS:
        match = re.search(rf"^{field}:\s+([0-9A-Fa-f]+)\s*$", status, re.MULTILINE)
        if match is None:
            raise IsolationError(f"{field} is missing from process status")
        if int(match.group(1), 16) != 0:
            raise IsolationError(f"{field} is non-zero")


def verify_ipv4_routes(text: str) -> None:
    lines = text.splitlines()
    if not lines or not lines[0].lower().startswith("iface"):
        raise IsolationError("invalid IPv4 route table")
    for line in lines[1:]:
        fields = line.split()
        if len(fields) < 8:
            raise IsolationError("invalid IPv4 route entry")
        if fields[0] != "lo":
            raise IsolationError("external IPv4 route present")
        try:
            destination = ipaddress.IPv4Address(int.from_bytes(bytes.fromhex(fields[1]), "little"))
            gateway = int(fields[2], 16)
            mask_int = int.from_bytes(bytes.fromhex(fields[7]), "little")
            mask_bits = f"{mask_int:032b}"
            if "01" in mask_bits:
                raise ValueError("non-contiguous IPv4 mask")
            prefix = mask_bits.count("1")
            network = ipaddress.IPv4Network((destination, prefix), strict=False)
        except ValueError as exc:
            raise IsolationError("invalid IPv4 route value") from exc
        if gateway != 0 or not network.subnet_of(ipaddress.IPv4Network("127.0.0.0/8")):
            raise IsolationError("non-loopback IPv4 destination present")


def verify_ipv6_routes(text: str) -> None:
    for line in text.splitlines():
        fields = line.split()
        if len(fields) < 10:
            raise IsolationError("invalid IPv6 route entry")
        if fields[-1] != "lo":
            raise IsolationError("external IPv6 route present")
        try:
            destination = ipaddress.IPv6Address(int(fields[0], 16))
            prefix = int(fields[1], 16)
        except ValueError as exc:
            raise IsolationError("invalid IPv6 route value") from exc
        if destination != ipaddress.IPv6Address("::1") or prefix != 128:
            raise IsolationError("non-loopback IPv6 destination present")


def _mount_options(mountinfo: str, mountpoint: str) -> tuple[set[str], set[str]]:
    best = None
    for line in mountinfo.splitlines():
        if " - " not in line:
            continue
        left, right = line.split(" - ", 1)
        fields = left.split()
        if len(fields) < 6 or not (mountpoint == fields[4] or mountpoint.startswith(fields[4].rstrip("/") + "/")):
            continue
        right_fields = right.split()
        if len(right_fields) < 3:
            raise IsolationError(f"invalid mount information for {mountpoint}")
        candidate = (len(fields[4]), set(fields[5].split(",")), set(right_fields[2].split(",")))
        if best is None or candidate[0] > best[0]:
            best = candidate
    if best is not None:
        return best[1], best[2]
    raise IsolationError(f"mount information missing for {mountpoint}")


def check_environment(model_dir: Path | None = None, dataset_root: Path | None = None, temp_root: Path | None = None, proc_root: Path = Path("/proc")) -> None:
    if any(any(token in key.upper() for token in _FORBIDDEN) for key in os.environ):
        raise IsolationError("production/database/storage environment variables are present")
    if os.getenv("DDS_EVALUATION_ISOLATED") != "1":
        raise IsolationError("evaluation must run in the prescribed isolated container")
    if platform.system() != "Linux":
        raise IsolationError("runtime isolation cannot be verified on this host; use the evaluation container")
    verify_ipv4_routes(_read(proc_root, "net/route"))
    verify_ipv6_routes(_read(proc_root, "net/ipv6_route"))
    status = _read(proc_root, "self/status")
    verify_capabilities(status)
    if getattr(os, "geteuid", lambda: -1)() == 0 or "NoNewPrivs:\t1" not in status:
        raise IsolationError("process is not non-root with dropped capabilities and no-new-privileges")
    mountinfo = _read(proc_root, "self/mountinfo")
    root_options, _ = _mount_options(mountinfo, "/")
    if "ro" not in root_options:
        raise IsolationError("root filesystem is not read-only")
    if temp_root is not None:
        temp_options, temp_super = _mount_options(mountinfo, str(Path(temp_root).resolve()))
        if not {"noexec", "nosuid"}.issubset(temp_options | temp_super) or not any(x.startswith("size=") for x in temp_super):
            raise IsolationError("temporary storage is not restricted")
    for path in (model_dir, dataset_root):
        if path is not None:
            options, _ = _mount_options(mountinfo, str(Path(path).resolve()))
            if "ro" not in options:
                raise IsolationError(f"mount is not read-only: {path}")

