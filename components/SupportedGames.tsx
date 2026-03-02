"use client";

import React from "react";
import { motion } from "framer-motion";
import { Monitor, Cpu, CheckCircle2 } from "lucide-react";

const games = [
    {
        id: "cs2-external",
        title: "CS2 External",
        status: "Available now",
        type: "EXTERNAL",
        image: "/assets/cs2_external_cover.png",
        color: "hsl(180, 100%, 50%)", // Cyan
        icon: Monitor,
        available: true,
    },
    {
        id: "cs2-internal",
        title: "CS2 Internal",
        status: "Coming soon",
        type: "INTERNAL",
        image: "/assets/cs2_internal_cover.png",
        color: "hsl(270, 70%, 60%)", // Purple
        icon: Cpu,
        available: false,
    },
];

interface SupportedGamesProps {
    onSelectGame: (id: string) => void;
}

export const SupportedGames = ({ onSelectGame }: SupportedGamesProps) => {
    return (
        <section id="games" className="py-32 w-full max-w-7xl relative mx-auto px-6">
            <div className="text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase mb-6"
                >
                    <CheckCircle2 size={10} className="fill-primary" />
                    <span>Game Selection</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black tracking-tightest text-white mb-8 uppercase leading-none"
                >
                    SUPPORTED <span className="text-glow-accent italic">GAMES</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium"
                >
                    Elevate your performance in your favorite games.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {games.map((game, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => game.available && onSelectGame(game.id)}
                        className={`group relative h-[600px] rounded-[2rem] overflow-hidden border border-white/5 bg-black/40 transition-all duration-500 ${game.available ? 'cursor-pointer hover:border-primary/40 hover:shadow-[0_0_50px_rgba(0,242,255,0.1)]' : 'opacity-60 grayscale'}`}
                    >
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                            <img
                                src={game.image}
                                alt={game.title}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500"
                            />
                            <div
                                className="absolute inset-0 mix-blend-overlay opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                                style={{ background: `linear-gradient(to bottom, transparent, ${game.color})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 z-10 p-12 flex flex-col justify-end">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-5xl font-black text-white tracking-tightest uppercase group-hover:text-glow-accent transition-all duration-300">
                                    {game.title}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full animate-pulse"
                                        style={{ backgroundColor: game.status === "Coming soon" ? "hsl(45, 100%, 50%)" : "hsl(142, 70%, 50%)" }}
                                    />
                                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest opacity-80">
                                        {game.status}
                                    </span>
                                </div>

                                <div
                                    className="flex items-center gap-3 px-6 py-2.5 rounded-xl border bg-black/60 backdrop-blur-md transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/30"
                                    style={{ borderColor: `${game.color}20` }}
                                >
                                    <game.icon size={18} style={{ color: game.color }} />
                                    <span className="text-xs font-black text-white tracking-widest uppercase">
                                        {game.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
