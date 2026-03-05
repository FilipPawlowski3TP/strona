import { useState } from 'react'
import { useAuth } from '../App'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      if (isRegister) {
        setIsRegister(false)
        setError('')
        alert('Registration successful! Please login.')
      } else {
        login(data.token, data.user)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-blinq-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-blinq-card border border-blinq-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blinq-accent mb-2">blinq</h1>
            <p className="text-blinq-text-muted">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blinq-text-muted text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-blinq-bg border border-blinq-border rounded-lg px-4 py-3 text-blinq-text focus:outline-none focus:border-blinq-accent transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-blinq-text-muted text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-blinq-bg border border-blinq-border rounded-lg px-4 py-3 text-blinq-text focus:outline-none focus:border-blinq-accent transition-colors pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blinq-text-muted hover:text-blinq-text"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-blinq-danger/10 border border-blinq-danger/30 rounded-lg px-4 py-3 text-blinq-danger text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blinq-accent hover:bg-blinq-accent-hover text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                'Loading...'
              ) : isRegister ? (
                <>
                  <UserPlus size={20} />
                  Register
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blinq-accent hover:text-blinq-accent-hover text-sm"
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
