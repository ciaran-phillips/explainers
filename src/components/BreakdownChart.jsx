import * as React from "npm:react";
import * as Plot from "npm:@observablehq/plot";

// Convert raw demand (in thousands) to units
const toUnits = (val) => val * 1000;

export function BreakdownChart({ selectedScenario, width = 800 }) {
  const containerRef = React.useRef(null);

  // Prepare stacked data
  const data = selectedScenario.flatMap(d => [
    {
      year: d.year,
      component: "New Households",
      value: toUnits(d.newHouseholds)
    },
    {
      year: d.year,
      component: "Replacement (Obsolescence)",
      value: toUnits(d.replacement)
    }
  ]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const plot = Plot.plot({
      width,
      height: 300,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 20,
      marginBottom: 40,
      x: {
        label: "Year",
        tickFormat: d => d.toString()
      },
      y: {
        label: "Housing Demand (units)",
        grid: true,
        tickFormat: d => d.toLocaleString()
      },
      color: {
        domain: ["New Households", "Replacement (Obsolescence)"],
        range: ["#3b82f6", "#94a3b8"],
        legend: true
      },
      marks: [
        Plot.areaY(data, Plot.stackY({
          x: "year",
          y: "value",
          fill: "component",
          title: d => `${d.component}: ${Math.round(d.value).toLocaleString()}`
        })),
        Plot.ruleY([0])
      ]
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(plot);

    return () => plot.remove();
  }, [selectedScenario, width]);

  return <div ref={containerRef} className="breakdown-chart" />;
}
