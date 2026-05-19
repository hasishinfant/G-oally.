import React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function SmartValidation({ goals = [] }) {
  const totalWeightage = goals.reduce((sum, g) => sum + (parseFloat(g.weightage) || 0), 0)
  const isBalanced = totalWeightage === 100
  const hasGoals = goals.length >= 3 && goals.length <= 8
  const allValid = goals.every(g => g.title && g.uom_type && g.weightage)

  const checks = [
    {
      label: 'Weightage balanced perfectly',
      passed: isBalanced,
      detail: `${totalWeightage}% / 100%`,
    },
    {
      label: 'Goal count within policy',
      passed: hasGoals,
      detail: `${goals.length} goals (3-8 required)`,
    },
    {
      label: 'All fields completed',
      passed: allValid,
      detail: allValid ? 'All goals valid' : 'Some fields missing',
    },
  ]

  const allPassed = checks.every(c => c.passed)

  return (
    <div className={`card p-5 ${allPassed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        {allPassed ? (
          <CheckCircle2 size={18} className="text-emerald-600" />
        ) : (
          <AlertCircle size={18} className="text-amber-600" />
        )}
        <h3 className="font-semibold text-slate-700">
          {allPassed ? 'Ready for Submission ✓' : 'Validation Checks'}
        </h3>
      </div>

      <div className="space-y-2">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {check.passed ? (
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${check.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {check.label}
              </p>
              <p className="text-xs text-slate-500">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {allPassed && (
        <div className="mt-4 pt-4 border-t border-emerald-200">
          <p className="text-xs text-emerald-700 font-medium">
            ✓ Ready for manager review
          </p>
        </div>
      )}
    </div>
  )
}
