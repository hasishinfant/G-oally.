import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Target, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      // role redirect handled by App.jsx
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-950 text-white p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-800/40" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-brand-700/30" />

        <div className="relative z-10">
          <div className="mb-16">
            <div className="text-white font-display text-5xl tracking-tight mb-2">
              G<span className="inline-block w-3 h-3 rounded-full bg-brand-400 mx-1.5 mb-3 animate-pulse"></span>oally.
            </div>
            <p className="text-brand-200 text-sm font-medium">Goal Management Platform</p>
          </div>
          <h1 className="font-display text-5xl leading-tight mb-4">
            Set goals.<br />Track progress.<br />Drive results.
          </h1>
          <p className="text-brand-300 text-lg leading-relaxed max-w-sm">
            A structured digital platform for the full lifecycle of employee goals — from creation to quarterly check-ins.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 text-center">
          {[['3', 'User Roles'], ['8', 'Max Goals'], ['100%', 'Weightage']].map(([val, label]) => (
            <div key={label} className="bg-brand-900/60 rounded-xl p-4">
              <div className="font-display text-3xl text-white mb-1">{val}</div>
              <div className="text-brand-400 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-muted">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="text-brand-900 font-display text-2xl tracking-tight">
              G<span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mx-0.5 mb-1"></span>oally.
            </div>
          </div>

          <h2 className="font-display text-3xl text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : 'Sign in'
              }
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <p className="font-semibold mb-1">Demo credentials</p>
            <p>Employee: alice@demo.com / Password123</p>
            <p>Manager:  bob@demo.com / Password123</p>
            <p>Admin:    carol@demo.com / Password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
