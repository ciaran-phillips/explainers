import * as React from "react";

// Convert raw demand (in thousands) to units
const toUnits = (val) => val * 1000;
const formatNum = (n) => Math.round(n).toLocaleString();

function calculatePeriodAverage(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

export function SummaryStats({ selectedScenario, allScenarios }) {
  // Calculate averages for selected scenario
  const avg2023_2030 = toUnits(calculatePeriodAverage(selectedScenario, 2023, 2030));
  const avg2030_2040 = toUnits(calculatePeriodAverage(selectedScenario, 2031, 2040));

  // Calculate min/max across all scenarios
  const allAvg2023_2030 = allScenarios.map(s => toUnits(calculatePeriodAverage(s.timeSeries, 2023, 2030)));
  const allAvg2030_2040 = allScenarios.map(s => toUnits(calculatePeriodAverage(s.timeSeries, 2031, 2040)));

  const range2023_2030 = { min: Math.min(...allAvg2023_2030), max: Math.max(...allAvg2023_2030) };
  const range2030_2040 = { min: Math.min(...allAvg2030_2040), max: Math.max(...allAvg2030_2040) };

  return (
    <div className="summary-stats">
      <h3>Projected Housing Demand</h3>

      <div className="stat-row">
        <span className="stat-label">2023-2030 Average:</span>
        <span className="stat-value">{formatNum(avg2023_2030)}/year</span>
      </div>

      <div className="stat-row">
        <span className="stat-label">2030-2040 Average:</span>
        <span className="stat-value">{formatNum(avg2030_2040)}/year</span>
      </div>

      <div className="stat-range">
        <div className="range-header">Range across all scenarios:</div>
        <div className="range-row">
          <span>2023-2030:</span>
          <span>{formatNum(range2023_2030.min)} - {formatNum(range2023_2030.max)}</span>
        </div>
        <div className="range-row">
          <span>2030-2040:</span>
          <span>{formatNum(range2030_2040.min)} - {formatNum(range2030_2040.max)}</span>
        </div>
      </div>
    </div>
  );
}
