import * as React from "npm:react";
import * as Plot from "npm:@observablehq/plot";
import { COHORT_GROUPS } from "./cohort-calculations.js";

const GROUP_COLORS = {
  "15-24": "#93c5fd",
  "25-34": "#3b82f6",
  "35-44": "#1d4ed8",
  "45-54": "#7c3aed",
  "55-64": "#a855f7",
  "65+": "#d946ef"
};

const GROUP_ORDER = ["15-24", "25-34", "35-44", "45-54", "55-64", "65+"];

export function CohortBreakdownChart({
  selectedScenario,
  startYear,
  endYear,
  width = 800
}) {
  const containerRef = React.useRef(null);

  // Filter and transform data for stacked area chart
  const filteredData = selectedScenario.filter(
    d => d.year >= startYear && d.year <= endYear
  );

  // Transform to long format for Plot.stackY
  const stackedData = [];
  for (const point of filteredData) {
    for (const group of GROUP_ORDER) {
      stackedData.push({
        year: point.year,
        group,
        households: point.byGroup?.[group] || 0,
        growth: point.growthByGroup?.[group] || 0
      });
    }
  }

  React.useEffect(() => {
    if (!containerRef.current || stackedData.length === 0) return;

    const plot = Plot.plot({
      width,
      height: 300,
      marginLeft: 70,
      marginRight: 120,
      marginTop: 20,
      marginBottom: 40,
      x: {
        label: "Year",
        tickFormat: d => d.toString(),
        domain: [startYear, endYear]
      },
      y: {
        label: "Households (millions)",
        grid: true,
        tickFormat: d => (d / 1000000).toFixed(1) + "M"
      },
      color: {
        domain: GROUP_ORDER,
        range: GROUP_ORDER.map(g => GROUP_COLORS[g]),
        legend: true
      },
      marks: [
        Plot.areaY(stackedData,
          Plot.stackY({
            x: "year",
            y: "households",
            fill: "group",
            order: GROUP_ORDER,
            title: d => `${d.group}: ${Math.round(d.households).toLocaleString()} households`
          })
        ),
        Plot.lineY(stackedData,
          Plot.stackY({
            x: "year",
            y: "households",
            stroke: "group",
            strokeWidth: 0.5,
            order: GROUP_ORDER
          })
        )
      ]
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(plot);

    return () => plot.remove();
  }, [selectedScenario, startYear, endYear, width]);

  return (
    <div className="cohort-breakdown">
      <div ref={containerRef} className="cohort-chart" />
      <div className="cohort-legend">
        {GROUP_ORDER.map(group => (
          <div key={group} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: GROUP_COLORS[group] }}
            />
            <span className="legend-label">{group}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
