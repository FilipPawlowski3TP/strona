"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Eye,
    ShieldCheck,
    Zap,
    Cloud,
    Cpu,
    ChevronRight
} from "lucide-react";

const cheatFeatures = [
    {
        title: "Silent Precision",
        description: "External aimbot with advanced smoothing and field-of-view controls for invisible dominance.",
        icon: Target,
    },
    {
        title: "Vivid ESP",
        description: "Highly optimized skeletal visuals with weapon, item, and utility tracking for absolute awareness.",
        icon: Eye,
    },
    {
        title: "Kernel Stealth",
        description: "Advanced driver-level protection designed to stay under the radar of the most aggressive anti-cheats.",
        icon: ShieldCheck,
    },
    {
        title: "Instant Latency",
        description: "Optimized multi-threaded execution ensuring zero performance impact on your game's frame rate.",
        icon: Zap,
    },
    {
        title: "Cloud Configs",
        description: "Save and share your settings instantly through our distributed cloud infrastructure.",
        icon: Cloud,
    },
    {
        title: "Zero-Trace",
        description: "Purely external software logic with no process modification or memory writing for maximum safety.",
        icon: Cpu,
    },
];

const FeatureCard = ({ feature }: { feature: typeof cheatFeatures[0] }) => {
    const boundingRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!boundingRef.current) return;
        const { left, top } = boundingRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        boundingRef.current.style.setProperty("--mouse-x", `${x}px`);
        boundingRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <motion.div
            ref={boundingRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-premium group"
        >
            <div className="icon-glow-wrapper mb-8">
                <feature.icon size={28} />
            </div>

            <h3 className="text-2xl font-black text-white mb-4 tracking-tightest uppercase leading-tight">
                {feature.title}
            </h3>

            <p className="text-muted-foreground leading-relaxed mb-8 text-lg font-medium">
                {feature.description}
            </p>

            <div className="flex items-center text-xs font-black tracking-widest text-primary group-hover:gap-2 transition-all cursor-pointer uppercase">
                ANALYZE PARAMETERS <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </motion.div>
    );
};

export const Features = () => {
    return (
        <section id="features" className="py-32 w-full max-w-7xl relative mx-auto px-6">
            <div className="text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase mb-6"
                >
                    <Zap size={10} className="fill-primary" />
                    <span>Technical Superiority</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black tracking-tightest text-white mb-8 uppercase leading-none"
                >
                    PREMIER <span className="text-glow-accent italic">CAPABILITIES</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium"
                >
                    Engineered for performance. Optimized for discretion.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cheatFeatures.map((feature, index) => (
                    <FeatureCard key={index} feature={feature} />
                ))}
            </div>
        </section>
    );
};
