import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import GoalForm from '../components/employee/GoalForm'
import { ArrowLeft, CheckCircle2, RotateCcw, Loader2, MessageSquare, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeamGoalReview() {
  const { sheetId }  = useParams()
  const { profile }  = useAuth()
  const navigate     = useNavigate()

  const [sheet,       setSheet]       = useState(null)
  const [employee,    setEmployee]    = useState(null)
  const [goals,       setGoals]       = useState([])
  const [thrustAreas, setThrustAreas] = useState([])
  const [comment,     setComment]     = useState('')
  const [loading,     setLoading]     = useState(true)
  const [acting,      setActing]      = useState(false)

  useEffect(() => {
    async function load() {
      const [sheetRes, taRes] = await Promise.all([
        supabase.from('goal_sheets')
          .select('*, cycle:cycle_id(name), employee:employee_id(id,full_name,email,department,manager:manager_id(full_name))')
          .eq('id', sheetId).single(),
        supabase.from('thrust_areas').select('*').order('name'),
      ])

      if (sheetRes.data) {
        setSheet(sheetRes.data)
        setEmployee(sheetRes.data.employee)
      }
      if (taRes.data) setThrustAreas(taRes.data)

      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('goal_sheet_id', sheetId)
        .order('sort_order')

      setGoals(goalsData?.map(g => ({
        id:             g.id,
        thrust_area_id: g.thrust_area_id || '',
        title:          g.title,
        description:    g.description || '',
        uom_type:       g.uom_type,
        target_value:   g.target_value || '',
        target_date:    g.target_date || '',
        weightage:      g.weightage,
        is_shared:      g.is_shared,
        status:         g.status,
      })) || [])

      setLoading(false)
    }
    load()
  }, [sheetId])

  async function saveManagerEdits() {
    // Manager can update targets & weightage inline
    const updates = goals.map(g => ({
      id: g.id,
      target_value: g.uom_type !== 'timeline' && g.uom_type !== 'zero' ? parseFloat(g.target_value) : null,
      target_date:  g.uom_type === 'timeline' ? g.target_date : null,
      weightage:    parseFloat(g.weightage),
      updated_at:   new Date().toISOString(),
    }))

    for (const u of updates) {
      const { error } = await supabase.from('goals')
        .update({ target_value: u.target_value, target_date: u.target_date, weightage: u.weightage })
        .eq('id', u.id)
      if (error) throw error
    }
  }

  async function handleApprove() {
    const total = goals.reduce((s, g) => s + (parseFloat(g.weightage)||0), 0)
    if (Math.round(total) !== 100) {
      toast.error(`Total weightage is ${total.toFixed(1)}%. Must equal 100% before approving.`)
      return
    }
    setActing(true)
    try {
      await saveManagerEdits()

      // Update sheet status
      await supabase.from('goal_sheets').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      }).eq('id', sheetId)

      // Lock all goals
      await supabase.from('goals').update({ status: 'locked' }).eq('goal_sheet_id', sheetId)

      // Record approval
      await supabase.from('goal_approvals').insert({
        goal_sheet_id: sheetId,
        manager_id: profile.id,
        action: 'approved',
        comment: comment || null,
      })

      // Audit log
      await supabase.from('audit_logs').insert({
        table_name: 'goal_sheets',
        record_id: sheetId,
        changed_by: profile.id,
        change_type: 'APPROVE',
        new_value: { status: 'approved' },
      })

      toast.success(`Goals approved for ${employee?.full_name} ✓`)
      navigate('/manager')
    } catch (err) {
      toast.error(err.message || 'Approval failed.')
    } finally {
      setActing(false)
    }
  }

  async function handleReturn() {
    if (!comment.trim()) {
      toast.error('Please add a comment explaining what needs to be reworked.')
      return
    }
    setActing(true)
    try {
      await supabase.from('goal_sheets').update({ status: 'returned' }).eq('id', sheetId)
      await supabase.from('goal_approvals').insert({
        goal_sheet_id: sheetId,
        manager_id: profile.id,
        action: 'returned',
        comment: comment.trim(),
      })
      await supabase.from('audit_logs').insert({
        table_name: 'goal_sheets',
        record_id: sheetId,
        changed_by: profile.id,
        change_type: 'RETURN',
        new_value: { status: 'returned', comment: comment.trim() },
      })
      toast.success('Goal sheet returned for rework.')
      navigate('/manager')
    } catch (err) {
      toast.error(err.message || 'Action failed.')
    } finally {
      setActing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-brand-500" />
    </div>
  )

  const isSubmitted = sheet?.status === 'submitted'
  const isApproved  = sheet?.status === 'approved'

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/manager')} className="btn-ghost mb-6">
        <ArrowLeft size={16} /> Back to team
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-slate-900">
            {employee?.full_name}'s Goal Sheet
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {employee?.department} · {sheet?.cycle?.name}
          </p>
        </div>
        <span className={`badge-${sheet?.status} text-sm`}>{sheet?.status}</span>
      </div>

      {/* Approved banner */}
      {isApproved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
          <Lock size={16} className="text-emerald-600 mt-0.5" />
          <p className="text-sm text-emerald-700 font-medium">Goals approved and locked.</p>
        </div>
      )}

      {/* Goal form — manager can edit targets/weightage if submitted */}
      <GoalForm
        goals={goals}
        setGoals={setGoals}
        thrustAreas={thrustAreas}
        locked={!isSubmitted}
        managerMode={isSubmitted}
      />

      {/* Manager check-in comment */}
      {(isSubmitted || isApproved) && (
        <div className="mt-6">
          <label className="label flex items-center gap-1.5">
            <MessageSquare size={12} /> Manager Comment
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Add feedback or notes for this employee…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={isApproved || acting}
          />
        </div>
      )}

      {/* Actions */}
      {isSubmitted && (
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-surface-border">
          <button
            onClick={handleReturn}
            disabled={acting}
            className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
          >
            {acting ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
            Return for Rework
          </button>
          <button
            onClick={handleApprove}
            disabled={acting}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700"
          >
            {acting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            Approve Goals
          </button>
        </div>
      )}
    </div>
  )
}
