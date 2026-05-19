import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import GoalForm, { EMPTY_GOAL } from '../components/employee/GoalForm'
import { ArrowLeft, Send, Save, Lock, Loader2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GoalSheetPage() {
  const { cycleId }  = useParams()
  const { profile }  = useAuth()
  const navigate     = useNavigate()

  const [cycle,       setCycle]       = useState(null)
  const [sheet,       setSheet]       = useState(null)    // goal_sheet row
  const [goals,       setGoals]       = useState([EMPTY_GOAL()])
  const [thrustAreas, setThrustAreas] = useState([])
  const [approvals,   setApprovals]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)

  const locked   = sheet?.status === 'approved'
  const editable = !sheet || ['draft', 'returned'].includes(sheet?.status)

  // ── Load data ──
  useEffect(() => {
    async function load() {
      const [cycleRes, taRes, sheetRes] = await Promise.all([
        supabase.from('goal_cycles').select('*').eq('id', cycleId).single(),
        supabase.from('thrust_areas').select('*').order('name'),
        supabase.from('goal_sheets')
          .select('*')
          .eq('employee_id', profile.id)
          .eq('cycle_id', cycleId)
          .maybeSingle(),
      ])

      if (cycleRes.data)  setCycle(cycleRes.data)
      if (taRes.data)     setThrustAreas(taRes.data)

      if (sheetRes.data) {
        setSheet(sheetRes.data)
        // Load goals for this sheet
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('goal_sheet_id', sheetRes.data.id)
          .order('sort_order')

        setGoals(goalsData?.length ? goalsData.map(g => ({
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
        })) : [EMPTY_GOAL()])

        // Load approvals
        const { data: appData } = await supabase
          .from('goal_approvals')
          .select('*, manager:manager_id(full_name)')
          .eq('goal_sheet_id', sheetRes.data.id)
          .order('acted_at', { ascending: false })
        setApprovals(appData || [])
      }
      setLoading(false)
    }
    if (profile) load()
  }, [cycleId, profile])

  // ── Validation ──
  function validate() {
    const total = goals.reduce((s, g) => s + (parseFloat(g.weightage) || 0), 0)
    if (goals.length === 0) { toast.error('Add at least one goal.'); return false }
    if (goals.length > 8)   { toast.error('Maximum 8 goals allowed.'); return false }
    if (Math.round(total) !== 100) { toast.error(`Total weightage must be 100% (currently ${total.toFixed(1)}%).`); return false }
    for (const [i, g] of goals.entries()) {
      if (!g.title.trim()) { toast.error(`Goal ${i+1}: title is required.`); return false }
      if (!g.thrust_area_id) { toast.error(`Goal ${i+1}: select a thrust area.`); return false }
      if ((parseFloat(g.weightage) || 0) < 10) { toast.error(`Goal ${i+1}: min weightage is 10%.`); return false }
      if (g.uom_type === 'timeline' && !g.target_date) { toast.error(`Goal ${i+1}: target date required.`); return false }
      if (!['timeline','zero'].includes(g.uom_type) && !g.target_value) { toast.error(`Goal ${i+1}: target value required.`); return false }
    }
    return true
  }

  // ── Save draft or submit ──
  async function saveSheet(submit = false) {
    if (submit && !validate()) return
    setSaving(true)
    try {
      let sheetId = sheet?.id

      // Upsert sheet
      if (!sheetId) {
        const { data, error } = await supabase
          .from('goal_sheets')
          .insert({ employee_id: profile.id, cycle_id: cycleId, status: submit ? 'submitted' : 'draft',
                    submitted_at: submit ? new Date().toISOString() : null })
          .select().single()
        if (error) throw error
        sheetId = data.id
        setSheet(data)
      } else {
        const updates = { status: submit ? 'submitted' : 'draft', updated_at: new Date().toISOString() }
        if (submit) updates.submitted_at = new Date().toISOString()
        const { error } = await supabase.from('goal_sheets').update(updates).eq('id', sheetId)
        if (error) throw error
        setSheet(s => ({ ...s, ...updates }))
      }

      // Delete existing goals then re-insert
      await supabase.from('goals').delete().eq('goal_sheet_id', sheetId)

      const goalsPayload = goals.map((g, i) => ({
        goal_sheet_id:  sheetId,
        thrust_area_id: g.thrust_area_id || null,
        title:          g.title.trim(),
        description:    g.description?.trim() || null,
        uom_type:       g.uom_type,
        target_value:   g.uom_type !== 'timeline' && g.uom_type !== 'zero' ? parseFloat(g.target_value) : null,
        target_date:    g.uom_type === 'timeline' ? g.target_date : null,
        weightage:      parseFloat(g.weightage),
        is_shared:      g.is_shared || false,
        sort_order:     i,
        status:         submit ? 'locked' : 'active',
      }))

      const { error: gErr } = await supabase.from('goals').insert(goalsPayload)
      if (gErr) throw gErr

      // Audit log
      await supabase.from('audit_logs').insert({
        table_name: 'goal_sheets',
        record_id:  sheetId,
        changed_by: profile.id,
        change_type: submit ? 'SUBMIT' : 'SAVE_DRAFT',
        new_value:  { status: submit ? 'submitted' : 'draft', goal_count: goals.length },
      })

      toast.success(submit ? 'Goal sheet submitted for approval! ✓' : 'Draft saved.')
      if (submit) navigate('/employee')
    } catch (err) {
      toast.error(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-brand-500" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/employee')} className="btn-ghost">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-slate-900">{cycle?.name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Goal sheet for {profile?.full_name}
          </p>
        </div>
        {sheet && (
          <span className={`badge-${sheet.status} text-sm`}>{sheet.status}</span>
        )}
      </div>

      {/* Return comment */}
      {sheet?.status === 'returned' && approvals[0] && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <MessageSquare size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Returned for rework</p>
            <p className="text-sm text-red-600 mt-0.5">{approvals[0].comment || 'Please review and resubmit.'}</p>
            <p className="text-xs text-red-400 mt-1">— {approvals[0].manager?.full_name}</p>
          </div>
        </div>
      )}

      {/* Lock banner */}
      {locked && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
          <Lock size={16} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Goal sheet approved and locked</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Goals are read-only. Contact your admin for any changes.
            </p>
          </div>
        </div>
      )}

      {/* Goal form */}
      <GoalForm
        goals={goals}
        setGoals={setGoals}
        thrustAreas={thrustAreas}
        locked={locked || sheet?.status === 'submitted'}
      />

      {/* Actions */}
      {editable && (
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-surface-border">
          <button
            onClick={() => saveSheet(false)}
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Draft
          </button>
          <button
            onClick={() => saveSheet(true)}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Submit for Approval
          </button>
        </div>
      )}
    </div>
  )
}
