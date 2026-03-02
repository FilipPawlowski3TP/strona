"use client";

import React from "react";
import { Terminal, Shield, Github, Twitter } from "lucide-react";
import Link from "next/link";


export const Footer = () => {
    return (
        <footer className="py-24 w-full relative overflow-hidden mt-32 border-t border-white/5 bg-white/[0.01]">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-8 group">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-300">
                                <Terminal size={22} className="text-primary" />
                            </div>
                            <span className="text-xl font-black tracking-tightest uppercase text-white">
                                VOID<span className="text-primary italic">HOOK</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm text-lg font-medium leading-relaxed">
                            Engineering the foundation of the unseen realm. High-performance primitives for modern infrastructure.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-black tracking-widest uppercase text-white mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            {["Features", "Protocol", "Network", "Security"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black tracking-widest uppercase text-white mb-8">Social Connect</h4>
                        <div className="flex gap-6">
                            {[Twitter, Github, Shield].map((Icon, i) => (
                                <Link key={i} href="#" className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                                    <Icon size={20} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-40">
                        © 2024 VOIDHOOK CORE // ALL RIGHTS RESERVED
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_hsla(180,100%,50%,0.8)]" />
                            SYSTEM_STATUS: <span className="text-primary">ONLINE</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-30">
                            BUILD_V: 2.0.4-BETA
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Gradient Accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </footer>
    );
};
