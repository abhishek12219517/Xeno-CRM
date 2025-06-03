"use client"

import { useState } from "react"
import { Plus, Trash2, RotateCcw } from "lucide-react"

const RuleBuilder = ({ rules, onChange }) => {
  const [localRules, setLocalRules] = useState(rules || {})

  const updateRules = (newRules) => {
    setLocalRules(newRules)
    onChange(newRules)
  }

  const addSpendingRule = () => {
    updateRules({
      ...localRules,
      totalSpending: { operator: "gt", value: 10000 },
    })
  }

  const addVisitsRule = () => {
    updateRules({
      ...localRules,
      visits: { operator: "lt", value: 3 },
    })
  }

  const addLastVisitRule = () => {
    updateRules({
      ...localRules,
      lastVisit: { operator: "before", value: 90 },
    })
  }

  const updateSpendingRule = (field, value) => {
    updateRules({
      ...localRules,
      totalSpending: {
        ...localRules.totalSpending,
        [field]: field === "value" ? Number(value) : value,
      },
    })
  }

  const updateVisitsRule = (field, value) => {
    updateRules({
      ...localRules,
      visits: {
        ...localRules.visits,
        [field]: field === "value" ? Number(value) : value,
      },
    })
  }

  const updateLastVisitRule = (field, value) => {
    updateRules({
      ...localRules,
      lastVisit: {
        ...localRules.lastVisit,
        [field]: field === "value" ? Number(value) : value,
      },
    })
  }

  const removeRule = (ruleType) => {
    const newRules = { ...localRules }
    delete newRules[ruleType]
    updateRules(newRules)
  }

  const clearAllRules = () => {
    updateRules({})
  }

  return (
    <div className="space-y-6">
      {/* Rule Builder Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Customer Segmentation Rules</h4>
        <button
          type="button"
          onClick={clearAllRules}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear All
        </button>
      </div>

      {/* Add Rule Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addSpendingRule}
          disabled={localRules.totalSpending}
          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Total Spending
        </button>
        <button
          type="button"
          onClick={addVisitsRule}
          disabled={localRules.visits}
          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Number of Visits
        </button>
        <button
          type="button"
          onClick={addLastVisitRule}
          disabled={localRules.lastVisit}
          className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Last Visit
        </button>
      </div>

      {/* Active Rules */}
      <div className="space-y-4">
        {/* Total Spending Rule */}
        {localRules.totalSpending && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Total Spending</h5>
              <button
                type="button"
                onClick={() => removeRule("totalSpending")}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Condition</label>
                <select
                  value={localRules.totalSpending.operator}
                  onChange={(e) => updateSpendingRule("operator", e.target.value)}
                  className="form-input"
                >
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="eq">Equal to</option>
                </select>
              </div>
              <div>
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  value={localRules.totalSpending.value}
                  onChange={(e) => updateSpendingRule("value", e.target.value)}
                  className="form-input"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Visits Rule */}
        {localRules.visits && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Number of Visits</h5>
              <button type="button" onClick={() => removeRule("visits")} className="text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Condition</label>
                <select
                  value={localRules.visits.operator}
                  onChange={(e) => updateVisitsRule("operator", e.target.value)}
                  className="form-input"
                >
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="eq">Equal to</option>
                </select>
              </div>
              <div>
                <label className="form-label">Number of Visits</label>
                <input
                  type="number"
                  value={localRules.visits.value}
                  onChange={(e) => updateVisitsRule("value", e.target.value)}
                  className="form-input"
                  placeholder="3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Last Visit Rule */}
        {localRules.lastVisit && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Last Visit</h5>
              <button type="button" onClick={() => removeRule("lastVisit")} className="text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Condition</label>
                <select
                  value={localRules.lastVisit.operator}
                  onChange={(e) => updateLastVisitRule("operator", e.target.value)}
                  className="form-input"
                >
                  <option value="before">More than X days ago</option>
                  <option value="after">Less than X days ago</option>
                </select>
              </div>
              <div>
                <label className="form-label">Days</label>
                <input
                  type="number"
                  value={localRules.lastVisit.value}
                  onChange={(e) => updateLastVisitRule("value", e.target.value)}
                  className="form-input"
                  placeholder="90"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Summary */}
      {Object.keys(localRules).length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Rules Summary</h5>
          <div className="text-sm text-gray-700">
            Customers who match <span className="font-medium">ALL</span> of the following conditions:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {localRules.totalSpending && (
                <li>
                  Total spending is{" "}
                  {localRules.totalSpending.operator === "gt"
                    ? "greater than"
                    : localRules.totalSpending.operator === "lt"
                      ? "less than"
                      : "equal to"}{" "}
                  ₹{localRules.totalSpending.value?.toLocaleString()}
                </li>
              )}
              {localRules.visits && (
                <li>
                  Number of visits is{" "}
                  {localRules.visits.operator === "gt"
                    ? "greater than"
                    : localRules.visits.operator === "lt"
                      ? "less than"
                      : "equal to"}{" "}
                  {localRules.visits.value}
                </li>
              )}
              {localRules.lastVisit && (
                <li>
                  Last visit was {localRules.lastVisit.operator === "before" ? "more than" : "less than"}{" "}
                  {localRules.lastVisit.value} days ago
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {Object.keys(localRules).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No rules defined yet. Add rules to segment your audience.</p>
        </div>
      )}
    </div>
  )
}

export default RuleBuilder
