import * as React from "npm:react";
import * as Plot from "npm:@observablehq/plot";
import { CONSTANTS } from "./cohort-calculations.js";

export function ProjectionChart({
  selectedScenario,
  scenarioRange,
  startYear,
  endYear,
  width = 800
}) {
  const containerRef = React.useRef(null);

  // Filter data to selected year range
  const selectedData = selectedScenario.filter(
    d => d.year >= startYear && d.year <= endYear
  );

  const rangeData = scenarioRange.filter(
    d => d.year >= startYear && d.year <= endYear
  );

  // Calculate period average
  const avgDemand = selectedData.length > 0
    ? selectedData.reduce((sum, d) => sum + d.demand, 0) / selectedData.length
    : 0;

  React.useEffect(() => {
    if (!containerRef.current) return;

    const maxDemand = Math.max(
      ...rangeData.map(d => d.max),
      CONSTANTS.REFERENCE_52K,
      ...selectedData.map(d => d.demand)
    );

    const plot = Plot.plot({
      width,
      height: 400,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 30,
      marginBottom: 40,
      x: {
        label: "Year",
        tickFormat: d => d.toString(),
        domain: [startYear, endYear]
      },
      y: {
        label: "Annual Housing Need (units)",
        grid: true,
        tickFormat: d => d.toLocaleString(),
        domain: [0, maxDemand * 1.15]
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

        // 52k reference line
        Plot.ruleY([CONSTANTS.REFERENCE_52K], {
          stroke: "#ea580c",
          strokeDasharray: "6,4",
          strokeWidth: 2
        }),

        // 52k label
        Plot.text([{ x: endYear, y: CONSTANTS.REFERENCE_52K }], {
          x: "x",
          y: "y",
          text: "52k (Report estimate)",
          textAnchor: "end",
          dx: -5,
          dy: -8,
          fill: "#ea580c",
          fontSize: 11,
          fontWeight: 500
        }),

        // 33k reference line
        Plot.ruleY([CONSTANTS.REFERENCE_33K], {
          stroke: "#dc2626",
          strokeDasharray: "4,4",
          strokeWidth: 2
        }),

        // 33k label
        Plot.text([{ x: endYear, y: CONSTANTS.REFERENCE_33K }], {
          x: "x",
          y: "y",
          text: "33k (2023 supply)",
          textAnchor: "end",
          dx: -5,
          dy: -8,
          fill: "#dc2626",
          fontSize: 11,
          fontWeight: 500
        }),

        // Average line
        Plot.ruleY([avgDemand], {
          stroke: "#10b981",
          strokeDasharray: "2,4",
          strokeWidth: 2
        }),

        // Average label
        Plot.text([{ x: startYear, y: avgDemand }], {
          x: "x",
          y: "y",
          text: d => `Avg: ${Math.round(d.y).toLocaleString()}`,
          textAnchor: "start",
          dx: 5,
          dy: -8,
          fill: "#059669",
          fontSize: 11,
          fontWeight: 500
        }),

        // Selected scenario line
        Plot.line(selectedData, {
          x: "year",
          y: "demand",
          stroke: "#1e3a8a",
          strokeWidth: 3
        }),

        // Points for hover
        Plot.dot(selectedData, {
          x: "year",
          y: "demand",
          fill: "#1e3a8a",
          r: 5,
          title: d => `${d.year}: ${Math.round(d.demand).toLocaleString()} units\nHousehold growth: ${Math.round(d.householdGrowth).toLocaleString()}\nObsolescence: ${Math.round(d.obsolescence).toLocaleString()}`
        })
      ]
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(plot);

    return () => plot.remove();
  }, [selectedScenario, scenarioRange, startYear, endYear, width]);

  return <div ref={containerRef} className="projection-chart" />;
}
