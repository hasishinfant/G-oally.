import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Users, BarChart3, Settings, Share2, CheckCircle2,
  Clock, ChevronRight, Plus, Loader2, Download, RefreshCcw
} from 'lucide-react'
import toast from 'react-hot-toast'
import InsightCards from '../components/shared/InsightCards'
import AnimatedProgressBar from '../components/shared/AnimatedProgressBar'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [stats,    setStats]    = useState({ total:0, submitted:0, approved:0, returned:0, draft:0 })
  const [sheets,   setSheets]   = useState([])
  const [cycles,   setCycles]   = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const [sheetsRes, cyclesRes, profilesRes] = await Promise.all([
        supabase.from('goal_sheets')
          .select('id, status, employee:employee_id(full_name,email,department), cycle:cycle_id(name)'),
        supabase.from('goal_cycles').select('*').order('year', { ascending: false }),
        supabase.from('profiles').select('*'),
      ])

      const s = sheetsRes.data || []
      setSheets(s)
      setStats({
        total:     s.length,
        submitted: s.filter(x=>x.status==='submitted').length,
        approved:  s.filter(x=>x.status==='approved').length,
        returned:  s.filter(x=>x.status==='returned').length,
        draft:     s.filter(x=>x.status==='draft').length,
      })
      setCycles(cyclesRes.data || [])
      setProfiles(profilesRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function exportCSV() {
    const { data, error } = await supabase
      .from('goals')
      .select('*, goal_sheet:goal_sheet_id(employee:employee_id(full_name,email,department), cycle:cycle_id(name)), thrust_area:thrust_area_id(name)')

    if (error) { toast.error('Export failed.'); return }

    const rows = [
      ['Employee', 'Email', 'Department', 'Cycle', 'Thrust Area', 'Goal Title', 'UoM', 'Target', 'Weightage', 'Status'],
      ...(data || []).map(g => [
        g.goal_sheet?.employee?.full_name || '',
        g.goal_sheet?.employee?.email || '',
        g.goal_sheet?.employee?.department || '',
        g.goal_sheet?.cycle?.name || '',
        g.thrust_area?.name || '',
        g.title,
        g.uom_type,
        g.target_value || g.target_date || '0',
        g.weightage + '%',
        g.status,
      ])
    ]

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'goals-report.csv'; a.click()
    toast.success('Report exported.')
  }

  async function unlockSheet(sheetId) {
    await supabase.from('goal_sheets').update({ status: 'draft' }).eq('id', sheetId)
    await supabase.from('goals').update({ status: 'active' }).eq('goal_sheet_id', sheetId)
    await supabase.from('audit_logs').insert({
      table_name: 'goal_sheets', record_id: sheetId,
      changed_by: profile.id, change_type: 'ADMIN_UNLOCK',
    })
    toast.success('Sheet unlocked.')
    setSheets(prev => prev.map(s => s.id === sheetId ? { ...s, status: 'draft' } : s))
    setStats(prev => ({ ...prev, approved: prev.approved-1, draft: prev.draft+1 }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-brand-500" />
    </div>
  )

  const employees = profiles.filter(p => p.role === 'employee')
  const managers  = profiles.filter(p => p.role === 'manager')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Oversee cycles, completion, and org-wide goal health.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/shared-goals')} className="btn-secondary">
            <Share2 size={15} /> Push Shared Goals
          </button>
          <button onClick={exportCSV} className="btn-primary">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="mb-6">
        <InsightCards role="admin" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Sheets',  val: stats.total,     color: 'text-slate-700' },
          { label: 'Pending',       val: stats.submitted, color: 'text-amber-600' },
          { label: 'Approved',      val: stats.approved,  color: 'text-emerald-600' },
          { label: 'Returned',      val: stats.returned,  color: 'text-red-600' },
          { label: 'Draft',         val: stats.draft,     color: 'text-slate-500' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`font-display text-3xl ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Org overview */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Users size={16} /> Organisation
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Employees', val: employees.length },
              { label: 'Managers',  val: managers.length },
              { label: 'Active Cycles', val: cycles.filter(c=>c.is_active).length },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion rate */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> Completion Rate
          </h3>
          {employees.length > 0 ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Submitted / Employees</span>
                  <span className="font-semibold">
                    {stats.submitted + stats.approved + stats.returned} / {employees.length}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${Math.round(((stats.submitted+stats.approved+stats.returned)/Math.max(employees.length,1))*100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Approved</span>
                  <span className="font-semibold text-emerald-600">{stats.approved} / {employees.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.round((stats.approved/Math.max(employees.length,1))*100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No employees found.</p>
          )}
        </div>

        {/* Cycles */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Settings size={16} /> Goal Cycles
          </h3>
          <div className="space-y-2">
            {cycles.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 truncate">{c.name}</span>
                <span className={c.is_active ? 'badge-approved' : 'badge-draft'}>
                  {c.is_active ? 'Active' : 'Closed'}
                </span>
              </div>
            ))}
            {cycles.length === 0 && <p className="text-sm text-slate-400">No cycles yet.</p>}
          </div>
        </div>
      </div>

      {/* All sheets table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">All Goal Sheets</h2>
          <span className="text-xs text-slate-400">{sheets.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-surface-border">
              <tr>
                {['Employee', 'Department', 'Cycle', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {sheets.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{s.employee?.full_name}</td>
                  <td className="px-5 py-3 text-slate-500">{s.employee?.department || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{s.cycle?.name}</td>
                  <td className="px-5 py-3">
                    <span className={`badge-${s.status}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {s.status === 'approved' && (
                      <button
                        onClick={() => unlockSheet(s.id)}
                        className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <RefreshCcw size={11} /> Unlock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sheets.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No sheets yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
