import React from 'react'

interface TimeSeriesPoint {
  year: number
  demand: number
}

interface Scenario {
  timeSeries: TimeSeriesPoint[]
}

interface ComparisonTableProps {
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

function calculatePeriodTotal(timeSeries: TimeSeriesPoint[], startYear: number, endYear: number): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear)
  return filtered.reduce((sum, d) => sum + d.demand, 0)
}

export function ComparisonTable({ selectedScenario, allScenarios, scale = 1000 }: ComparisonTableProps) {
  const selected = {
    avg2023_2030: calculatePeriodAverage(selectedScenario, 2023, 2030) * scale,
    avg2030_2040: calculatePeriodAverage(selectedScenario, 2031, 2040) * scale,
    total: calculatePeriodTotal(selectedScenario, 2023, 2040) * scale
  }

  const allStats = allScenarios.map(s => ({
    avg2023_2030: calculatePeriodAverage(s.timeSeries, 2023, 2030) * scale,
    avg2030_2040: calculatePeriodAverage(s.timeSeries, 2031, 2040) * scale,
    total: calculatePeriodTotal(s.timeSeries, 2023, 2040) * scale
  }))

  const min = {
    avg2023_2030: Math.min(...allStats.map(s => s.avg2023_2030)),
    avg2030_2040: Math.min(...allStats.map(s => s.avg2030_2040)),
    total: Math.min(...allStats.map(s => s.total))
  }

  const max = {
    avg2023_2030: Math.max(...allStats.map(s => s.avg2023_2030)),
    avg2030_2040: Math.max(...allStats.map(s => s.avg2030_2040)),
    total: Math.max(...allStats.map(s => s.total))
  }

  const avg = {
    avg2023_2030: allStats.reduce((sum, s) => sum + s.avg2023_2030, 0) / allStats.length,
    avg2030_2040: allStats.reduce((sum, s) => sum + s.avg2030_2040, 0) / allStats.length,
    total: allStats.reduce((sum, s) => sum + s.total, 0) / allStats.length
  }

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th className="comparison-table-header"></th>
            <th className="comparison-table-header">2023-2030<br /><span className="comparison-table-subheader">(avg/year)</span></th>
            <th className="comparison-table-header">2030-2040<br /><span className="comparison-table-subheader">(avg/year)</span></th>
            <th className="comparison-table-header">Total<br /><span className="comparison-table-subheader">(18 years)</span></th>
          </tr>
        </thead>
        <tbody>
          <tr className="comparison-table-row-selected">
            <td className="comparison-table-label">Your Scenario</td>
            <td className="comparison-table-cell">{formatNum(selected.avg2023_2030)}</td>
            <td className="comparison-table-cell">{formatNum(selected.avg2030_2040)}</td>
            <td className="comparison-table-cell">{formatNum(selected.total)}</td>
          </tr>
          <tr>
            <td className="comparison-table-label">Minimum</td>
            <td className="comparison-table-cell">{formatNum(min.avg2023_2030)}</td>
            <td className="comparison-table-cell">{formatNum(min.avg2030_2040)}</td>
            <td className="comparison-table-cell">{formatNum(min.total)}</td>
          </tr>
          <tr>
            <td className="comparison-table-label">Maximum</td>
            <td className="comparison-table-cell">{formatNum(max.avg2023_2030)}</td>
            <td className="comparison-table-cell">{formatNum(max.avg2030_2040)}</td>
            <td className="comparison-table-cell">{formatNum(max.total)}</td>
          </tr>
          <tr className="comparison-table-row-avg">
            <td className="comparison-table-label">Average (all scenarios)</td>
            <td className="comparison-table-cell">{formatNum(avg.avg2023_2030)}</td>
            <td className="comparison-table-cell">{formatNum(avg.avg2030_2040)}</td>
            <td className="comparison-table-cell">{formatNum(avg.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
