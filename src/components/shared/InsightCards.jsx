import React from 'react'
import { TrendingUp, AlertTriangle, Award, Target, BarChart3, Zap } from 'lucide-react'

const insights = {
  employee: [
    { icon: TrendingUp, text: "You're ahead of 82% of employees", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Target, text: "Revenue goals contribute highest impact", color: "text-brand-600", bg: "bg-brand-50" },
    { icon: Zap, text: "Goal sheet approved in 2 hours", color: "text-amber-600", bg: "bg-amber-50" },
  ],
  manager: [
    { icon: AlertTriangle, text: "2 employees haven't submitted goals", color: "text-red-600", bg: "bg-red-50" },
    { icon: BarChart3, text: "Team completion improved 34%", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Award, text: "Fastest approval turnaround this cycle", color: "text-brand-600", bg: "bg-brand-50" },
  ],
  admin: [
    { icon: BarChart3, text: "Sales department leads completion", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: AlertTriangle, text: "HR has delayed check-ins", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: Award, text: "98% policy compliance", color: "text-brand-600", bg: "bg-brand-50" },
  ],
}

export default function InsightCards({ role = 'employee' }) {
  const roleInsights = insights[role] || insights.employee

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {roleInsights.map((insight, idx) => {
        const Icon = insight.icon
        return (
          <div key={idx} className="card p-4 insight-card">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={insight.color} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
