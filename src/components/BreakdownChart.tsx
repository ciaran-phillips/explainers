import React, { useRef, useEffect } from 'react'
import * as Plot from '@observablehq/plot'

interface TimeSeriesPoint {
  year: number
  newHouseholds: number
  replacement: number
}

interface BreakdownChartProps {
  selectedScenario: TimeSeriesPoint[]
  width?: number
  scale?: number
}

export function BreakdownChart({ selectedScenario, width = 800, scale = 1000 }: BreakdownChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const data = selectedScenario.flatMap(d => [
    {
      year: d.year,
      component: 'New Households',
      value: d.newHouseholds * scale
    },
    {
      year: d.year,
      component: 'Replacement (Obsolescence)',
      value: d.replacement * scale
    }
  ])

  useEffect(() => {
    if (!containerRef.current) return

    const plot = Plot.plot({
      width,
      height: 300,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 20,
      marginBottom: 40,
      x: {
        label: 'Year',
        tickFormat: (d: number) => d.toString()
      },
      y: {
        label: 'Housing Demand (units)',
        grid: true,
        tickFormat: (d: number) => d.toLocaleString()
      },
      color: {
        domain: ['New Households', 'Replacement (Obsolescence)'],
        range: ['#3b82f6', '#94a3b8'],
        legend: true
      },
      marks: [
        Plot.areaY(data, Plot.stackY({
          x: 'year',
          y: 'value',
          fill: 'component',
          title: (d: { component: string; value: number }) => `${d.component}: ${Math.round(d.value).toLocaleString()}`
        })),
        Plot.ruleY([0])
      ]
    })

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(plot)

    return () => plot.remove()
  }, [selectedScenario, width, data])

  return <div ref={containerRef} className="breakdown-chart" />
}
