import * as React from "npm:react";
import * as Plot from "npm:@observablehq/plot";

function calculatePeriodAverage(timeSeries, startYear, endYear) {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length;
}

/**
 * Reusable demand chart component
 * @param selectedScenario - Time series data with {year, demand}
 * @param scenarioRange - Range data with {year, min, max}
 * @param width - Chart width
 * @param yearDomain - [startYear, endYear] for x-axis (default: derived from data)
 * @param scale - Multiplier for demand values (default: 1, use 1000 for ESRI data in thousands)
 * @param periodBreak - Year to split period averages (default: midpoint of range)
 */
export function DemandChart({
  selectedScenario,
  scenarioRange,
  width = 800,
  yearDomain,
  scale = 1,
  periodBreak
}) {
  const containerRef = React.useRef(null);

  // Derive year domain from data if not provided
  const years = selectedScenario.map(d => d.year);
  const [startYear, endYear] = yearDomain || [Math.min(...years), Math.max(...years)];
  const midYear = periodBreak || Math.round((startYear + endYear) / 2);

  // Convert data to display units
  const selectedData = selectedScenario.map(d => ({
    year: d.year,
    demand: d.demand * scale
  }));

  const rangeData = scenarioRange.map(d => ({
    year: d.year,
    min: d.min * scale,
    max: d.max * scale
  }));

  const avgFirstPeriod = calculatePeriodAverage(selectedScenario, startYear, midYear) * scale;
  const avgSecondPeriod = calculatePeriodAverage(selectedScenario, midYear + 1, endYear) * scale;

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Calculate label positions for period averages
    const firstPeriodLabelX = Math.round((startYear + midYear) / 2);
    const secondPeriodLabelX = Math.round((midYear + endYear) / 2);

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
        domain: [startYear, endYear]
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

        // Period divider line
        Plot.ruleX([midYear], {
          stroke: "#9ca3af",
          strokeDasharray: "4,4",
          strokeWidth: 1
        }),

        // Average lines for periods
        Plot.ruleY([avgFirstPeriod], {
          x1: startYear,
          x2: midYear,
          stroke: "#10b981",
          strokeDasharray: "2,4",
          strokeWidth: 2
        }),
        Plot.ruleY([avgSecondPeriod], {
          x1: midYear,
          x2: endYear,
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
        Plot.text([{ x: firstPeriodLabelX, y: avgFirstPeriod }], {
          x: "x",
          y: "y",
          text: d => `Avg: ${Math.round(d.y).toLocaleString()}`,
          dy: -10,
          fill: "#059669",
          fontSize: 11
        }),
        Plot.text([{ x: secondPeriodLabelX, y: avgSecondPeriod }], {
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
  }, [selectedScenario, scenarioRange, width, startYear, endYear, midYear, scale]);

  return <div ref={containerRef} className="demand-chart" />;
}
