import React from 'react'

interface TimeSeriesPoint {
  year: number
  demand: number
}

interface Scenario {
  timeSeries: TimeSeriesPoint[]
}

interface SummaryStatsProps {
  selectedScenario: TimeSeriesPoint[]
  allScenarios: Scenario[]
  scale?: number
}

const formatNum = (n: number): string => Math.round(n).toLocaleString()

function calculatePeriodAverage(timeSeries: TimeSeriesPoint[], startYear: number, endYear: number): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear)
  if (filtered.length === 0) return 0
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length
}

export function SummaryStats({ selectedScenario, allScenarios, scale = 1000 }: SummaryStatsProps) {
  const avg2023_2030 = calculatePeriodAverage(selectedScenario, 2023, 2030) * scale
  const avg2030_2040 = calculatePeriodAverage(selectedScenario, 2031, 2040) * scale

  const allAvg2023_2030 = allScenarios.map(s => calculatePeriodAverage(s.timeSeries, 2023, 2030) * scale)
  const allAvg2030_2040 = allScenarios.map(s => calculatePeriodAverage(s.timeSeries, 2031, 2040) * scale)

  const range2023_2030 = { min: Math.min(...allAvg2023_2030), max: Math.max(...allAvg2023_2030) }
  const range2030_2040 = { min: Math.min(...allAvg2030_2040), max: Math.max(...allAvg2030_2040) }

  return (
    <div>
      <h3 className="summary-stats-title">Projected Housing Demand</h3>

      <div className="summary-stat-row">
        <span className="summary-stat-label">2023-2030 Average:</span>
        <span className="summary-stat-value">{formatNum(avg2023_2030)}/year</span>
      </div>

      <div className="summary-stat-row">
        <span className="summary-stat-label">2030-2040 Average:</span>
        <span className="summary-stat-value">{formatNum(avg2030_2040)}/year</span>
      </div>

      <div className="summary-stat-range">
        <div className="summary-range-header">Range across all scenarios:</div>
        <div className="summary-range-row">
          <span>2023-2030:</span>
          <span>{formatNum(range2023_2030.min)} - {formatNum(range2023_2030.max)}</span>
        </div>
        <div className="summary-range-row">
          <span>2030-2040:</span>
          <span>{formatNum(range2030_2040.min)} - {formatNum(range2030_2040.max)}</span>
        </div>
      </div>
    </div>
  )
}
