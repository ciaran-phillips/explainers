import * as React from "npm:react";
import { calculatePeriodAverage } from "./cohort-calculations.js";

export function ScenarioComparisonTable({
  allScenarios,
  selectedId,
  startYear,
  endYear
}) {
  // Get demand at specific years
  const getYearDemand = (timeSeries, year) => {
    const point = timeSeries.find(d => d.year === year);
    return point ? point.demand : null;
  };

  // Group scenarios by migration
  const migrationGroups = {
    M1: allScenarios.filter(s => s.migration === "M1"),
    M2: allScenarios.filter(s => s.migration === "M2"),
    M3: allScenarios.filter(s => s.migration === "M3")
  };

  const comparisonYears = [2030, 2040, 2050].filter(y => y <= endYear && y >= startYear);

  return (
    <div className="scenario-table-wrapper">
      <table className="scenario-table">
        <thead>
          <tr>
            <th className="scenario-table-header">Scenario</th>
            {comparisonYears.map(year => (
              <th className="scenario-table-header" key={year}>{year}</th>
            ))}
            <th className="scenario-table-header">Average<br /><span className="scenario-table-subheader">{startYear}-{endYear}</span></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(migrationGroups).map(([migKey, scenarios]) => (
            <React.Fragment key={migKey}>
              <tr>
                <td className="scenario-table-migration-header" colSpan={comparisonYears.length + 2}>
                  {scenarios[0]?.migrationLabel || migKey}
                </td>
              </tr>
              {scenarios.map(scenario => {
                const isSelected = scenario.id === selectedId;
                const avg = calculatePeriodAverage(scenario.timeSeries, startYear, endYear);

                return (
                  <tr key={scenario.id} className={isSelected ? 'scenario-table-row-selected' : ''}>
                    <td className="scenario-table-label">{scenario.headshipLabel}</td>
                    {comparisonYears.map(year => {
                      const demand = getYearDemand(scenario.timeSeries, year);
                      return (
                        <td className="scenario-table-cell" key={year}>
                          {demand !== null ? Math.round(demand).toLocaleString() : '-'}
                        </td>
                      );
                    })}
                    <td className="scenario-table-cell-avg">{Math.round(avg).toLocaleString()}</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
