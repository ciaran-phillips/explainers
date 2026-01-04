import * as React from "react";

// Convert raw demand (in thousands) to units
const toUnits = (val) => val * 1000;
const formatNum = (n) => Math.round(n).toLocaleString();

function calculatePeriodAverage(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

function calculatePeriodTotal(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  return filtered.reduce((sum, d) => sum + d.demand, 0);
}

export function ComparisonTable({ selectedScenario, allScenarios }) {
  // Calculate for selected scenario
  const selected = {
    avg2023_2030: toUnits(calculatePeriodAverage(selectedScenario, 2023, 2030)),
    avg2030_2040: toUnits(calculatePeriodAverage(selectedScenario, 2031, 2040)),
    total: toUnits(calculatePeriodTotal(selectedScenario, 2023, 2040))
  };

  // Calculate for all scenarios
  const allStats = allScenarios.map(s => ({
    avg2023_2030: toUnits(calculatePeriodAverage(s.timeSeries, 2023, 2030)),
    avg2030_2040: toUnits(calculatePeriodAverage(s.timeSeries, 2031, 2040)),
    total: toUnits(calculatePeriodTotal(s.timeSeries, 2023, 2040))
  }));

  const min = {
    avg2023_2030: Math.min(...allStats.map(s => s.avg2023_2030)),
    avg2030_2040: Math.min(...allStats.map(s => s.avg2030_2040)),
    total: Math.min(...allStats.map(s => s.total))
  };

  const max = {
    avg2023_2030: Math.max(...allStats.map(s => s.avg2023_2030)),
    avg2030_2040: Math.max(...allStats.map(s => s.avg2030_2040)),
    total: Math.max(...allStats.map(s => s.total))
  };

  const avg = {
    avg2023_2030: allStats.reduce((sum, s) => sum + s.avg2023_2030, 0) / allStats.length,
    avg2030_2040: allStats.reduce((sum, s) => sum + s.avg2030_2040, 0) / allStats.length,
    total: allStats.reduce((sum, s) => sum + s.total, 0) / allStats.length
  };

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th></th>
            <th>2023-2030<br /><span className="subheader">(avg/year)</span></th>
            <th>2030-2040<br /><span className="subheader">(avg/year)</span></th>
            <th>Total<br /><span className="subheader">(18 years)</span></th>
          </tr>
        </thead>
        <tbody>
          <tr className="selected-row">
            <td className="label-cell">Your Scenario</td>
            <td>{formatNum(selected.avg2023_2030)}</td>
            <td>{formatNum(selected.avg2030_2040)}</td>
            <td>{formatNum(selected.total)}</td>
          </tr>
          <tr>
            <td className="label-cell">Minimum</td>
            <td>{formatNum(min.avg2023_2030)}</td>
            <td>{formatNum(min.avg2030_2040)}</td>
            <td>{formatNum(min.total)}</td>
          </tr>
          <tr>
            <td className="label-cell">Maximum</td>
            <td>{formatNum(max.avg2023_2030)}</td>
            <td>{formatNum(max.avg2030_2040)}</td>
            <td>{formatNum(max.total)}</td>
          </tr>
          <tr className="avg-row">
            <td className="label-cell">Average (all scenarios)</td>
            <td>{formatNum(avg.avg2023_2030)}</td>
            <td>{formatNum(avg.avg2030_2040)}</td>
            <td>{formatNum(avg.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
