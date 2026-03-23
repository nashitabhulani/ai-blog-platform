import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { user, register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsRegistering(true)
    setError('')
    
    const result = await register(username, email, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setIsRegistering(false)
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
            Join the AI Factory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create an ID to start generating professional content.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-dark-100 border border-dark-400 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="space-y-5 relative">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-400 rounded-2xl px-5 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                  placeholder="alex_creator"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-400 rounded-2xl px-5 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                  placeholder="alex@example.com"
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
                disabled={isRegistering}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
              >
                {isRegistering ? 'Generating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 underline decoration-purple-500/30">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
