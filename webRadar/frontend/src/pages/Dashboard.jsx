import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { Key, Copy, Check, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [otp, setOtp] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ configs: 0, sessions: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const token = localStorage.getItem('token')
    try {
      const [configsRes, sessionsRes] = await Promise.all([
        fetch('/api/configs/my', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/radar/my-sessions', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      const configsData = await configsRes.json()
      const sessionsData = await sessionsRes.json()

      setStats({
        configs: configsData.configs?.length || 0,
        sessions: sessionsData.sessions?.length || 0
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const generateOTP = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/auth/generate-otp', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setOtp(data)
      }
    } catch (err) {
      console.error('Failed to generate OTP:', err)
    }
    setLoading(false)
  }

  const copyOTP = () => {
    if (otp?.code) {
      navigator.clipboard.writeText(otp.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatExpiry = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-blinq-text mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blinq-card border border-blinq-border rounded-xl p-6">
          <p className="text-blinq-text-muted text-sm mb-1">Your Configs</p>
          <p className="text-3xl font-bold text-blinq-text">{stats.configs}</p>
        </div>
        <div className="bg-blinq-card border border-blinq-border rounded-xl p-6">
          <p className="text-blinq-text-muted text-sm mb-1">Active Radar Sessions</p>
          <p className="text-3xl font-bold text-blinq-text">{stats.sessions}</p>
        </div>
        <div className="bg-blinq-card border border-blinq-border rounded-xl p-6">
          <p className="text-blinq-text-muted text-sm mb-1">Account Type</p>
          <p className="text-3xl font-bold text-blinq-accent">
            {user?.is_admin ? 'Admin' : 'User'}
          </p>
        </div>
      </div>


      <div className="bg-blinq-card border border-blinq-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="text-blinq-accent" size={24} />
          <h2 className="text-xl font-bold text-blinq-text">Cheat Authentication</h2>
        </div>

        <p className="text-blinq-text-muted mb-6">
          Generate a one-time password to authenticate the cheat loader. The code expires in 5 minutes.
        </p>

        {otp ? (
          <div className="bg-blinq-bg border border-blinq-border rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blinq-text-muted text-sm mb-1">Your OTP Code</p>
                <p className="text-4xl font-mono font-bold text-blinq-accent tracking-widest">
                  {otp.code}
                </p>
                <p className="text-blinq-text-muted text-sm mt-2">
                  Expires in: {formatExpiry(otp.expiresAt)}
                </p>
              </div>
              <button
                onClick={copyOTP}
                className="p-3 bg-blinq-border rounded-lg hover:bg-blinq-accent transition-colors"
              >
                {copied ? <Check size={24} className="text-blinq-success" /> : <Copy size={24} />}
              </button>
            </div>
          </div>
        ) : null}

        <button
          onClick={generateOTP}
          disabled={loading}
          className="bg-blinq-accent hover:bg-blinq-accent-hover text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          {otp ? 'Generate New OTP' : 'Generate OTP'}
        </button>
      </div>
    </div>
  )
}
