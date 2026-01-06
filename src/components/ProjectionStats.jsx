import * as React from "npm:react";
import { CONSTANTS, calculatePeriodAverage, calculatePeriodTotal } from "./cohort-calculations.js";

export function ProjectionStats({
  selectedScenario,
  startYear,
  endYear,
  migrationLabel,
  headshipLabel
}) {
  const avgDemand = calculatePeriodAverage(selectedScenario, startYear, endYear);
  const totalDemand = calculatePeriodTotal(selectedScenario, startYear, endYear);
  const gapVsSupply = avgDemand - CONSTANTS.REFERENCE_33K;
  const periodYears = endYear - startYear + 1;

  return (
    <div>
      <div className="projection-stats-header">
        <span className="projection-scenario-label">{migrationLabel}</span>
        <span className="projection-scenario-separator">+</span>
        <span className="projection-scenario-label">{headshipLabel}</span>
      </div>

      <div className="projection-stats-grid">
        <div className="projection-stat-card">
          <div className="projection-stat-value">{Math.round(avgDemand).toLocaleString()}</div>
          <div className="projection-stat-label">Average Annual Need</div>
          <div className="projection-stat-sublabel">{startYear}-{endYear}</div>
        </div>

        <div className="projection-stat-card">
          <div className="projection-stat-value">{Math.round(totalDemand).toLocaleString()}</div>
          <div className="projection-stat-label">Total Units Needed</div>
          <div className="projection-stat-sublabel">{periodYears} years</div>
        </div>

        <div className="projection-stat-card">
          <div className={`projection-stat-value ${gapVsSupply > 0 ? 'projection-stat-value-positive' : 'projection-stat-value-negative'}`}>
            {gapVsSupply > 0 ? '+' : ''}{Math.round(gapVsSupply).toLocaleString()}
          </div>
          <div className="projection-stat-label">Gap vs 2023 Supply</div>
          <div className="projection-stat-sublabel">33k baseline</div>
        </div>
      </div>
    </div>
  );
}
