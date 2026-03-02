"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
    const router = useRouter();
    const [data, setData] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await signIn("credentials", {
            ...data,
            redirect: false,
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/panel");
            router.refresh();
        }
    };

    return (
        <div className="w-full relative min-h-screen flex flex-col">
            <div className="bg-noise" />
            <div className="bg-glow-main opacity-50" />

            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium p-10 md:p-14 w-full max-w-md relative overflow-hidden"
                >
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white tracking-tightest uppercase mb-2">Initialize Session</h1>
                        <p className="text-muted-foreground text-sm font-medium">Enter your credentials to access the panel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                                <AlertCircle className="text-red-400" size={18} />
                                <p className="text-red-400 text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    placeholder="operator@voidhook.cc"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 mt-8 flex justify-center"
                        >
                            {loading ? "AUTHENTICATING..." : (
                                <>LOGIN TO PANEL <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            Don't have a license? <Link href="/register" className="text-primary hover:text-white transition-colors font-bold">Register here</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
