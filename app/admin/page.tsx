"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    ShieldAlert,
    RefreshCw,
    UserMinus,
    Calendar,
    Search,
    Loader2,
    Lock,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Save
} from "lucide-react";

interface AdminUser {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
    hwid: string | null;
    subscription_expires_at: string;
    createdAt: string;
}

export default function AdminPanel() {
    const [adminKey, setAdminKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [daysToAdd, setDaysToAdd] = useState<{ [key: string]: number }>({});

    const fetchUsers = async (key: string) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                headers: { "x-admin-key": key }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                setIsAuthenticated(true);
                sessionStorage.setItem("void_admin_key", key);
            } else {
                setMessage({ type: "error", text: "Invalid Admin Key" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Connection failed" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const savedKey = sessionStorage.getItem("void_admin_key");
        if (savedKey) {
            setAdminKey(savedKey);
            fetchUsers(savedKey);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(adminKey);
    };

    const handleAction = async (endpoint: string, method: string, body: any) => {
        try {
            const res = await fetch(`/api/admin/${endpoint}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": adminKey
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                fetchUsers(adminKey); // Refresh local state
                router.refresh();    // Refresh server data
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Action failed" });
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <ShieldAlert className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Admin <span className="text-indigo-500 text-glow">Access</span>
                        </h1>
                        <p className="text-zinc-500 font-medium">Restricted zone. Provide authorization key.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
                                placeholder="Enter Admin Password..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {message.text && (
                        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm font-bold ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                            {message.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                            <p>{message.text}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 lg:p-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Control <span className="text-indigo-500 text-glow">Panel</span>
                        </h1>
                        <p className="text-zinc-500 mt-3 font-medium flex items-center space-x-2">
                            <Users size={16} />
                            <span>Managing {users.length} registered users</span>
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by username or email..."
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem("void_admin_key");
                                window.location.reload();
                            }}
                            className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 font-bold text-sm"
                            title="Logout Admin"
                        >
                            <Lock size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                        <div className="flex items-center space-x-3">
                            {message.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                            <p>{message.text}</p>
                        </div>
                        <button onClick={() => setMessage({ type: "", text: "" })} className="opacity-50 hover:opacity-100">
                            <XCircle size={14} />
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">User Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Hardware ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Subscription</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((u) => {
                                    const expiryDate = new Date(u.subscription_expires_at);
                                    const isExpired = expiryDate < new Date();

                                    return (
                                        <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 overflow-hidden flex-shrink-0 relative">
                                                        <img
                                                            src={u.avatar_url ? (u.avatar_url.startsWith('http') || u.avatar_url.startsWith('/cdn/') ? u.avatar_url : `/cdn${u.avatar_url}`) : `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white tracking-tight">{u.username}</p>
                                                        <p className="text-xs text-zinc-500 font-medium truncate max-w-[150px]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {u.hwid ? (
                                                    <div className="flex items-center space-x-3">
                                                        <code className="text-[10px] bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/5 text-zinc-400 font-mono">
                                                            {u.hwid.slice(0, 8)}...
                                                        </code>
                                                        <button
                                                            onClick={() => handleAction("reset-hwid", "POST", { userId: u.id })}
                                                            className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
                                                            title="Reset HWID"
                                                        >
                                                            <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Available</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                                                        <p className={`text-xs font-bold ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                                                            {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] font-mono text-zinc-500 uppercase">
                                                        {expiryDate.toLocaleDateString()} @ {expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <div className="flex items-center bg-zinc-950 border border-white/5 rounded-xl px-2 py-1 focus-within:border-indigo-500/50 transition-all">
                                                        <Calendar size={14} className="text-zinc-600 mr-2" />
                                                        <input
                                                            type="number"
                                                            placeholder="Days"
                                                            className="w-12 bg-transparent text-xs font-bold text-white focus:outline-none"
                                                            value={daysToAdd[u.id] || ""}
                                                            onChange={(e) => setDaysToAdd({ ...daysToAdd, [u.id]: parseInt(e.target.value) })}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const days = daysToAdd[u.id];
                                                                if (!days || days <= 0) return;
                                                                handleAction("update-days", "POST", { userId: u.id, days });
                                                                setDaysToAdd({ ...daysToAdd, [u.id]: 0 }); // Clear input
                                                            }}
                                                            className="p-1 text-indigo-500 hover:text-indigo-400 transition-colors ml-1 disabled:opacity-30"
                                                            disabled={!daysToAdd[u.id] || daysToAdd[u.id] <= 0}
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Delete this user permanently?")) {
                                                                handleAction("delete-user", "DELETE", { userId: u.id });
                                                            }
                                                        }}
                                                        className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                                        title="Delete User"
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 italic font-medium">
                                            No users found matching your search...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2rem]">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">VoidHook Secure Admin Infrastructure v2.4</p>
                    <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span>System Online</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .text-glow {
                    text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
                }
            `}</style>
        </div>
    );
}
