"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, User, Shield, Terminal } from "lucide-react";

export default function PanelPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full relative min-h-screen flex flex-col pt-32 pb-64 px-6 md:px-12">
            <div className="bg-noise" />
            <div className="bg-glow-main opacity-30" />

            <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-8 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tightest uppercase mb-2">OPERATOR PANEL</h1>
                        <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Connected securely via void_protocol
                        </p>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-3 px-6 py-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-bold text-xs tracking-widest uppercase"
                    >
                        <LogOut size={16} /> Close Session
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-premium p-8 h-full flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/30">
                                <User size={24} className="text-primary" />
                            </div>
                            <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Active Identity</h3>
                            <p className="text-2xl font-black text-white tracking-tightest mb-1 truncate">{session?.user?.name || "Operator"}</p>
                            <p className="text-muted-foreground text-xs truncate">{session?.user?.email}</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] font-black tracking-widest text-primary uppercase">Status: VIP Verified</p>
                        </div>
                    </motion.div>

                    {/* Licenses Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-premium p-8 h-full flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                                <Shield size={24} className="text-emerald-500" />
                            </div>
                            <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Active Licenses</h3>
                            <p className="text-2xl font-black text-white tracking-tightest">0</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">No active subscriptions found.</p>
                        </div>
                    </motion.div>

                    {/* System Terminal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-premium p-8 h-full flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div>
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                <Terminal size={24} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-4">System Log</h3>
                            <div className="font-mono text-[10px] text-muted-foreground space-y-2">
                                <p className="text-emerald-400">] CONNECTION ESTABLISHED</p>
                                <p>] AUTH KEY VALIDATED</p>
                                <p>] WAITING FOR GAME CLIENT...</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
