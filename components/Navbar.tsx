"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal, User } from "lucide-react";
import { useSession } from "next-auth/react";

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Protocol", href: "#hero" },
    { name: "FAQ", href: "#faq" },
    { name: "Documentation", href: "#" },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
                ? "py-4 bg-background/80 backdrop-blur-xl border-white/5"
                : "py-6 bg-transparent border-transparent"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-300">
                        <Terminal size={22} className="text-primary" />
                    </div>
                    <span className="text-xl font-black tracking-tightest uppercase text-white">
                        VOID<span className="text-primary italic">HOOK</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-xs font-black tracking-widest text-muted-foreground hover:text-primary transition-all duration-200 uppercase"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {status === "loading" ? (
                        <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
                    ) : session ? (
                        <Link href="/panel" className="btn-primary px-6 py-2.5 text-xs tracking-widest flex items-center gap-2">
                            <User size={14} /> OPERATOR_PANEL
                        </Link>
                    ) : (
                        <Link href="/login" className="btn-primary px-6 py-2.5 text-xs tracking-widest">
                            INITIALIZE ACCESS
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-white/5 p-6 flex flex-col gap-6 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-black tracking-widest text-white uppercase"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {status === "loading" ? (
                            <div className="w-full h-12 bg-white/5 rounded-lg animate-pulse" />
                        ) : session ? (
                            <Link href="/panel" className="btn-primary w-full py-4 tracking-widest flex justify-center items-center gap-2">
                                <User size={18} /> OPERATOR_PANEL
                            </Link>
                        ) : (
                            <Link href="/login" className="btn-primary w-full py-4 tracking-widest flex justify-center">
                                INITIALIZE ACCESS
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
