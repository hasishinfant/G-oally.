import React from 'react'
import { TrendingUp } from 'lucide-react'

export default function GoalHealthScore({ score = 92 }) {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="card p-6 insight-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">Gioally Health Score</h3>
        <TrendingUp size={18} className="text-emerald-500" />
      </div>
      
      <div className="flex items-center gap-6">
        {/* Animated Ring */}
        <div className="relative">
          <svg width="100" height="100" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#healthGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="health-ring"
              style={{ strokeDashoffset: offset }}
            />
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-600">{score}%</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Approved Goals</span>
            <span className="font-semibold text-slate-700">8/8</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Weightage Valid</span>
            <span className="font-semibold text-emerald-600">✓ 100%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Submission Speed</span>
            <span className="font-semibold text-amber-600">2 hours</span>
          </div>
        </div>
      </div>
    </div>
  )
}
