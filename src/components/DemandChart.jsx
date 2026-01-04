import * as React from "react";
import * as Plot from "npm:@observablehq/plot";

// Convert raw demand (in thousands) to units
const toUnits = (val) => val * 1000;

function calculatePeriodAverage(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

export function DemandChart({ selectedScenario, scenarioRange, width = 800 }) {
  const containerRef = React.useRef(null);

  // Convert data to units for display
  const selectedData = selectedScenario.map(d => ({
    year: d.year,
    demand: toUnits(d.demand)
  }));

  const rangeData = scenarioRange.map(d => ({
    year: d.year,
    min: toUnits(d.min),
    max: toUnits(d.max)
  }));

  const avg2023_2030 = toUnits(calculatePeriodAverage(selectedScenario, 2023, 2030));
  const avg2030_2040 = toUnits(calculatePeriodAverage(selectedScenario, 2031, 2040));

  React.useEffect(() => {
    if (!containerRef.current) return;

    const plot = Plot.plot({
      width,
      height: 400,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 20,
      marginBottom: 40,
      x: {
        label: "Year",
        tickFormat: d => d.toString(),
        domain: [2023, 2040]
      },
      y: {
        label: "Annual Housing Demand (units)",
        grid: true,
        tickFormat: d => d.toLocaleString(),
        domain: [0, Math.max(...rangeData.map(d => d.max)) * 1.1]
      },
      marks: [
        // Range band (min-max across all scenarios)
        Plot.areaY(rangeData, {
          x: "year",
          y1: "min",
          y2: "max",
          fill: "#e5e7eb",
          fillOpacity: 0.7
        }),

        // 2030 divider line
        Plot.ruleX([2030], {
          stroke: "#9ca3af",
          strokeDasharray: "4,4",
          strokeWidth: 1
        }),

        // Average lines for periods
        Plot.ruleY([avg2023_2030], {
          x1: 2023,
          x2: 2030,
          stroke: "#10b981",
          strokeDasharray: "2,4",
          strokeWidth: 2
        }),
        Plot.ruleY([avg2030_2040], {
          x1: 2030,
          x2: 2040,
          stroke: "#10b981",
          strokeDasharray: "2,4",
          strokeWidth: 2
        }),

        // Selected scenario line
        Plot.line(selectedData, {
          x: "year",
          y: "demand",
          stroke: "#2563eb",
          strokeWidth: 3
        }),

        // Points for hover
        Plot.dot(selectedData, {
          x: "year",
          y: "demand",
          fill: "#2563eb",
          r: 5,
          title: d => `${d.year}: ${Math.round(d.demand).toLocaleString()} units`
        }),

        // Average annotations
        Plot.text([{ x: 2026.5, y: avg2023_2030 }], {
          x: "x",
          y: "y",
          text: d => `Avg: ${Math.round(d.y).toLocaleString()}`,
          dy: -10,
          fill: "#059669",
          fontSize: 11
        }),
        Plot.text([{ x: 2035, y: avg2030_2040 }], {
          x: "x",
          y: "y",
          text: d => `Avg: ${Math.round(d.y).toLocaleString()}`,
          dy: -10,
          fill: "#059669",
          fontSize: 11
        })
      ]
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(plot);

    return () => plot.remove();
  }, [selectedScenario, scenarioRange, width]);

  return <div ref={containerRef} className="demand-chart" />;
}
