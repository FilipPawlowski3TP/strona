import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { Home, Settings, Radar, LogOut, Key } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/configs', icon: Settings, label: 'Configs' },
    { path: '/radar', icon: Radar, label: 'Web Radar' },
  ]

  return (
    <div className="min-h-screen bg-blinq-bg flex">

      <aside className="w-64 bg-blinq-card border-r border-blinq-border flex flex-col">
        <div className="p-6 border-b border-blinq-border">
          <h1 className="text-2xl font-bold text-blinq-accent">blinq</h1>
          <p className="text-blinq-text-muted text-sm mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${location.pathname === item.path
                ? 'bg-blinq-accent text-white'
                : 'text-blinq-text-muted hover:bg-blinq-border hover:text-blinq-text'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-blinq-border">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blinq-accent flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-blinq-text text-sm font-medium">{user?.username}</p>
              <p className="text-blinq-text-muted text-xs">
                {user?.is_admin ? 'Admin' : 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-blinq-danger hover:bg-blinq-border transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>


      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
