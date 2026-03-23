import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setError('')
    
    const result = await login(identifier, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-50 flex flex-col justify-center items-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-purple-600/20">
            A
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif text-white tracking-tight">
            Aether AI Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Secure admin portal for AI content manufacturing.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-dark-100 border border-dark-400 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="space-y-5 relative">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Email or Username</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-400 rounded-2xl px-5 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                  placeholder="admin@aether.ai"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-400 rounded-2xl px-5 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 text-center font-bold">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
              >
                {isLoggingIn ? 'Verifying Credentials...' : 'Sign In'}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-10 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          Only registered AI Factory operators can access.
        </p>
      </div>
    </div>
  )
}
