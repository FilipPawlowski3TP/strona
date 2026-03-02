"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ChevronRight,
    Target,
    Eye,
    Layers,
    PlusCircle,
    Zap,
    ArrowLeft
} from "lucide-react";

interface ProductDetailProps {
    onBack: () => void;
}

export const ProductDetail = ({ onBack }: ProductDetailProps) => {
    return (
        <div className="w-full relative min-h-screen bg-transparent pt-32 pb-64">
            <div className="container mx-auto px-6">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors mb-12 font-black tracking-widest uppercase text-xs"
                >
                    <ArrowLeft size={16} /> RETURN_TO_NODE
                </motion.button>

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-7xl md:text-9xl font-black tracking-tightest text-white uppercase mb-8">
                            CS2
                        </h1>

                        <div className="pl-6 border-l-4 border-primary/40 mb-12">
                            <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                                Dominate the battlefield with our advanced & secure external for Counter-Strike 2.
                                Designed for precise, legit gameplay. Take control of every match.
                            </p>
                        </div>

                        {/* System Requirements Card */}
                        <div className="card-premium p-10 max-w-lg">
                            <h3 className="text-xs font-black tracking-widest text-white uppercase mb-8 opacity-40">SYSTEM_REQUIREMENTS</h3>
                            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-2">Status</p>
                                    <p className="text-emerald-400 font-black tracking-tightest uppercase flex items-center gap-2 text-lg">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Undetected
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-2">OS</p>
                                    <p className="text-white font-black tracking-tightest uppercase text-lg">Windows 10/11</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-2">CPU</p>
                                    <p className="text-white font-black tracking-tightest uppercase text-lg">Intel, AMD</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-12">
                            <button
                                onClick={() => {
                                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="btn-primary"
                            >
                                GO TO PRICES <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('features-detail')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="btn-secondary"
                            >
                                VIEW FEATURES <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Media Module */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-black/40 group"
                    >
                        <img
                            src="/assets/cs2_gameplay.png"
                            alt="Gameplay Demo"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-primary border-b-[10px] border-b-transparent ml-1" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Category Grid */}
                <section id="features-detail" className="pt-32 mb-64">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase mb-6">
                            <Layers size={10} className="fill-primary" />
                            <span>Feature Stack</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tightest text-white uppercase mb-4">
                            View a range of <span className="text-glow-accent italic">our features</span>
                        </h2>
                        <p className="text-muted-foreground text-xl font-medium">All features are fully streamproof and external</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { title: "Aimbot", icon: Target, items: ["Dynamic Weapon Configs", "Hitbox Selection", "Visibility Check", "Recoil Control", "Dynamic FOV"] },
                            { title: "Visuals", icon: Eye, items: ["Player ESP", "C4 Information", "Health Bar", "Skeletons", "Radar"] },
                            { title: "Miscellaneous", icon: Zap, items: ["Spectator List", "Auto Accept", "Kill Sounds", "Bunny Hop", "Sonar"] },
                            { title: "Other", icon: PlusCircle, items: ["Grenade Helper", "Config System", "Stream Proof", "Knife Bot", "Zeus Bot"] },
                        ].map((cat, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 text-primary shadow-[0_0_20px_rgba(0,242,255,0.1)]">
                                    <cat.icon size={28} />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tightest uppercase mb-8">{cat.title}</h4>
                                <ul className="space-y-4">
                                    {cat.items.map((item, i) => (
                                        <li key={i} className="text-muted-foreground text-sm font-black tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-primary transition-all cursor-crosshair">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing Table */}
                <section id="pricing" className="pt-32">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase mb-6">
                            <Zap size={10} className="fill-primary" />
                            <span>Deployment Tier</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tightest text-white uppercase mb-4">
                            SECURE <span className="text-glow-accent italic">SUBSCRIPTION</span>
                        </h2>
                        <p className="text-muted-foreground text-xl font-medium">Select the desired deployment duration below.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { duration: "30 Days", price: "$12", popular: false },
                            { duration: "90 Days", price: "$32", popular: true },
                            { duration: "180 Days", price: "$60", popular: false },
                        ].map((plan, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className={`card-premium p-12 text-center flex flex-col relative ${plan.popular ? 'border-primary/40 shadow-[0_0_50px_rgba(0,242,255,0.15)]' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-6 right-8 px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black tracking-widest uppercase">
                                        POPULAR
                                    </div>
                                )}
                                <h3 className="text-2xl font-black text-white tracking-tightest uppercase mb-6">CS2 External {plan.duration}</h3>
                                <div className="text-6xl font-black text-white tracking-tightest mb-4">{plan.price}</div>
                                <p className="text-muted-foreground text-sm font-medium mb-12">
                                    {plan.duration.replace(' Days', '')}-day license to our Counter-Strike 2 software.
                                </p>
                                <button className="btn-primary w-full py-5 text-sm tracking-widest">
                                    LOGIN TO PURCHASE <ChevronRight size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
