"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Link as LinkIcon, Upload, Loader2, Save } from "lucide-react";

interface CustomUser {
    id: string;
    username: string;
    email: string;
    name?: string;
    avatar_url?: string;
}

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const user = session?.user as CustomUser | undefined;

    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (user) {
            setEmail(user.email || "");
            setAvatarUrl(user.avatar_url || "");
        }
    }, [status, router, user]);

    if (status === "loading" || !user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            </div>
        );
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setMessage({ type: "", text: "" });

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/user/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setAvatarUrl(data.avatar_url);
            setMessage({ type: "success", text: "Avatar uploaded successfully! Click 'Save Changes' to permanently apply it to your profile." });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    avatarUrl: avatarUrl
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            // Force NextAuth session refresh
            await update({
                email,
                avatar_url: avatarUrl
            });

            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="text-white p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Profile <span className="text-indigo-500 text-glow">Settings</span>
                        </h1>
                        <p className="text-zinc-500 mt-3 font-medium">Configure your identity and account credentials.</p>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Session</span>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-2xl border flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${message.type === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                        <p className="text-sm font-bold">{message.text}</p>
                    </div>
                )}

                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl space-y-8 backdrop-blur-sm">
                    {/* Avatar Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/5">
                        <div className="w-32 h-32 bg-indigo-600/20 rounded-full flex items-center justify-center border-2 border-indigo-500/30 overflow-hidden relative group">
                            {avatarUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-indigo-400" />
                            )}
                            <div
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Profile Picture</h3>
                                <p className="text-sm text-zinc-500">Upload a custom avatar or provide a direct URL.</p>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/png, image/jpeg"
                                className="hidden"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    <span>Upload Image</span>
                                </button>

                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="Or paste an image URL..."
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono placeholder:font-sans"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-300">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isLoading || isUploading}
                        className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
