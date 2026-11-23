from __future__ import annotations

import os
import platform


class IsolationError(RuntimeError):
    pass


_FORBIDDEN = ("DATABASE_URL", "R2", "REDIS", "BULLMQ", "SUPABASE", "PRISMA")


def check_environment() -> None:
    present = [key for key in os.environ if any(token in key.upper() for token in _FORBIDDEN)]
    if present:
        raise IsolationError("production/database/storage environment variables are present")
    if os.getenv("DDS_EVALUATION_ISOLATED") != "1":
        raise IsolationError("evaluation must run in the prescribed isolated container")
    if platform.system() != "Linux":
        raise IsolationError("runtime isolation cannot be verified on this host; use the evaluation container")
    try:
        routes = open("/proc/net/route", encoding="utf-8").read().splitlines()[1:]
        non_loopback_routes = [line for line in routes if line.split()[1] != "00000000" or line.split()[0] != "lo"]
        if non_loopback_routes:
            raise IsolationError("network namespace has non-loopback routes; require --network none")
        root_mount = next(line for line in open("/proc/self/mountinfo", encoding="utf-8") if " - " in line and " / " in line.split(" - ", 1)[0])
        mount_options = root_mount.split(" - ", 1)[0].split(" ")[5].split(",")
        if "ro" not in mount_options:
            raise IsolationError("root filesystem is not read-only")
    except (OSError, StopIteration, IndexError, ValueError) as exc:
        raise IsolationError("unable to verify container isolation") from exc

