"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2, Copy, ExternalLink, Users } from "lucide-react";

interface RadarSession {
    id: string;
    share_code: string;
    map_name: string;
    created_at: string;
    expires_at: string;
}

export default function RadarDashboardPage() {
    const { status } = useSession();
    const router = useRouter();

    const [sessions, setSessions] = useState<RadarSession[]>([]);
    const [creating, setCreating] = useState(false);
    const [mapName, setMapName] = useState("");
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchSessions();
        }
    }, [status, router]);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/radar");
            const data = await res.json();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const createSession = async () => {
        setCreating(true);
        try {
            const res = await fetch("/api/radar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ mapName: mapName || "Unknown" })
            });
            const data = await res.json();
            if (data.success) {
                fetchSessions();
                setMapName("");
            }
        } catch (err) {
            console.error("Failed to create session:", err);
        }
        setCreating(false);
    };

    const deleteSession = async (id: string) => {
        if (!confirm("Are you sure you want to delete this session?")) return;

        try {
            const res = await fetch(`/api/radar/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                fetchSessions();
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    const copyShareLink = (shareCode: string) => {
        const link = `${window.location.origin}/radar/${shareCode}`;
        navigator.clipboard.writeText(link);
        alert("Share link copied!");
    };

    const openRadar = (shareCode: string) => {
        window.open(`/radar/${shareCode}`, "_blank");
    };

    if (status === "loading" || loadingSessions) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="text-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <MapPin className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Web <span className="text-indigo-400">Radar</span>
                            </h1>
                            <p className="text-zinc-500 font-medium mt-1">
                                Create and manage your live radar sessions
                            </p>
                        </div>
                    </div>
                </header>

                {/* Create Session */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl space-y-6">
                    <h2 className="text-xl font-bold tracking-tight">Create Session</h2>
                    <p className="text-zinc-400 text-sm">
                        Create a radar session to share your game view with others. They can see player positions and health in real-time.
                    </p>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            placeholder="Map name (optional)"
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                            onClick={createSession}
                            disabled={creating}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={20} />
                            {creating ? "Creating..." : "Create Session"}
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl">
                    <h3 className="font-bold text-indigo-400 mb-3 flex items-center gap-2">
                        How to Use
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-zinc-400 text-sm">
                        <li>Create a radar session above.</li>
                        <li>Copy the <strong className="text-zinc-200">Session ID</strong> and paste it in the cheat's radar settings.</li>
                        <li>Share the link with friends so they can view the radar.</li>
                        <li>The radar updates in real-time as you play.</li>
                    </ol>
                </div>

                {/* Active Sessions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight pt-4">Active Sessions</h2>

                    {sessions.length === 0 ? (
                        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-12 text-center">
                            <Users className="mx-auto text-zinc-600 mb-4" size={48} />
                            <p className="text-zinc-500 font-medium">No active sessions. Create one to get started!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {sessions.map((session) => (
                                <div key={session.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 transition-all hover:bg-zinc-900/60">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                                                    ACTIVE
                                                </span>
                                                <span className="text-white font-bold">
                                                    Share Code: <span className="text-indigo-400 font-mono">{session.share_code}</span>
                                                </span>
                                            </div>
                                            <p className="text-zinc-500 text-sm">
                                                Map: {session.map_name} • Created: {new Date(session.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openRadar(session.share_code)}
                                                className="p-2.5 bg-zinc-800 hover:bg-indigo-600 rounded-xl transition-all text-zinc-300 hover:text-white"
                                                title="Open Radar"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button
                                                onClick={() => copyShareLink(session.share_code)}
                                                className="p-2.5 bg-zinc-800 hover:bg-indigo-600 rounded-xl transition-all text-zinc-300 hover:text-white"
                                                title="Copy Share Link"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteSession(session.id)}
                                                className="p-2.5 bg-zinc-800 hover:bg-red-500/80 rounded-xl transition-all text-zinc-300 hover:text-white"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Session ID (for cheat settings):</p>
                                        <code className="text-indigo-400 text-sm font-mono break-all bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                            {session.id}
                                        </code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
