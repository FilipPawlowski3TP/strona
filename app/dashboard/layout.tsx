"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    Radar,
    LogOut,
    ChevronRight
} from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Web Radar", href: "/dashboard/radar", icon: Radar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-zinc-950 pt-20">
            {/* Sidebar */}
            <aside className="fixed left-0 top-20 bottom-0 w-64 bg-zinc-900/20 border-r border-white/5 backdrop-blur-xl hidden md:flex flex-col p-6 z-40">
                <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-3 mb-4">
                        Navigation
                    </p>
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                                    ${isActive
                                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <link.icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                                    <span className="text-sm font-bold">{link.name}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </Link>
                        );
                    })}
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-bold">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative">
                {children}
            </main>
        </div>
    );
}
