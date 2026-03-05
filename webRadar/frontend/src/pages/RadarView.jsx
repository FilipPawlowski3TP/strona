import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Users, MapPin, AlertCircle, Wifi, WifiOff } from 'lucide-react'

const ASSETS_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/uploads' : '/uploads';
const CDN_BASE_URL = 'https://raw.githubusercontent.com/NaraNaraa/cs2radarmap/main/maps';


const MAPS = {
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
}

export default function RadarView() {
  const { shareCode } = useParams()
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([])
  const [localTeam, setLocalTeam] = useState(3)
  const [wsConnected, setWsConnected] = useState(false)
  const [cheatConnected, setCheatConnected] = useState(false)
  const [mapImage, setMapImage] = useState(null)
  const [currentMap, setCurrentMap] = useState('default')
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const mapImageRef = useRef(null)

  useEffect(() => {
    fetchSession()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [shareCode])

  const sessionInitRef = useRef(false);
  const connectedSessionIdRef = useRef(null);

  useEffect(() => {
    if (session && connectedSessionIdRef.current !== session.id) {
      console.log(`[RadarView] Session ID changed from ${connectedSessionIdRef.current} to ${session.id}, connecting WebSocket...`);
      connectedSessionIdRef.current = session.id;
      connectWebSocket();
      if (session.mapName) {
        loadMapImage(session.mapName.toLowerCase())
      }
    }

    return () => {
      // We only clean up if the component unmounts entirely (shareCode change)
    }
  }, [session])

  const animationRef = useRef(null)
  const playersRef = useRef(players)
  const cheatConnectedRef = useRef(cheatConnected)
  const lastUpdateTimeRef = useRef(lastUpdateTime)
  const currentMapRef = useRef(currentMap)
  const localTeamRef = useRef(localTeam)
  const interpolatedPlayersRef = useRef([])
  const [fps, setFps] = useState(0)
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() })

  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => { cheatConnectedRef.current = cheatConnected }, [cheatConnected])
  useEffect(() => { lastUpdateTimeRef.current = lastUpdateTime }, [lastUpdateTime])
  useEffect(() => { currentMapRef.current = currentMap }, [currentMap])
  useEffect(() => { localTeamRef.current = localTeam }, [localTeam])

  // Refs are now synced in the block above

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdateTimeRef.current > 0 && Date.now() - lastUpdateTimeRef.current > 3000) {
        setCheatConnected(false)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const animate = (currentTime) => {
      // FPS calculation
      fpsRef.current.frames++
      const elapsed = currentTime - fpsRef.current.lastTime
      if (elapsed >= 1000) {
        setFps(Math.round((fpsRef.current.frames * 1000) / elapsed))
        fpsRef.current.frames = 0
        fpsRef.current.lastTime = currentTime
      }

      // 1. Interpolate players for buttery smooth movement
      const targetPlayers = playersRef.current;
      const currentInterp = interpolatedPlayersRef.current;
      const lerpAmount = 0.15; // Smoothness vs responsiveness

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

      drawRadar()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [session, mapImage])

  const fetchSession = async () => {
    if (sessionInitRef.current && session?.id) return; // Already fetching or fetched
    sessionInitRef.current = true;

    console.log(`[RadarView] Fetching session for shareCode: ${shareCode}`);
    try {
      const res = await fetch(`/api/radar/join/${shareCode}`)
      const data = await res.json()
      console.log(`[RadarView] Session fetch result:`, data);
      if (data.success) {
        // Only update if the content actually changed to avoid re-renders
        setSession(prev => {
          if (prev && prev.id === data.session.id && prev.mapName === data.session.mapName) return prev;
          return data.session;
        })
      } else {
        setError(data.error || 'Session not found')
      }
    } catch (err) {
      console.error(`[RadarView] Session fetch error:`, err);
      setError('Failed to connect to server')
    }
  }

  const loadMapImage = useCallback((mapName) => {
    if (!mapName) return;

    // Fuzzy matching for map names (e.g., "mirage" -> "de_mirage")
    let targetMap = mapName.toLowerCase();
    if (!MAPS[targetMap]) {
      if (MAPS['de_' + targetMap]) targetMap = 'de_' + targetMap;
      else if (MAPS['cs_' + targetMap]) targetMap = 'cs_' + targetMap;
    }

    const mapData = MAPS[targetMap] || MAPS['default']

    // Always update currentMap state even if image is null, 
    // this ensures we at least have the correct coordinate scaling!
    setCurrentMap(targetMap)

    if (!mapData.image) {
      console.log(`[RadarView] No image for map ${targetMap}, using grid with scale ${mapData.scale}`);
      setMapImage(null)
      mapImageRef.current = null
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    // Attempt local load first, then CDN
    img.onload = () => {
      console.log(`[RadarView] Map image loaded for ${targetMap}`);
      mapImageRef.current = img
      setMapImage(img)
    }

    img.onerror = () => {
      // If we already tried the CDN, give up
      if (img.src.startsWith(CDN_BASE_URL)) {
        console.warn(`[RadarView] Failed to load map image for ${targetMap} from CDN. Continuing with grid.`);
        setMapImage(null)
        mapImageRef.current = null
        return;
      }

      // Try the CDN as a fallback
      const cdnUrl = `${CDN_BASE_URL}/${targetMap}/radar.png`;
      console.log(`[RadarView] Image missing in uploads/. Attempting GitHub CDN fallback: ${cdnUrl}`);
      img.src = cdnUrl;
    }

    img.src = `${ASSETS_BASE_URL}/${mapData.image}`
  }, [])

  const connectWebSocket = () => {
    // Determine backend host - use localhost:3000 for development, or the same host for production if deployed together
    const backendHost = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${backendHost}/ws/radar?session=${session.id}`;

    wsRef.current = new WebSocket(wsUrl)
    wsRef.current.binaryType = 'arraybuffer';

    wsRef.current.onopen = () => {
      console.log('WebSocket connected')
      setWsConnected(true)
    }

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
              if (offset + 60 > view.byteLength) {
                console.error(`[RadarView] Buffer overrun! Expected ${playerCount} players, parsing player ${i}. Offset: ${offset}, Limit: ${view.byteLength}`);
                break;
              }

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
              offset += 32; // Skip exactly 32 bytes for char name[32]

              parsedPlayers.push({ x, y, z, angle, health, team, isLocal, name: pName });
            }

            setLastUpdateTime(Date.now());
            setPlayers(parsedPlayers);
            setLocalTeam(parsedLocalTeam);
            setCheatConnected(true);

            if (parsedMapName) {
              // Handle paths like "maps/de_dust2"
              let cleanMapName = parsedMapName.toLowerCase();
              if (cleanMapName.includes('/')) cleanMapName = cleanMapName.split('/').pop();
              if (cleanMapName.includes('\\')) cleanMapName = cleanMapName.split('\\').pop();

              // CRITICAL: Ignore "main menu" or "default" if we already have a real map.
              // This is a safety fallback for when the cheat fails to detect the map name mid-game.
              const isGeneric = cleanMapName === 'main menu' || cleanMapName === 'default' || cleanMapName === 'unknown' || cleanMapName === 'waiting...';
              const hasRealMap = currentMapRef.current && currentMapRef.current !== 'default';

              if (!isGeneric || !hasRealMap) {
                if (cleanMapName !== currentMapRef.current) {
                  console.log(`[RadarView] Map changed from ${currentMapRef.current} to ${cleanMapName}`);
                  loadMapImage(cleanMapName);
                }
              }
            }
          }
          return;
        }

        const data = JSON.parse(event.data)

        if (data.type === 'radar_update') {
          setPlayers(data.players || [])
          if (data.localTeam) setLocalTeam(data.localTeam)
          setCheatConnected(true)
          setLastUpdateTime(Date.now())

          if (data.mapName && data.mapName !== currentMap) {
            loadMapImage(data.mapName.toLowerCase())
          }
        } else if (data.type === 'radar_disconnect') {
          setCheatConnected(false)
          setPlayers([])
        }
      } catch (e) {
        console.error("WS Parse Error:", e)
        setError("Error parsing radar data: " + e.message + " | Stack: " + e.stack)
      }
    }

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
      setWsConnected(false)
      setTimeout(() => {
        if (session) connectWebSocket()
      }, 2000)
    }

    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err)
      setWsConnected(false)
    }
  }

  const worldToRadar = (x, y, z, mapData, canvasSize) => {
    let radarX = (x - mapData.offsetX) / mapData.scale
    let radarY = (mapData.offsetY - y) / mapData.scale

    // Handle vertical splits (e.g., Nuke upper/lower stacked)
    if (mapData.splits) {
      for (const split of mapData.splits) {
        if (z >= split.zMin && z <= split.zMax) {
          radarX += (split.offsetX || 0) / 100 * 1024
          radarY += (split.offsetY || 0) / 100 * 1024
          break
        }
      }
    }

    const scale = canvasSize / mapData.width
    return {
      x: radarX * scale,
      y: radarY * scale
    }
  }

  const drawRadar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const size = canvas.width

    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, size, size)

    // Robust Map Data Selection:
    // 1. Try cheat-reported map
    // 2. Try session-reported map as fallback (since user entered it manually)
    // 3. Fallback to default (grid only)
    let mapName = currentMapRef.current || 'default'
    let mapData = MAPS[mapName]

    if (!mapData || mapName === 'default' || mapName === 'main menu') {
      const sessionMap = session?.mapName?.toLowerCase()
      if (sessionMap) {
        let fuzzySession = sessionMap;
        if (!MAPS[fuzzySession] && MAPS['de_' + fuzzySession]) fuzzySession = 'de_' + fuzzySession;
        else if (!MAPS[fuzzySession] && MAPS['cs_' + fuzzySession]) fuzzySession = 'cs_' + fuzzySession;

        if (MAPS[fuzzySession]) {
          mapData = MAPS[fuzzySession];
        }
      }
    }

    if (!mapData) mapData = MAPS['default'];

    if (mapImageRef.current) {
      ctx.drawImage(mapImageRef.current, 0, 0, size, size)
    } else {
      ctx.strokeStyle = '#1e1e2e'
      ctx.lineWidth = 1
      const gridSize = size / 10
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(i * gridSize, 0)
        ctx.lineTo(i * gridSize, size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * gridSize)
        ctx.lineTo(size, i * gridSize)
        ctx.stroke()
      }

      if (!cheatConnectedRef.current) {
        ctx.fillStyle = '#ff4444'
        ctx.font = 'bold 18px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Cheat Disconnected', size / 2, size / 2 - 10)
        ctx.fillStyle = '#888'
        ctx.font = '14px sans-serif'
        ctx.fillText('Start web radar in cheat menu', size / 2, size / 2 + 15)
      } else if (playersRef.current.length === 0) {
        ctx.fillStyle = '#666'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Waiting for game data...', size / 2, size / 2)
      }
    }

    interpolatedPlayersRef.current.forEach(player => {
      const pos = worldToRadar(player.x, player.y, player.z, mapData, size)

      if (pos.x < -20 || pos.x > size + 20 || pos.y < -20 || pos.y > size + 20) return

      const isEnemy = player.team !== localTeamRef.current
      const isCT = player.team === 3

      let color
      if (player.isLocal) {
        color = '#22c55e'
      } else if (isEnemy) {
        color = '#ef4444'
      } else {
        color = isCT ? '#5b9bd5' : '#d4a84b'
      }

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, player.isLocal ? 14 : 12, 0, Math.PI * 2)
      ctx.fillStyle = color + '30' // Subtler background glow
      ctx.fill()

      // Add actual outer glow for premium look
      ctx.shadowBlur = player.isLocal ? 15 : 10;
      ctx.shadowColor = color;

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, player.isLocal ? 10 : 8, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Reset shadow for stroke
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.stroke()

      if (player.angle !== undefined) {
        const angle = (-player.angle * Math.PI) / 180
        const lineLength = 20
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(
          pos.x + Math.cos(angle) * lineLength,
          pos.y + Math.sin(angle) * lineLength
        )
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.stroke()
      }

      if (player.health !== undefined && player.health > 0) {
        const barWidth = 24
        const barHeight = 4
        const barX = pos.x - barWidth / 2
        const barY = pos.y + 14

        ctx.fillStyle = '#333'
        ctx.fillRect(barX, barY, barWidth, barHeight)

        const healthPercent = Math.min(player.health / 100, 1)
        ctx.fillStyle = healthPercent > 0.6 ? '#22c55e' : healthPercent > 0.3 ? '#eab308' : '#ef4444'
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)
      }

      if (player.name) {
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(player.name, pos.x, pos.y + 28)
      }
    })

    ctx.fillStyle = '#64748b'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Players: ${playersRef.current.length}`, 10, size - 10)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blinq-bg flex items-center justify-center p-4">
        <div className="bg-blinq-card border border-blinq-border rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="mx-auto text-blinq-danger mb-4" size={48} />
          <h1 className="text-xl font-bold text-blinq-text mb-2">Session Not Found</h1>
          <p className="text-blinq-text-muted">{error}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-blinq-bg flex items-center justify-center">
        <div className="text-blinq-accent text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blinq-bg p-4">
      <div className="max-w-4xl mx-auto">

        <div className="bg-blinq-card border border-blinq-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="text-blinq-accent" size={24} />
              <div>
                <h1 className="text-xl font-bold text-blinq-text">Web Radar</h1>
                <p className="text-blinq-text-muted text-sm">
                  {currentMap !== 'default' ? currentMap : session.mapName || 'Unknown Map'} • Hosted by {session.owner}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-2 py-1 rounded text-xs font-mono ${fps >= 55 ? 'bg-green-500/20 text-green-400' : fps >= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {fps} FPS
              </div>
              <div className={`flex items-center gap-2 ${cheatConnected ? 'text-green-500' : wsConnected ? 'text-yellow-500' : 'text-red-500'}`}>
                {cheatConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
                <span className="text-sm">
                  {cheatConnected ? 'Receiving Data' : wsConnected ? 'Waiting for Cheat' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blinq-text-muted">
                <Users size={18} />
                <span>{players.length} players</span>
              </div>
            </div>
          </div>
        </div>


        <div className="bg-blinq-card border border-blinq-border rounded-xl p-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="w-full max-w-[600px] mx-auto rounded-lg"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>


        <div className="bg-blinq-card border border-blinq-border rounded-xl p-4 mt-4">
          <h2 className="text-sm font-bold text-blinq-text mb-3">Legend</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-blinq-text-muted">You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-blinq-text-muted">Enemy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blinq-ct"></div>
              <span className="text-blinq-text-muted">CT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blinq-tt"></div>
              <span className="text-blinq-text-muted">T</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
