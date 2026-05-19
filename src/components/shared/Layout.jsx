import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Target, LayoutDashboard, Users, Settings, LogOut,
  ChevronRight, Menu, X, Share2, Bell
} from 'lucide-react'

const NAV = {
  employee: [
    { label: 'Dashboard',  icon: LayoutDashboard, to: '/employee' },
  ],
  manager: [
    { label: 'Dashboard',  icon: LayoutDashboard, to: '/manager' },
  ],
  admin: [
    { label: 'Dashboard',   icon: LayoutDashboard, to: '/admin' },
    { label: 'Shared Goals', icon: Share2,          to: '/admin/shared-goals' },
    { label: 'Settings',     icon: Settings,        to: '/admin/settings' },
  ],
}

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const navItems = NAV[profile?.role] || []
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const roleBadge = {
    employee: { label: 'Employee',  cls: 'bg-slate-100 text-slate-600' },
    manager:  { label: 'Manager',   cls: 'bg-amber-100 text-amber-700' },
    admin:    { label: 'Admin / HR', cls: 'bg-brand-100 text-brand-700' },
  }[profile?.role] || {}

  return (
    <div className="min-h-screen flex bg-surface-muted">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-surface-border flex flex-col
        transition-transform duration-200 lg:translate-x-0 lg:static lg:flex
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-surface-border">
          <div className="text-brand-900 font-display text-xl tracking-tight">
            G<span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mx-0.5 mb-1"></span>oally.
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to} to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-brand-500" />}
              </Link>
            )
          })}
        </nav>

        {/* Profile footer */}
        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{profile?.full_name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded ${roleBadge.cls}`}>{roleBadge.label}</span>
            </div>
            <button onClick={handleSignOut} title="Sign out" className="text-slate-400 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {open && <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-surface-border flex items-center px-6 gap-4 sticky top-0 z-10">
          <button onClick={() => setOpen(true)} className="lg:hidden text-slate-500">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <button className="btn-ghost relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
