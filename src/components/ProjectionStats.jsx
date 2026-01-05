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
    <div className="projection-stats">
      <div className="stats-header">
        <span className="scenario-label">{migrationLabel}</span>
        <span className="scenario-separator">+</span>
        <span className="scenario-label">{headshipLabel}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{Math.round(avgDemand).toLocaleString()}</div>
          <div className="stat-label">Average Annual Need</div>
          <div className="stat-sublabel">{startYear}-{endYear}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{Math.round(totalDemand).toLocaleString()}</div>
          <div className="stat-label">Total Units Needed</div>
          <div className="stat-sublabel">{periodYears} years</div>
        </div>

        <div className="stat-card">
          <div className={`stat-value ${gapVsSupply > 0 ? 'gap-positive' : 'gap-negative'}`}>
            {gapVsSupply > 0 ? '+' : ''}{Math.round(gapVsSupply).toLocaleString()}
          </div>
          <div className="stat-label">Gap vs 2023 Supply</div>
          <div className="stat-sublabel">33k baseline</div>
        </div>
      </div>
    </div>
  );
}
