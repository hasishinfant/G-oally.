import React from 'react'

export default function AnimatedProgressBar({ label, value, max = 100, color = 'emerald' }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    emerald: 'bg-emerald-500',
    brand: 'bg-brand-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-700">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full progress-bar ${colorClasses[color] || colorClasses.emerald}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
