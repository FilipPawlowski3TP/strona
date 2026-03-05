import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

export default function RadarViewer() {
  const { sessionId } = useParams()
  const [players, setPlayers] = useState([])
  const [mapName, setMapName] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const wsRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (players.length > 0) {
      drawRadar()
    }
  }, [players])

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:3000/ws/radar?session=${sessionId}`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      setConnected(true)
      setError('')
    }

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'radar_update') {
          setPlayers(data.players || [])
          setMapName(data.map_name || 'Unknown')
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    wsRef.current.onclose = () => {
      setConnected(false)
      setTimeout(connectWebSocket, 3000)
    }

    wsRef.current.onerror = (err) => {
      setError('Failed to connect to radar session')
      setConnected(false)
    }
  }

  const drawRadar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    ctx.fillStyle = '#0A0A0D'
    ctx.fillRect(0, 0, width, height)

    if (players.length === 0) return

    const positions = players.map(p => ({ x: p.x, y: p.y }))
    const minX = Math.min(...positions.map(p => p.x))
    const maxX = Math.max(...positions.map(p => p.x))
    const minY = Math.min(...positions.map(p => p.y))
    const maxY = Math.max(...positions.map(p => p.y))

    const padding = 100
    const rangeX = maxX - minX + padding * 2
    const rangeY = maxY - minY + padding * 2

    const scaleX = width / rangeX
    const scaleY = height / rangeY
    const scale = Math.min(scaleX, scaleY) * 0.8

    const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale
    const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale

    ctx.strokeStyle = '#1A1A20'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    players.forEach(player => {
      const x = player.x * scale + offsetX
      const y = player.y * scale + offsetY

      if (x < 0 || x > width || y < 0 || y > height) return

      let color = '#FF6B6B'
      if (player.is_local) {
        color = '#00BFE8'
      } else if (player.team === 2) {
        color = '#4ECDC4'
      } else if (player.team === 3) {
        color = '#FFD93D'
      }

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, player.is_local ? 8 : 6, 0, 2 * Math.PI)
      ctx.fill()

      if (player.rotation !== undefined) {
        const angle = (player.rotation * Math.PI) / 180
        const lineLength = player.is_local ? 15 : 12
        const endX = x + Math.cos(angle) * lineLength
        const endY = y + Math.sin(angle) * lineLength

        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      if (player.health !== undefined && player.health > 0) {
        const barWidth = 20
        const barHeight = 3
        const barX = x - barWidth / 2
        const barY = y - 15

        ctx.fillStyle = '#333'
        ctx.fillRect(barX, barY, barWidth, barHeight)

        const healthPercent = player.health / 100
        ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : healthPercent > 0.3 ? '#FFC107' : '#F44336'
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)
      }

      if (player.name) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(player.name, x, y + 20)
      }
    })
  }

  return (
    <div className="min-h-screen bg-blinq-bg">

      <div className="bg-blinq-card border-b border-blinq-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blinq-text">blinq Radar</h1>
            <p className="text-blinq-text-muted">
              Session: <span className="text-blinq-accent font-mono">{sessionId}</span>
              {mapName && <span> • Map: {mapName}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-blinq-text-muted text-sm">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>


      {error && (
        <div className="bg-red-500 text-white p-4 text-center">
          {error}
        </div>
      )}


      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blinq-card border border-blinq-border rounded-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              className="w-full h-auto"
              style={{ maxHeight: '80vh' }}
            />
          </div>


          {players.length > 0 && (
            <div className="mt-4 bg-blinq-card border border-blinq-border rounded-xl p-4">
              <h3 className="text-lg font-bold text-blinq-text mb-3">Players ({players.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((player, index) => (
                  <div key={index} className="bg-blinq-bg rounded-lg p-3 flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: player.is_local ? '#00BFE8' :
                          player.team === 2 ? '#4ECDC4' :
                            player.team === 3 ? '#FFD93D' : '#FF6B6B'
                      }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-blinq-text font-medium">{player.name}</p>
                      <p className="text-blinq-text-muted text-sm">
                        HP: {player.health || 0} • Team: {player.team || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
