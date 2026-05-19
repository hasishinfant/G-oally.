import React, { useState } from 'react'
import { Sparkles, X } from 'lucide-react'

const suggestions = [
  {
    title: 'Increase quarterly revenue by 15%',
    description: 'Drive sales growth through new customer acquisition',
    thrustArea: 'Revenue Growth',
    uomType: 'numeric_max',
    targetValue: 15,
    weightage: 20,
  },
  {
    title: 'Reduce ticket resolution time by 20%',
    description: 'Improve customer support efficiency',
    thrustArea: 'Customer Satisfaction',
    uomType: 'numeric_min',
    targetValue: 20,
    weightage: 15,
  },
  {
    title: 'Improve customer satisfaction to 92%',
    description: 'Enhance service quality and customer experience',
    thrustArea: 'Customer Satisfaction',
    uomType: 'numeric_max',
    targetValue: 92,
    weightage: 20,
  },
  {
    title: 'Complete digital transformation roadmap',
    description: 'Implement cloud migration and automation',
    thrustArea: 'Digital Transformation',
    uomType: 'timeline',
    targetDate: '2025-12-31',
    weightage: 25,
  },
]

export default function AIGoalSuggestion({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSelect(suggestion) {
    onSelect(suggestion)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary"
      >
        <Sparkles size={16} className="text-brand-600" />
        AI Suggest Goals
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-brand-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-slate-900">AI Goal Suggestions</h2>
                  <p className="text-xs text-slate-500">Smart recommendations based on your role</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Suggestions */}
            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="card p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => handleSelect(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={14} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 mb-1">{suggestion.title}</h3>
                      <p className="text-xs text-slate-500 mb-2">{suggestion.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full font-medium">
                          {suggestion.thrustArea}
                        </span>
                        <span className="text-slate-400">
                          Weightage: {suggestion.weightage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
              <p className="text-xs text-slate-500">
                ✨ Powered by AI · Click any suggestion to auto-fill
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
