import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Trash2, AlertCircle } from 'lucide-react'

const UOM_OPTIONS = [
  { value: 'numeric_min', label: 'Numeric – Higher is better (e.g. Revenue)',  hint: 'Achievement ÷ Target' },
  { value: 'numeric_max', label: 'Numeric – Lower is better (e.g. TAT, Cost)', hint: 'Target ÷ Achievement' },
  { value: 'timeline',    label: 'Timeline – Date-based completion',            hint: 'Completion vs. Deadline' },
  { value: 'zero',        label: 'Zero-based – Zero = 100% (e.g. Incidents)',   hint: 'If 0 → 100%, else 0%' },
]

export const EMPTY_GOAL = () => ({
  id:             null,
  thrust_area_id: '',
  title:          '',
  description:    '',
  uom_type:       'numeric_min',
  target_value:   '',
  target_date:    '',
  weightage:      '',
  is_shared:      false,
})

export default function GoalForm({
  goals,
  setGoals,
  thrustAreas,
  locked = false,
  managerMode = false,  // manager can edit targets/weightage inline
}) {
  const total = goals.reduce((s, g) => s + (parseFloat(g.weightage) || 0), 0)

  const validationErrors = () => {
    const errs = []
    if (goals.length > 8) errs.push('Maximum 8 goals allowed.')
    if (Math.round(total) !== 100) errs.push(`Total weightage must equal 100% (currently ${total.toFixed(1)}%).`)
    goals.forEach((g, i) => {
      if ((parseFloat(g.weightage) || 0) < 10) errs.push(`Goal ${i+1}: minimum weightage is 10%.`)
      if (!g.title.trim()) errs.push(`Goal ${i+1}: title is required.`)
      if (!g.thrust_area_id) errs.push(`Goal ${i+1}: thrust area is required.`)
      if (g.uom_type !== 'timeline' && g.uom_type !== 'zero' && !g.target_value)
        errs.push(`Goal ${i+1}: target value is required.`)
      if (g.uom_type === 'timeline' && !g.target_date)
        errs.push(`Goal ${i+1}: target date is required.`)
    })
    return errs
  }

  function addGoal() {
    if (goals.length >= 8) return
    setGoals(prev => [...prev, EMPTY_GOAL()])
  }

  function removeGoal(idx) {
    setGoals(prev => prev.filter((_, i) => i !== idx))
  }

  function updateGoal(idx, field, value) {
    setGoals(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))
  }

  const errors = validationErrors()

  return (
    <div className="space-y-4">
      {/* Weightage summary bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              Math.round(total) === 100 ? 'bg-emerald-500' : total > 100 ? 'bg-red-500' : 'bg-brand-500'
            }`}
            style={{ width: `${Math.min(total, 100)}%` }}
          />
        </div>
        <span className={`text-sm font-semibold font-mono tabular-nums w-16 text-right ${
          Math.round(total) === 100 ? 'text-emerald-600' : total > 100 ? 'text-red-600' : 'text-brand-700'
        }`}>
          {total.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">/ 100%</span>
      </div>

      {/* Error banner */}
      {!locked && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold mb-1">
            <AlertCircle size={13} /> Validation issues
          </div>
          {errors.map((e, i) => <p key={i}>• {e}</p>)}
        </div>
      )}

      {/* Goal cards */}
      {goals.map((goal, idx) => (
        <GoalCard
          key={idx}
          goal={goal}
          index={idx}
          thrustAreas={thrustAreas}
          locked={locked && !managerMode}
          managerMode={managerMode}
          onUpdate={(f, v) => updateGoal(idx, f, v)}
          onRemove={() => removeGoal(idx)}
        />
      ))}

      {/* Add goal */}
      {!locked && (
        <button
          onClick={addGoal}
          disabled={goals.length >= 8}
          className="w-full py-3 border-2 border-dashed border-surface-border rounded-xl text-sm text-slate-500
                     hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/40 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add goal {goals.length}/8
        </button>
      )}
    </div>
  )
}

function GoalCard({ goal, index, thrustAreas, locked, managerMode, onUpdate, onRemove }) {
  const uomInfo = UOM_OPTIONS.find(u => u.value === goal.uom_type)

  return (
    <div className={`card p-5 space-y-4 ${goal.is_shared ? 'border-l-4 border-l-brand-400' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        {goal.is_shared && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-600">Shared goal</span>
        )}
        <div className="flex-1" />
        {/* Weightage badge */}
        <div className={`text-sm font-semibold font-mono px-3 py-1 rounded-full ${
          (parseFloat(goal.weightage)||0) < 10 ? 'bg-red-100 text-red-600'
          : 'bg-brand-50 text-brand-700'
        }`}>
          {goal.weightage || '0'}%
        </div>
        {!locked && (
          <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thrust Area */}
        <div>
          <label className="label">Thrust Area</label>
          {locked && !managerMode ? (
            <p className="text-sm text-slate-700 py-1">
              {thrustAreas.find(t => t.id === goal.thrust_area_id)?.name || '—'}
            </p>
          ) : (
            <select
              className="input"
              value={goal.thrust_area_id}
              onChange={e => onUpdate('thrust_area_id', e.target.value)}
              disabled={locked || goal.is_shared}
            >
              <option value="">Select…</option>
              {thrustAreas.map(ta => (
                <option key={ta.id} value={ta.id}>{ta.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Weightage */}
        <div>
          <label className="label">Weightage (%)</label>
          {locked && !managerMode ? (
            <p className="text-sm font-semibold text-slate-700 py-1">{goal.weightage}%</p>
          ) : (
            <input
              type="number" min="10" max="100" step="5"
              className="input"
              placeholder="e.g. 20"
              value={goal.weightage}
              onChange={e => onUpdate('weightage', e.target.value)}
            />
          )}
        </div>

        {/* Title */}
        <div className="md:col-span-2">
          <label className="label">Goal Title</label>
          {(locked && !managerMode) || goal.is_shared ? (
            <p className="text-sm font-medium text-slate-800 py-1">{goal.title || '—'}</p>
          ) : (
            <input
              type="text"
              className="input"
              placeholder="Clear, measurable goal title…"
              value={goal.title}
              onChange={e => onUpdate('title', e.target.value)}
            />
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="label">Description <span className="text-slate-300 normal-case">(optional)</span></label>
          {(locked && !managerMode) || goal.is_shared ? (
            <p className="text-sm text-slate-500 py-1">{goal.description || '—'}</p>
          ) : (
            <textarea
              className="input resize-none" rows={2}
              placeholder="Brief context or success criteria…"
              value={goal.description}
              onChange={e => onUpdate('description', e.target.value)}
            />
          )}
        </div>

        {/* UoM */}
        <div>
          <label className="label">Unit of Measurement</label>
          {(locked && !managerMode) || goal.is_shared ? (
            <div>
              <p className="text-sm text-slate-700 py-1">{uomInfo?.label}</p>
              <p className="text-xs text-slate-400">{uomInfo?.hint}</p>
            </div>
          ) : (
            <select
              className="input"
              value={goal.uom_type}
              onChange={e => onUpdate('uom_type', e.target.value)}
              disabled={goal.is_shared}
            >
              {UOM_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Target */}
        <div>
          <label className="label">Target</label>
          {(locked && !managerMode) || goal.is_shared ? (
            <p className="text-sm font-medium text-slate-800 py-1">
              {goal.uom_type === 'timeline' ? (goal.target_date || '—') : (goal.target_value || '—')}
              {goal.uom_type === 'zero' ? ' (zero incidents)' : ''}
            </p>
          ) : (
            goal.uom_type === 'timeline' ? (
              <input
                type="date"
                className="input"
                value={goal.target_date}
                onChange={e => onUpdate('target_date', e.target.value)}
              />
            ) : goal.uom_type === 'zero' ? (
              <input
                type="text" className="input" value="0 (zero)"
                disabled
              />
            ) : (
              <input
                type="number" min="0"
                className="input"
                placeholder="Target value"
                value={goal.target_value}
                onChange={e => onUpdate('target_value', e.target.value)}
              />
            )
          )}
          {uomInfo && !locked && (
            <p className="text-xs text-slate-400 mt-1">Formula: {uomInfo.hint}</p>
          )}
        </div>
      </div>
    </div>
  )
}
