"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, MapPin, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const ASSETS_BASE_URL = '/uploads/radar';
const CDN_BASE_URL = 'https://raw.githubusercontent.com/NaraNaraa/cs2radarmap/main/maps';

const MAPS: Record<string, any> = {
    'de_dust2': { width: 1024, height: 1024, offsetX: -2470, offsetY: 3250.6, scale: 4.4, image: 'de_dust2_radar_psd.png' },
    'de_mirage': { width: 1024, height: 1024, offsetX: -3240, offsetY: 1730.5, scale: 5.02, image: 'de_mirage_radar_psd.png' },
    'de_inferno': { width: 1024, height: 1024, offsetX: -2090, offsetY: 3877.8, scale: 4.91, image: 'de_inferno_radar_psd.png' },
    'de_overpass': { width: 1024, height: 1024, offsetX: -4830, offsetY: 1764.3, scale: 5.18, image: 'de_overpass_radar_psd.png' },
    'de_nuke': {
        width: 1024, height: 1024, offsetX: -3290, offsetY: 1157.5, scale: 6.98, image: 'de_nuke_radar_psd.png',
        splits: [{ zMin: -3000, zMax: -480, offsetX: 0, offsetY: 46 }]
    },
    'de_vertigo': {
        width: 1024, height: 1024, offsetX: -3890, offsetY: 1279.0, scale: 4.96, image: 'de_vertigo_radar_psd.png',
        splits: [{ zMin: 11550, zMax: 11680, offsetX: 0.2, offsetY: 42.6 }]
    },
    'de_ancient': { width: 1024, height: 1024, offsetX: -2590, offsetY: 1842.2, scale: 4.26, image: 'de_ancient_radar_psd.png' },
    'de_anubis': { width: 1024, height: 1024, offsetX: -2830, offsetY: 3346.0, scale: 5.25, image: 'de_anubis_radar_psd.png' },
    'de_train': { width: 1024, height: 1024, offsetX: -2730, offsetY: 2493.8, scale: 4.74, image: 'de_train_radar_psd.png' },
    'default': { width: 1024, height: 1024, offsetX: 0, offsetY: 0, scale: 1.0, image: null }
};

interface Player {
    x: number;
    y: number;
    z: number;
    angle?: number;
    health: number;
    team: number;
    isLocal: boolean;
    name: string;
}

export default function RadarView({ shareCode }: { shareCode: string }) {
    const [session, setSession] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [localTeam, setLocalTeam] = useState(3); // 3 = CT, 2 = T commonly
    const [wsConnected, setWsConnected] = useState(false);
    const [cheatConnected, setCheatConnected] = useState(false);
    const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
    const [currentMap, setCurrentMap] = useState('default');
    const [lastUpdateTime, setLastUpdateTime] = useState(0);
    const [fps, setFps] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const mapImageRef = useRef<HTMLImageElement | null>(null);
    const sessionInitRef = useRef(false);
    const connectedSessionIdRef = useRef<string | null>(null);

    const animationRef = useRef<number | null>(null);
    const playersRef = useRef(players);
    const cheatConnectedRef = useRef(cheatConnected);
    const lastUpdateTimeRef = useRef(lastUpdateTime);
    const currentMapRef = useRef(currentMap);
    const localTeamRef = useRef(localTeam);
    const interpolatedPlayersRef = useRef<Player[]>([]);
    const fpsRef = useRef({ frames: 0, lastTime: 0 });

    // Sync refs tightly
    useEffect(() => { playersRef.current = players }, [players]);
    useEffect(() => { cheatConnectedRef.current = cheatConnected }, [cheatConnected]);
    useEffect(() => { lastUpdateTimeRef.current = lastUpdateTime }, [lastUpdateTime]);
    useEffect(() => { currentMapRef.current = currentMap }, [currentMap]);
    useEffect(() => { localTeamRef.current = localTeam }, [localTeam]);

    useEffect(() => {
        setSession({ id: shareCode });
        connectWebSocket(shareCode);
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
    }, [shareCode]);

    const loadMapImage = useCallback((mapName: string) => {
        if (!mapName) return;

        let targetMap = mapName.toLowerCase();
        if (!MAPS[targetMap]) {
            if (MAPS['de_' + targetMap]) targetMap = 'de_' + targetMap;
            else if (MAPS['cs_' + targetMap]) targetMap = 'cs_' + targetMap;
        }

        const mapData = MAPS[targetMap] || MAPS['default'];
        setCurrentMap(targetMap);

        if (!mapData.image) {
            setMapImage(null);
            mapImageRef.current = null;
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            mapImageRef.current = img;
            setMapImage(img);
        };

        img.onerror = () => {
            if (img.src.startsWith(CDN_BASE_URL)) {
                setMapImage(null);
                mapImageRef.current = null;
                return;
            }
            img.src = `${CDN_BASE_URL}/${targetMap}/radar.png`;
        };

        img.src = `${ASSETS_BASE_URL}/${mapData.image}`;
    }, []);


    const connectWebSocket = (sid: string) => {
        const wsUrl = `ws://141.227.151.21/ws/${sid}`;

        if (wsRef.current) wsRef.current.close();

        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.binaryType = 'arraybuffer';

        wsRef.current.onopen = () => {
            setWsConnected(true);
            setError(null);
        };

        wsRef.current.onmessage = (event) => {
            try {
                if (event.data instanceof ArrayBuffer) {
                    const view = new DataView(event.data);
                    let offset = 0;
                    const msgType = view.getUint8(offset); offset += 1;

                    if (msgType === 2) {
                        setCheatConnected(false);
                        setPlayers([]);
                        return;
                    }

                    if (msgType === 1) {
                        const parsedLocalTeam = view.getInt32(offset, true); offset += 4;
                        const playerCount = view.getInt32(offset, true); offset += 4;

                        const mapNameBytes = new Uint8Array(event.data, offset, 64);
                        let parsedMapName = '';
                        for (let i = 0; i < 64 && mapNameBytes[i] !== 0; i++) parsedMapName += String.fromCharCode(mapNameBytes[i]);
                        offset += 64;

                        const parsedPlayers = [];
                        for (let i = 0; i < playerCount; i++) {
                            if (offset + 60 > view.byteLength) break;

                            const x = view.getFloat32(offset, true); offset += 4;
                            const y = view.getFloat32(offset, true); offset += 4;
                            const z = view.getFloat32(offset, true); offset += 4;
                            const angle = view.getFloat32(offset, true); offset += 4;
                            const health = view.getInt32(offset, true); offset += 4;
                            const team = view.getInt32(offset, true); offset += 4;
                            const isLocal = view.getInt32(offset, true) === 1; offset += 4;

                            const nameBytes = new Uint8Array(event.data, offset, 32);
                            let pName = '';
                            for (let j = 0; j < 32 && nameBytes[j] !== 0; j++) pName += String.fromCharCode(nameBytes[j]);
                            offset += 32;

                            parsedPlayers.push({ x, y, z, angle, health, team, isLocal, name: pName });
                        }

                        setLastUpdateTime(Date.now());
                        setPlayers(parsedPlayers);
                        setLocalTeam(parsedLocalTeam);
                        setCheatConnected(true);

                        if (parsedMapName) {
                            let cleanMapName = parsedMapName.toLowerCase();
                            if (cleanMapName.includes('/')) cleanMapName = cleanMapName.split('/').pop() || '';
                            if (cleanMapName.includes('\\')) cleanMapName = cleanMapName.split('\\').pop() || '';

                            const isGeneric = cleanMapName === 'main menu' || cleanMapName === 'default' || cleanMapName === 'unknown' || cleanMapName === 'waiting...';
                            const hasRealMap = currentMapRef.current && currentMapRef.current !== 'default';

                            if (!isGeneric || !hasRealMap) {
                                if (cleanMapName !== currentMapRef.current) {
                                    loadMapImage(cleanMapName);
                                }
                            }
                        }
                    }
                    return;
                }

                const data = JSON.parse(event.data);
                if (data.type === 'radar_update') {
                    setPlayers(data.players || []);
                    if (data.localTeam) setLocalTeam(data.localTeam);
                    setCheatConnected(true);
                    setLastUpdateTime(Date.now());
                    if (data.mapName && data.mapName !== currentMap) loadMapImage(data.mapName.toLowerCase());
                } else if (data.type === 'radar_disconnect') {
                    setCheatConnected(false);
                    setPlayers([]);
                }
            } catch (e) {
                console.error("WS Parse Error:", e);
            }
        };

        wsRef.current.onclose = () => {
            setWsConnected(false);
            setError('Session Not Found');
            setTimeout(() => { connectWebSocket(sid) }, 3000);
        };

        wsRef.current.onerror = () => {
            setWsConnected(false);
            setError('Session Not Found');
        };
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (lastUpdateTimeRef.current > 0 && Date.now() - lastUpdateTimeRef.current > 3000) {
                setCheatConnected(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fpsRef.current.lastTime = performance.now();

        const animate = (currentTime: number) => {
            fpsRef.current.frames++;
            const elapsed = currentTime - fpsRef.current.lastTime;
            if (elapsed >= 1000) {
                setFps(Math.round((fpsRef.current.frames * 1000) / elapsed));
                fpsRef.current.frames = 0;
                fpsRef.current.lastTime = currentTime;
            }

            const targetPlayers = playersRef.current;
            const currentInterp = interpolatedPlayersRef.current;
            const lerpAmount = 0.15;

            if (currentInterp.length !== targetPlayers.length) {
                interpolatedPlayersRef.current = targetPlayers.map(p => ({ ...p }));
            } else {
                targetPlayers.forEach((target, i) => {
                    const interp = currentInterp[i];
                    if (!interp) return;
                    interp.x += (target.x - interp.x) * lerpAmount;
                    interp.y += (target.y - interp.y) * lerpAmount;
                    interp.z += (target.z - interp.z) * lerpAmount;

                    if (target.angle !== undefined && interp.angle !== undefined) {
                        let diff = target.angle - interp.angle;
                        while (diff < -180) diff += 360;
                        while (diff > 180) diff -= 360;
                        interp.angle += diff * lerpAmount;
                    }

                    interp.health = target.health;
                    interp.team = target.team;
                    interp.isLocal = target.isLocal;
                    interp.name = target.name;
                });
            }

            drawRadar();
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [session, mapImage]);

    const worldToRadar = (x: number, y: number, z: number, mapData: any, canvasSize: number) => {
        let radarX = (x - mapData.offsetX) / mapData.scale;
        let radarY = (mapData.offsetY - y) / mapData.scale;

        if (mapData.splits) {
            for (const split of mapData.splits) {
                if (z >= split.zMin && z <= split.zMax) {
                    radarX += (split.offsetX || 0) / 100 * 1024;
                    radarY += (split.offsetY || 0) / 100 * 1024;
                    break;
                }
            }
        }

        const scale = canvasSize / mapData.width;
        return { x: radarX * scale, y: radarY * scale };
    };

    const drawRadar = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width;

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, size, size);

        let mapName = currentMapRef.current || 'default';
        let mapData = MAPS[mapName];

        if (!mapData || mapName === 'default' || mapName === 'main menu') {
            const sessionMap = session?.mapName?.toLowerCase();
            if (sessionMap) {
                let fuzzySession = sessionMap;
                if (!MAPS[fuzzySession] && MAPS['de_' + fuzzySession]) fuzzySession = 'de_' + fuzzySession;
                else if (!MAPS[fuzzySession] && MAPS['cs_' + fuzzySession]) fuzzySession = 'cs_' + fuzzySession;
                if (MAPS[fuzzySession]) mapData = MAPS[fuzzySession];
            }
        }

        if (!mapData) mapData = MAPS['default'];

        if (mapImageRef.current) {
            ctx.drawImage(mapImageRef.current, 0, 0, size, size);
        } else {
            ctx.strokeStyle = '#27272a'; // tailwind zinc-800
            ctx.lineWidth = 1;
            const gridSize = size / 10;
            for (let i = 0; i <= 10; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, size);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * gridSize);
                ctx.lineTo(size, i * gridSize);
                ctx.stroke();
            }

            if (!cheatConnectedRef.current) {
                ctx.fillStyle = '#ef4444'; // tailwind red-500
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Cheat Disconnected', size / 2, size / 2 - 10);
                ctx.fillStyle = '#a1a1aa'; // tailwind zinc-400
                ctx.font = '14px sans-serif';
                ctx.fillText('Start web radar in cheat menu', size / 2, size / 2 + 15);
            } else if (playersRef.current.length === 0) {
                ctx.fillStyle = '#a1a1aa';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Waiting for game data...', size / 2, size / 2);
            }
        }

        interpolatedPlayersRef.current.forEach(player => {
            const pos = worldToRadar(player.x, player.y, player.z, mapData, size);
            if (pos.x < -20 || pos.x > size + 20 || pos.y < -20 || pos.y > size + 20) return;

            const isEnemy = player.team !== localTeamRef.current;
            const isCT = player.team === 3;

            let color;
            if (player.isLocal) {
                color = '#22c55e'; // green-500
            } else if (isEnemy) {
                color = '#ef4444'; // red-500
            } else {
                color = isCT ? '#3b82f6' : '#eab308'; // blue-500 / yellow-500
            }

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, player.isLocal ? 14 : 12, 0, Math.PI * 2);
            ctx.fillStyle = color + '30';
            ctx.fill();

            ctx.shadowBlur = player.isLocal ? 15 : 10;
            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, player.isLocal ? 10 : 8, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (player.angle !== undefined) {
                const angle = (-player.angle * Math.PI) / 180;
                const lineLength = 20;
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(pos.x + Math.cos(angle) * lineLength, pos.y + Math.sin(angle) * lineLength);
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            if (player.health !== undefined && player.health > 0) {
                const barWidth = 24;
                const barHeight = 4;
                const barX = pos.x - barWidth / 2;
                const barY = pos.y + 14;

                ctx.fillStyle = '#18181b'; // zinc-900
                ctx.fillRect(barX, barY, barWidth, barHeight);

                const healthPercent = Math.min(player.health / 100, 1);
                ctx.fillStyle = healthPercent > 0.6 ? '#22c55e' : healthPercent > 0.3 ? '#eab308' : '#ef4444';
                ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            }

            if (player.name) {
                ctx.fillStyle = '#f4f4f5'; // zinc-100
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(player.name, pos.x, pos.y + 28);
            }
        });

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Players: ${playersRef.current.length}`, 10, size - 10);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 text-center max-w-md">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h1 className="text-2xl font-bold text-white mb-2">Session Not Found</h1>
                    <p className="text-zinc-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4 pt-24 font-sans text-white">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <MapPin className="text-indigo-500" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Live Radar</h1>
                                <p className="text-zinc-500 text-sm mt-0.5">
                                    <span className="text-zinc-300 font-medium">{currentMap !== 'default' ? currentMap : session.mapName || 'Unknown Map'}</span>
                                    {" • Hosted by "}<span className="text-indigo-400">{session.owner}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${fps >= 55 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : fps >= 30 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {fps} FPS
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cheatConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : wsConnected ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {cheatConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {cheatConnected ? 'Receiving' : wsConnected ? 'Waiting' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                                <Users size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">{players.length} Players</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 relative flex justify-center overflow-hidden shadow-2xl shadow-indigo-500/5">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="w-full max-w-[600px] h-auto rounded-2xl shadow-inner border border-zinc-800 bg-black"
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>

                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Legend</h2>
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-zinc-300 font-medium">You</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            <span className="text-zinc-300 font-medium">Enemy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <span className="text-zinc-300 font-medium">CT</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                            <span className="text-zinc-300 font-medium">T</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
