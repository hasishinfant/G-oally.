import React from 'react'
import { Clock } from 'lucide-react'

const activities = [
  { text: 'Alice submitted goals', time: '2 hours ago', color: 'bg-brand-500' },
  { text: 'Bob approved Revenue KPI', time: '5 hours ago', color: 'bg-emerald-500' },
  { text: 'Shared goal pushed to Sales', time: '1 day ago', color: 'bg-amber-500' },
  { text: 'FY 2025 cycle activated', time: '2 days ago', color: 'bg-slate-500' },
]

export default function ActivityTimeline() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-700">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full ${activity.color} mt-2 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
