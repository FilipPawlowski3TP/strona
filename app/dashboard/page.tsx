"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Shield, CreditCard, Clock, LogOut } from "lucide-react";

interface CustomUser {
    id: string;
    username: string;
    email: string;
    name?: string;
    avatar_url?: string;
    subscription_expires_at?: string | Date;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    const user = session?.user as CustomUser | undefined;

    return (
        <div className="text-white p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 overflow-hidden">
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=6366f1&color=fff`}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=6366f1&color=fff`;
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Welcome, <span className="text-indigo-400">{user?.username}</span>
                            </h1>
                            <p className="text-zinc-500 font-mono text-sm mt-1">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-xl transition-all border border-zinc-700/50"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </header>

                {/* Account Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Subscription Status */}
                    <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center space-x-3 text-indigo-400">
                            <Shield className="w-5 h-5" />
                            <h2 className="text-lg font-bold uppercase tracking-wider">Account Status</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-zinc-500 font-medium">Subscription</span>
                                {(() => {
                                    if (!user?.subscription_expires_at) return <span className="px-4 py-1.5 bg-zinc-500/10 text-zinc-500 rounded-full text-xs font-black border border-zinc-500/20 tracking-widest">UNKNOWN</span>;
                                    const expiresAt = new Date(user.subscription_expires_at);
                                    const isExpired = new Date() > expiresAt;

                                    return isExpired ? (
                                        <span className="px-4 py-1.5 bg-red-500/10 text-red-500 rounded-full text-xs font-black border border-red-500/20 tracking-widest">
                                            EXPIRED
                                        </span>
                                    ) : (
                                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black border border-emerald-500/20 tracking-widest">
                                            ACTIVE
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-zinc-500 font-medium">Plan Type</span>
                                <span className="text-white font-bold">Premium Access</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <div className="flex items-center space-x-2 text-zinc-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">Status</span>
                                </div>
                                {(() => {
                                    if (!user?.subscription_expires_at) return <span className="text-zinc-400 font-black">UNKNOWN</span>;
                                    const expiresAt = new Date(user.subscription_expires_at);
                                    const now = new Date();
                                    const diffTime = Math.max(0, expiresAt.getTime() - now.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    return diffDays > 0 ? (
                                        <span className="text-indigo-400 font-black">{diffDays} DAYS</span>
                                    ) : (
                                        <span className="text-red-500 font-black">EXPIRED</span>
                                    );
                                })()}
                            </div>
                        </div>

                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                            Extend Access
                        </button>
                    </div>

                    {/* Quick Support / Info */}
                    <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl space-y-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-3 text-indigo-400">
                                <CreditCard className="w-5 h-5" />
                                <h2 className="text-lg font-bold uppercase tracking-wider">Billing</h2>
                            </div>
                            <p className="mt-4 text-zinc-500 text-sm leading-relaxed">
                                Manage your payment methods and view recent transactions. Your next billing date is April 2nd, 2026.
                            </p>
                        </div>

                        <div className="space-y-3 pt-6">
                            <button className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl border border-white/5 transition-all text-sm">
                                View Billing History
                            </button>
                            <button className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl border border-white/5 transition-all text-sm">
                                Change Payment Method
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pro-Tip / Footer info */}
                <div className="bg-indigo-600/5 border border-indigo-500/10 p-6 rounded-3xl text-center">
                    <p className="text-sm text-zinc-400">
                        Need help? Join our <Link href="#" className="text-indigo-400 hover:underline font-bold">Discord Community</Link> or check the <Link href="#" className="text-indigo-400 hover:underline font-bold">Forum</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
