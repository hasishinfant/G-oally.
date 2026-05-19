import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Target, Clock, CheckCircle2, ChevronRight, Plus, Calendar } from 'lucide-react'
import GoalHealthScore from '../components/shared/GoalHealthScore'
import InsightCards from '../components/shared/InsightCards'
import ActivityTimeline from '../components/shared/ActivityTimeline'

export default function EmployeeDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [cycles,    setCycles]    = useState([])
  const [sheets,    setSheets]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const [cyclesRes, sheetsRes] = await Promise.all([
        supabase.from('goal_cycles').select('*').order('year', { ascending: false }),
        supabase.from('goal_sheets')
          .select('*, cycle:cycle_id(name, year), goals(id)')
          .eq('employee_id', profile.id),
      ])
      if (cyclesRes.data)  setCycles(cyclesRes.data)
      if (sheetsRes.data)  setSheets(sheetsRes.data)
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  function sheetForCycle(cycleId) {
    return sheets.find(s => s.cycle_id === cycleId)
  }

  function statusIcon(status) {
    if (status === 'approved') return <CheckCircle2 size={16} className="text-emerald-500" />
    if (status === 'submitted') return <Clock size={16} className="text-amber-500" />
    return <Target size={16} className="text-brand-500" />
  }

  if (loading) return <Skeleton />

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome banner */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">
          Hello, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500">Manage your goal sheets for each performance cycle.</p>
      </div>

      {/* Goal Health Score */}
      <div className="mb-6">
        <GoalHealthScore score={92} />
      </div>

      {/* Insight Cards */}
      <div className="mb-6">
        <InsightCards role="employee" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Cycles',   val: cycles.length,                          color: 'text-brand-600' },
          { label: 'Goal Sheets',     val: sheets.length,                          color: 'text-slate-700' },
          { label: 'Approved',        val: sheets.filter(s=>s.status==='approved').length, color: 'text-emerald-600' },
          { label: 'Pending Review',  val: sheets.filter(s=>s.status==='submitted').length, color: 'text-amber-600' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`font-display text-3xl ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycles */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-slate-700 mb-4">Performance Cycles</h2>
          <div className="space-y-3">
            {cycles.map(cycle => {
              const sheet = sheetForCycle(cycle.id)
              return (
                <div
                  key={cycle.id}
                  className="card p-5 flex items-center gap-5 cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => navigate(`/employee/goals/${cycle.id}`)}
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Calendar size={22} className="text-brand-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{cycle.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {sheet ? (
                        <>
                          {statusIcon(sheet.status)}
                          <span className={`badge-${sheet.status}`}>{sheet.status}</span>
                          <span className="text-xs text-slate-400">{sheet.goals?.length || 0} goals</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Plus size={12} /> Start your goal sheet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    {!sheet && (
                      <span className="text-xs px-2 py-1 bg-brand-50 text-brand-600 rounded-full font-medium">
                        New
                      </span>
                    )}
                    <ChevronRight size={18} />
                  </div>
                </div>
              )
            })}

            {cycles.length === 0 && (
              <div className="card p-12 text-center text-slate-400">
                <Target size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active goal cycles yet 🎯</p>
                <p className="text-xs mt-1">Check back when your admin opens a new cycle.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <ActivityTimeline />
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-6">
      <div className="h-10 bg-slate-200 rounded w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-xl" />
        ))}
      </div>
      {[...Array(2)].map((_,i) => (
        <div key={i} className="h-20 bg-slate-200 rounded-xl" />
      ))}
    </div>
  )
}
