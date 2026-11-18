
"use client";

import {
    Bell,
    Camera,
    ChartNoAxesCombined,
    HardDrive,
    Image as ImageIcon,
    Images,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    ScrollText,
    Settings,
    ShieldCheck,
    Sun, Users,
    X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/features/admin/server/actions";

const navigation = [
    {
        label: "WORKSPACE",
        items: [
            { name: "Overview", href: "/admin", icon: LayoutDashboard },
            { name: "Galleries", href: "/admin/galleries", icon: Images },
            { name: "Photos & Media", href: "/admin/media", icon: ImageIcon },
        ],
    },
    {
        label: "INSIGHTS",
        items: [
            { name: "Visitors", href: "/admin/visitors", icon: Users },
            { name: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
        ],
    },
    {
        label: "SYSTEM",
        items: [
            { name: "Storage", href: "/admin/storage", icon: HardDrive },
            { name: "Audit Logs", href: "/admin/audit", icon: ScrollText },
            { name: "Security", href: "/admin/security", icon: ShieldCheck },
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ],
    },
];

export function AdminShell({ children }) {

    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("dds-admin-theme");

        if (savedTheme === "dark") {
            document.documentElement.dataset.adminTheme = "dark";
        } else {
            document.documentElement.dataset.adminTheme = "light";
        }

        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("dds-admin-theme", theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((current) => current === "light" ? "dark" : "light");
    };

    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!mounted || pathname === "/admin/login") return children;

    const currentPage = navigation
        .flatMap((group) => group.items)
        .find((item) => item.href === pathname);

    return (
        <div className="admin-shell" data-theme={theme}>
            {menuOpen && (
                <button
                    className="admin-overlay"
                    aria-label="Close navigation"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
                <Link href="/admin" className="admin-brand">
                    <span className="admin-brand-icon">
                        <Camera size={21} />
                    </span>
                    <span>
                        <strong>DDS Photographer</strong>
                        <small>STUDIO MANAGEMENT</small>
                    </span>
                    <button
                        type="button"
                        className="admin-close-menu"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </Link>

                <nav className="admin-navigation">
                    {navigation.map((group) => (
                        <div className="admin-nav-group" key={group.label}>
                            <p className="admin-nav-label">{group.label}</p>

                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/admin" &&
                                        pathname.startsWith(`${item.href}/`));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={`admin-nav-link ${active ? "active" : ""}`}
                                    >
                                        <Icon size={18} strokeWidth={1.8} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-profile">
                        <span className="admin-avatar">D</span>
                        <span>
                            <strong>Studio Admin</strong>
                            <small>Administrator</small>
                        </span>
                    </div>

                    <form action={logout}>
                        <button className="admin-logout" type="submit">
                            <LogOut size={17} />
                            Log out
                        </button>
                    </form>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-menu-button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={21} />
                        </button>

                        <div>
                            <p className="admin-breadcrumb">DDS PHOTOGRAPHER / ADMIN</p>
                            <h1>{currentPage?.name || "Admin workspace"}</h1>
                        </div>
                    </div>

                    <div className="admin-topbar-actions">

                        <span className="admin-status">
                            <span />
                            Studio workspace
                        </span>
                        <button
                            type="button"
                            className="admin-icon-button"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        >
                            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
                        </button>
                        <button
                            className="admin-icon-button"
                            aria-label="Notifications"
                            type="button"
                        >
                            <Bell size={19} />
                        </button>
                    </div>
                </header>

                <main className="admin-content">{children}</main>
            </div>
        </div>
    );
}
