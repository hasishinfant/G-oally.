import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Share2, Loader2, CheckCircle2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const UOM_OPTIONS = [
  { value: 'numeric_min', label: 'Numeric – Higher is better' },
  { value: 'numeric_max', label: 'Numeric – Lower is better' },
  { value: 'timeline',    label: 'Timeline – Date-based' },
  { value: 'zero',        label: 'Zero-based' },
]

export default function SharedGoalsPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [thrustAreas, setThrustAreas] = useState([])
  const [cycles,      setCycles]      = useState([])
  const [employees,   setEmployees]   = useState([])
  const [pushing,     setPushing]     = useState(false)
  const [done,        setDone]        = useState(false)

  const [form, setForm] = useState({
    cycle_id:       '',
    thrust_area_id: '',
    title:          '',
    description:    '',
    uom_type:       'numeric_min',
    target_value:   '',
    target_date:    '',
    department:     '',       // filter employees by dept
    weightage:      '20',
  })
  const [selectedEmployees, setSelectedEmployees] = useState([])

  useEffect(() => {
    async function load() {
      const [taRes, cyclesRes, empRes] = await Promise.all([
        supabase.from('thrust_areas').select('*').order('name'),
        supabase.from('goal_cycles').select('*').order('year', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'employee'),
      ])
      if (taRes.data)    setThrustAreas(taRes.data)
      if (cyclesRes.data) setCycles(cyclesRes.data)
      if (empRes.data)    setEmployees(empRes.data)
    }
    load()
  }, [])

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]
  const filteredEmps = form.department
    ? employees.filter(e => e.department === form.department)
    : employees

  function toggleEmp(id) {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function selectAll() {
    setSelectedEmployees(filteredEmps.map(e => e.id))
  }

  async function pushGoal() {
    if (!form.cycle_id)       { toast.error('Select a cycle.'); return }
    if (!form.title.trim())   { toast.error('Goal title required.'); return }
    if (!form.thrust_area_id) { toast.error('Select a thrust area.'); return }
    if (selectedEmployees.length === 0) { toast.error('Select at least one employee.'); return }
    if (parseFloat(form.weightage) < 10) { toast.error('Min weightage 10%.'); return }

    setPushing(true)
    try {
      // For each selected employee, ensure a goal sheet exists and add the shared goal
      for (const empId of selectedEmployees) {
        // Upsert goal sheet
        let sheetId
        const { data: existingSheet } = await supabase
          .from('goal_sheets')
          .select('id, status')
          .eq('employee_id', empId)
          .eq('cycle_id', form.cycle_id)
          .maybeSingle()

        if (existingSheet) {
          if (existingSheet.status === 'approved') continue  // skip locked sheets
          sheetId = existingSheet.id
        } else {
          const { data: newSheet, error } = await supabase
            .from('goal_sheets')
            .insert({ employee_id: empId, cycle_id: form.cycle_id, status: 'draft' })
            .select().single()
          if (error) throw error
          sheetId = newSheet.id
        }

        // Insert shared goal
        await supabase.from('goals').insert({
          goal_sheet_id:  sheetId,
          thrust_area_id: form.thrust_area_id,
          title:          form.title.trim(),
          description:    form.description?.trim() || null,
          uom_type:       form.uom_type,
          target_value:   !['timeline','zero'].includes(form.uom_type) ? parseFloat(form.target_value) : null,
          target_date:    form.uom_type === 'timeline' ? form.target_date : null,
          weightage:      parseFloat(form.weightage),
          is_shared:      true,
          status:         'active',
        })
      }

      await supabase.from('audit_logs').insert({
        table_name: 'goals',
        record_id:  crypto.randomUUID(),
        changed_by: profile.id,
        change_type: 'PUSH_SHARED_GOAL',
        new_value: { title: form.title, pushed_to: selectedEmployees.length },
      })

      setDone(true)
      toast.success(`Shared goal pushed to ${selectedEmployees.length} employee(s)! ✓`)
    } catch (err) {
      toast.error(err.message || 'Push failed.')
    } finally {
      setPushing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin')} className="btn-ghost mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl text-slate-900 mb-1">Push Shared Goal</h1>
      <p className="text-slate-500 text-sm mb-8">
        Broadcast a departmental KPI to selected employees. Employees can adjust weightage only.
      </p>

      {done ? (
        <div className="card p-12 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="font-display text-2xl text-slate-800 mb-2">Goal pushed successfully!</h2>
          <p className="text-slate-500 mb-6">Pushed to {selectedEmployees.length} employee(s).</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setDone(false); setSelectedEmployees([]) }} className="btn-secondary">
              Push another
            </button>
            <button onClick={() => navigate('/admin')} className="btn-primary">
              Back to dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Goal definition */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-700">Goal Details</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Cycle</label>
                <select className="input" value={form.cycle_id} onChange={e => setForm(f=>({...f,cycle_id:e.target.value}))}>
                  <option value="">Select cycle…</option>
                  {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Thrust Area</label>
                <select className="input" value={form.thrust_area_id} onChange={e => setForm(f=>({...f,thrust_area_id:e.target.value}))}>
                  <option value="">Select…</option>
                  {thrustAreas.map(ta => <option key={ta.id} value={ta.id}>{ta.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Goal Title</label>
                <input type="text" className="input" placeholder="e.g. Achieve 98% customer satisfaction" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description (optional)</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div>
                <label className="label">Unit of Measurement</label>
                <select className="input" value={form.uom_type} onChange={e => setForm(f=>({...f,uom_type:e.target.value}))}>
                  {UOM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Target</label>
                {form.uom_type === 'timeline' ? (
                  <input type="date" className="input" value={form.target_date} onChange={e => setForm(f=>({...f,target_date:e.target.value}))} />
                ) : form.uom_type === 'zero' ? (
                  <input type="text" className="input" value="0" disabled />
                ) : (
                  <input type="number" min="0" className="input" placeholder="Target value" value={form.target_value} onChange={e => setForm(f=>({...f,target_value:e.target.value}))} />
                )}
              </div>
              <div>
                <label className="label">Default Weightage (%)</label>
                <input type="number" min="10" max="100" className="input" value={form.weightage} onChange={e => setForm(f=>({...f,weightage:e.target.value}))} />
                <p className="text-xs text-slate-400 mt-1">Employees can change this on their sheet.</p>
              </div>
            </div>
          </div>

          {/* Employee selection */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <Users size={16} /> Select Employees
              </h2>
              <div className="flex items-center gap-3">
                <select className="input py-1 text-xs" style={{width:'auto'}} value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))}>
                  <option value="">All departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={selectAll} className="btn-ghost text-xs">Select all</button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredEmps.map(emp => (
                <label key={emp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => toggleEmp(emp.id)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {emp.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{emp.full_name}</p>
                    <p className="text-xs text-slate-400">{emp.email} · {emp.department || 'No dept'}</p>
                  </div>
                </label>
              ))}
              {filteredEmps.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No employees found.</p>
              )}
            </div>

            {selectedEmployees.length > 0 && (
              <p className="text-xs text-brand-600 font-medium mt-3">
                {selectedEmployees.length} employee(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate('/admin')} className="btn-secondary">Cancel</button>
            <button onClick={pushGoal} disabled={pushing} className="btn-primary">
              {pushing ? <><Loader2 size={15} className="animate-spin" /> Pushing…</> : <><Share2 size={15} /> Push Goal</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
