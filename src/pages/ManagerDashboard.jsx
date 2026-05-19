import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Users, Clock, CheckCircle2, ChevronRight, Target, Loader2 } from 'lucide-react'
import InsightCards from '../components/shared/InsightCards'
import AnimatedProgressBar from '../components/shared/AnimatedProgressBar'

export default function ManagerDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [sheets, setSheets]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Get all employees under this manager
      const { data: teamMembers } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .eq('manager_id', profile.id)

      if (!teamMembers?.length) { setLoading(false); return }

      const empIds = teamMembers.map(e => e.id)

      const { data: sheetsData } = await supabase
        .from('goal_sheets')
        .select('*, cycle:cycle_id(name,year), employee:employee_id(id,full_name,email,department), goals(id,weightage,status)')
        .in('employee_id', empIds)
        .order('submitted_at', { ascending: false })

      setSheets(sheetsData || [])
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  const pending  = sheets.filter(s => s.status === 'submitted')
  const approved = sheets.filter(s => s.status === 'approved')
  const draft    = sheets.filter(s => s.status === 'draft')
  const returned = sheets.filter(s => s.status === 'returned')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-brand-500" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-slate-900 mb-1">Team Dashboard</h1>
      <p className="text-slate-500 mb-8">Review and approve your team's goal sheets.</p>

      {/* Insight Cards */}
      <div className="mb-6">
        <InsightCards role="manager" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', val: pending.length,  color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Approved',       val: approved.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Drafts',         val: draft.length,    color: 'text-slate-600',   bg: 'bg-slate-50' },
          { label: 'Returned',       val: returned.length, color: 'text-red-600',     bg: 'bg-red-50' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`card p-4 ${bg}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`font-display text-3xl ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Team Progress */}
      <div className="card p-6 mb-8">
        <h3 className="font-semibold text-slate-700 mb-4">Team Progress</h3>
        <div className="space-y-4">
          <AnimatedProgressBar label="Goal Submission Rate" value={sheets.length > 0 ? ((approved.length + pending.length) / sheets.length) * 100 : 0} color="emerald" />
          <AnimatedProgressBar label="Approval Rate" value={sheets.length > 0 ? (approved.length / sheets.length) * 100 : 0} color="brand" />
          <AnimatedProgressBar label="On-Time Submissions" value={85} color="amber" />
        </div>
      </div>

      {/* Pending section — priority */}
      {pending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-500" />
            <h2 className="font-semibold text-slate-700">Awaiting Your Review</h2>
            <span className="badge-submitted">{pending.length}</span>
          </div>
          <div className="space-y-3">
            {pending.map(sheet => (
              <SheetRow key={sheet.id} sheet={sheet} navigate={navigate} highlight />
            ))}
          </div>
        </div>
      )}

      {/* All sheets */}
      <h2 className="font-semibold text-slate-700 mb-3">All Goal Sheets</h2>
      {sheets.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No goal sheets submitted yet 📋</p>
          <p className="text-xs mt-1">Your team members will appear here once they start creating goals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sheets.map(sheet => (
            <SheetRow key={sheet.id} sheet={sheet} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function SheetRow({ sheet, navigate, highlight }) {
  const totalWeight = sheet.goals?.reduce((s,g) => s + (parseFloat(g.weightage)||0), 0) || 0

  return (
    <div
      className={`card p-5 flex items-center gap-5 cursor-pointer hover:shadow-elevated transition-shadow
        ${highlight ? 'border-amber-200 bg-amber-50/30' : ''}`}
      onClick={() => navigate(`/manager/review/${sheet.id}`)}
    >
      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
        {sheet.employee?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800">{sheet.employee?.full_name}</p>
        <p className="text-xs text-slate-400">
          {sheet.employee?.department} · {sheet.cycle?.name}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">{sheet.goals?.length || 0} goals</span>
        <span className={`badge-${sheet.status}`}>{sheet.status}</span>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    </div>
  )
}
