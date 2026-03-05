import { useState, useEffect } from 'react'
import { Upload, Download, Trash2, Globe, Lock, Search } from 'lucide-react'

export default function Configs() {
  const [myConfigs, setMyConfigs] = useState([])
  const [publicConfigs, setPublicConfigs] = useState([])
  const [activeTab, setActiveTab] = useState('my')
  const [uploading, setUploading] = useState(false)
  const [configName, setConfigName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    const token = localStorage.getItem('token')
    try {
      const [myRes, publicRes] = await Promise.all([
        fetch('/api/configs/my', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/configs/public')
      ])
      const myData = await myRes.json()
      const publicData = await publicRes.json()

      if (myData.success) setMyConfigs(myData.configs)
      if (publicData.success) setPublicConfigs(publicData.configs)
    } catch (err) {
      console.error('Failed to fetch configs:', err)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('config', file)
    formData.append('name', configName || file.name.replace('.json', ''))
    formData.append('isPublic', isPublic.toString())

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/configs/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        fetchConfigs()
        setConfigName('')
        setIsPublic(false)
      }
    } catch (err) {
      console.error('Failed to upload config:', err)
    }
    setUploading(false)
    e.target.value = ''
  }

  const deleteConfig = async (id) => {
    if (!confirm('Are you sure you want to delete this config?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/configs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        fetchConfigs()
      }
    } catch (err) {
      console.error('Failed to delete config:', err)
    }
  }

  const copyConfigId = (id) => {
    navigator.clipboard.writeText(id)
    alert('Config ID copied! Use this in the cheat to import.')
  }

  const filteredPublicConfigs = publicConfigs.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-blinq-text mb-8">Configs</h1>


      <div className="bg-blinq-card border border-blinq-border rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-blinq-text mb-4">Upload Config</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Config name (optional)"
            className="bg-blinq-bg border border-blinq-border rounded-lg px-4 py-3 text-blinq-text focus:outline-none focus:border-blinq-accent"
          />

          <label className="flex items-center gap-3 bg-blinq-bg border border-blinq-border rounded-lg px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 accent-blinq-accent"
            />
            <span className="text-blinq-text">Make Public</span>
          </label>

          <label className="bg-blinq-accent hover:bg-blinq-accent-hover text-white font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Select JSON File'}
            <input
              type="file"
              accept=".json"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>


      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'my'
            ? 'bg-blinq-accent text-white'
            : 'bg-blinq-card text-blinq-text-muted hover:text-blinq-text'
            }`}
        >
          My Configs ({myConfigs.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'public'
            ? 'bg-blinq-accent text-white'
            : 'bg-blinq-card text-blinq-text-muted hover:text-blinq-text'
            }`}
        >
          Public Configs ({publicConfigs.length})
        </button>
      </div>


      {activeTab === 'public' && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blinq-text-muted" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search configs..."
            className="w-full bg-blinq-card border border-blinq-border rounded-lg pl-12 pr-4 py-3 text-blinq-text focus:outline-none focus:border-blinq-accent"
          />
        </div>
      )}


      <div className="grid gap-4">
        {activeTab === 'my' ? (
          myConfigs.length === 0 ? (
            <div className="bg-blinq-card border border-blinq-border rounded-xl p-8 text-center">
              <p className="text-blinq-text-muted">No configs yet. Upload your first config!</p>
            </div>
          ) : (
            myConfigs.map(config => (
              <div key={config.id} className="bg-blinq-card border border-blinq-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {config.is_public ? (
                    <Globe className="text-blinq-success" size={20} />
                  ) : (
                    <Lock className="text-blinq-text-muted" size={20} />
                  )}
                  <div>
                    <p className="text-blinq-text font-medium">{config.name}</p>
                    <p className="text-blinq-text-muted text-sm">
                      {config.downloads} downloads • {new Date(config.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyConfigId(config.id)}
                    className="p-2 bg-blinq-border rounded-lg hover:bg-blinq-accent transition-colors"
                    title="Copy Config ID"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => deleteConfig(config.id)}
                    className="p-2 bg-blinq-border rounded-lg hover:bg-blinq-danger transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filteredPublicConfigs.length === 0 ? (
            <div className="bg-blinq-card border border-blinq-border rounded-xl p-8 text-center">
              <p className="text-blinq-text-muted">No public configs found.</p>
            </div>
          ) : (
            filteredPublicConfigs.map(config => (
              <div key={config.id} className="bg-blinq-card border border-blinq-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-blinq-text font-medium">{config.name}</p>
                  <p className="text-blinq-text-muted text-sm">
                    by {config.author} • {config.downloads} downloads
                  </p>
                </div>
                <button
                  onClick={() => copyConfigId(config.id)}
                  className="p-2 bg-blinq-accent rounded-lg hover:bg-blinq-accent-hover transition-colors"
                  title="Copy Config ID"
                >
                  <Download size={18} />
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}
