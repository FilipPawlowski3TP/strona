"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Games", href: "#games" },
        { name: "Features", href: "#features" },
        { name: "FAQ", href: "#faq" },
        { name: "Forum", href: "https://forum.voidhook.tech" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
                    ? "bg-zinc-950/80 backdrop-blur-xl border-white/5 py-3"
                    : "bg-transparent border-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            VOID<span className="text-indigo-500">HOOK</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center space-x-4">
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="group flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                                >
                                    <span>Register</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`
                absolute top-full left-0 right-0 bg-zinc-950 border-b border-zinc-800 transition-all duration-300 md:hidden
                ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
            `}>
                <div className="flex flex-col p-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium text-zinc-400 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 flex flex-col space-y-3">
                        {session ? (
                            <>
                                <Link href="/dashboard" className="text-zinc-400" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                <button
                                    onClick={() => {
                                        signOut({ callbackUrl: "/login" });
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="py-3 text-center text-zinc-400 font-bold" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link
                                    href="/register"
                                    className="w-full py-3 bg-indigo-600 text-white text-center rounded-xl font-bold flex items-center justify-center space-x-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span>Register</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
