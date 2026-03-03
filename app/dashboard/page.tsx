"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CustomUser {
    id: string;
    username: string;
    name?: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [config, setConfig] = useState("{}");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleUpdateConfig = async () => {
        setLoading(true);
        setMessage("");
        try {
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(config);
            } catch {
                setMessage("Invalid JSON format");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/user/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cloudConfig: parsedConfig }),
            });

            if (res.ok) {
                setMessage("Configuration updated successfully!");
            } else {
                setMessage("Failed to update configuration");
            }
        } catch {
            setMessage("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    const user = session?.user as CustomUser | undefined;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-zinc-400">Welcome back, <span className="text-indigo-400">{user?.username}</span></p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                        <h2 className="text-xl font-semibold">Cloud Configuration</h2>
                        <p className="text-zinc-400 text-sm">
                            Manage the JSON configuration that your external loader will fetch upon authentication.
                        </p>
                        <div className="space-y-4">
                            <textarea
                                className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={config}
                                onChange={(e) => setConfig(e.target.value)}
                                placeholder='{ "fov": 90, "esp": true }'
                            />
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${message.includes("success") ? "text-emerald-500" : "text-red-500"}`}>
                                    {message}
                                </span>
                                <button
                                    disabled={loading}
                                    onClick={handleUpdateConfig}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Save Config"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                        <h2 className="text-xl font-semibold">Account Status</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                                <span className="text-zinc-400">Subscription</span>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                                    ACTIVE
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                                <span className="text-zinc-400">HWID Locked</span>
                                <span className="text-zinc-200">Yes</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-zinc-400">Expires In</span>
                                <span className="text-zinc-200">29 Days</span>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700">
                            Extend Subscription
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
