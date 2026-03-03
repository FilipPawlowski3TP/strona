"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Terminal, ChevronRight } from "lucide-react";

export function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const navigation = [
        { name: "Home", href: "/" },
        ...(session ? [{ name: "Dashboard", href: "/dashboard" }] : []),
        ...(!session ? [
            { name: "Login", href: "/login" },
            { name: "Register", href: "/register" }
        ] : [])
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                <Terminal className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                                VOID<span className="text-indigo-500">HOOK</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-zinc-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {session && (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="text-zinc-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 block px-4 py-3 rounded-md text-base font-medium flex items-center justify-between"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ))}
                        {session && (
                            <button
                                onClick={() => {
                                    signOut({ callbackUrl: "/login" });
                                    setIsOpen(false);
                                }}
                                className="w-full text-left text-zinc-400 hover:text-white hover:bg-zinc-800 block px-4 py-3 rounded-md text-base font-medium flex items-center justify-between"
                            >
                                Logout
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
