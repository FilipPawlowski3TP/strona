import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, ExternalLink, Users } from 'lucide-react'

export default function Radar() {
  const [sessions, setSessions] = useState([])
  const [creating, setCreating] = useState(false)
  const [mapName, setMapName] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/radar/my-sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  }

  const createSession = async () => {
    setCreating(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/radar/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mapName: mapName || 'Unknown' })
      })
      const data = await res.json()
      if (data.success) {
        fetchSessions()
        setMapName('')
      }
    } catch (err) {
      console.error('Failed to create session:', err)
    }
    setCreating(false)
  }

  const deleteSession = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/radar/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        fetchSessions()
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const copyShareLink = (shareCode) => {
    const link = `${window.location.origin}/radar/${shareCode}`
    navigator.clipboard.writeText(link)
    alert('Share link copied!')
  }

  const openRadar = (shareCode) => {
    window.open(`/radar/${shareCode}`, '_blank')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-blinq-text mb-8">Web Radar</h1>


      <div className="bg-blinq-card border border-blinq-border rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-blinq-text mb-4">Create Radar Session</h2>
        <p className="text-blinq-text-muted mb-4">
          Create a radar session to share your game view with others. They can see player positions and health in real-time.
        </p>

        <div className="flex gap-4">
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="Map name (optional)"
            className="flex-1 bg-blinq-bg border border-blinq-border rounded-lg px-4 py-3 text-blinq-text focus:outline-none focus:border-blinq-accent"
          />
          <button
            onClick={createSession}
            disabled={creating}
            className="bg-blinq-accent hover:bg-blinq-accent-hover text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            {creating ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </div>


      <div className="bg-blinq-card border border-blinq-border rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-blinq-text mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-blinq-text-muted">
          <li>Create a radar session above</li>
          <li>Copy the Session ID and paste it in the cheat's radar settings</li>
          <li>Share the link with friends so they can view the radar</li>
          <li>The radar updates in real-time as you play</li>
        </ol>
      </div>


      <h2 className="text-xl font-bold text-blinq-text mb-4">Active Sessions</h2>

      {sessions.length === 0 ? (
        <div className="bg-blinq-card border border-blinq-border rounded-xl p-8 text-center">
          <Users className="mx-auto text-blinq-text-muted mb-4" size={48} />
          <p className="text-blinq-text-muted">No active sessions. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => (
            <div key={session.id} className="bg-blinq-card border border-blinq-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-blinq-text font-medium">
                    Session: <span className="text-blinq-accent font-mono">{session.share_code}</span>
                  </p>
                  <p className="text-blinq-text-muted text-sm">
                    Map: {session.map_name} • Created: {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openRadar(session.share_code)}
                    className="p-2 bg-blinq-border rounded-lg hover:bg-blinq-accent transition-colors"
                    title="Open Radar"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => copyShareLink(session.share_code)}
                    className="p-2 bg-blinq-border rounded-lg hover:bg-blinq-accent transition-colors"
                    title="Copy Share Link"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 bg-blinq-border rounded-lg hover:bg-blinq-danger transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-blinq-bg rounded-lg p-3">
                <p className="text-blinq-text-muted text-xs mb-1">Session ID (for cheat):</p>
                <code className="text-blinq-accent text-sm font-mono break-all">{session.id}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
