"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";

export const Hero = () => {
    return (
        <section id="hero" className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* Localized Hero Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
            </div>

            <div className="container relative z-10 mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase mb-8"
                >
                    <Zap size={10} className="fill-primary" />
                    <span>Premier CS2 External Protocol</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-8xl heading-hero mb-8 max-w-5xl mx-auto"
                >
                    DOMINATE THE <br />
                    <span className="text-glow-accent">PREMIER</span> <span className="italic">REALM.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                >
                    Undetectable. Humanized. Absolute Control. <br />
                    Engineered for the competitive elite who demand the best.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <button className="btn-primary group">
                        INITIALIZE LICENSE
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="btn-secondary">
                        JOIN COMMUNITY
                    </button>
                </motion.div>
            </div>

            {/* Hero Decorative Bottom Transition */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-10" />
        </section>
    );
};
