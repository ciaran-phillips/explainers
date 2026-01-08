import React, { useRef, useEffect } from 'react'
import * as Plot from '@observablehq/plot'

interface TimeSeriesPoint {
  year: number
  demand: number
}

interface RangePoint {
  year: number
  min: number
  max: number
}

interface DemandChartProps {
  selectedScenario: TimeSeriesPoint[]
  scenarioRange: RangePoint[]
  width?: number
  yearDomain?: [number, number]
  scale?: number
  periodBreak?: number
}

function calculatePeriodAverage(timeSeries: TimeSeriesPoint[], startYear: number, endYear: number): number {
  const filtered = timeSeries.filter(d => d.year >= startYear && d.year <= endYear)
  if (filtered.length === 0) return 0
  return filtered.reduce((sum, d) => sum + d.demand, 0) / filtered.length
}

export function DemandChart({
  selectedScenario,
  scenarioRange,
  width = 800,
  yearDomain,
  scale = 1,
  periodBreak
}: DemandChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const years = selectedScenario.map(d => d.year)
  const [startYear, endYear] = yearDomain || [Math.min(...years), Math.max(...years)]
  const midYear = periodBreak || Math.round((startYear + endYear) / 2)

  const selectedData = selectedScenario.map(d => ({
    year: d.year,
    demand: d.demand * scale
  }))

  const rangeData = scenarioRange.map(d => ({
    year: d.year,
    min: d.min * scale,
    max: d.max * scale
  }))

  const avgFirstPeriod = calculatePeriodAverage(selectedScenario, startYear, midYear) * scale
  const avgSecondPeriod = calculatePeriodAverage(selectedScenario, midYear + 1, endYear) * scale

  useEffect(() => {
    if (!containerRef.current) return

    const firstPeriodLabelX = Math.round((startYear + midYear) / 2)
    const secondPeriodLabelX = Math.round((midYear + endYear) / 2)

    const plot = Plot.plot({
      width,
      height: 400,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 20,
      marginBottom: 40,
      x: {
        label: 'Year',
        tickFormat: (d: number) => d.toString(),
        domain: [startYear, endYear]
      },
      y: {
        label: 'Annual Housing Demand (units)',
        grid: true,
        tickFormat: (d: number) => d.toLocaleString(),
        domain: [0, (rangeData.length > 0
          ? Math.max(...rangeData.map(d => d.max))
          : Math.max(...selectedData.map(d => d.demand))) * 1.1]
      },
      marks: [
        rangeData.length > 0 ? Plot.areaY(rangeData, {
          x: 'year',
          y1: 'min',
          y2: 'max',
          fill: '#e5e7eb',
          fillOpacity: 0.7
        }) : null,

        Plot.ruleX([midYear], {
          stroke: '#9ca3af',
          strokeDasharray: '4,4',
          strokeWidth: 1
        }),

        Plot.ruleY([avgFirstPeriod], {
          x1: startYear,
          x2: midYear,
          stroke: '#10b981',
          strokeDasharray: '2,4',
          strokeWidth: 2
        }),
        Plot.ruleY([avgSecondPeriod], {
          x1: midYear,
          x2: endYear,
          stroke: '#10b981',
          strokeDasharray: '2,4',
          strokeWidth: 2
        }),

        Plot.line(selectedData, {
          x: 'year',
          y: 'demand',
          stroke: '#2563eb',
          strokeWidth: 3
        }),

        Plot.dot(selectedData, {
          x: 'year',
          y: 'demand',
          fill: '#2563eb',
          r: 5,
          title: (d: { year: number; demand: number }) => `${d.year}: ${Math.round(d.demand).toLocaleString()} units`
        }),

        Plot.text([{ x: firstPeriodLabelX, y: avgFirstPeriod }], {
          x: 'x',
          y: 'y',
          text: (d: { y: number }) => `Avg: ${Math.round(d.y).toLocaleString()}`,
          dy: -10,
          fill: '#059669',
          fontSize: 11
        }),
        Plot.text([{ x: secondPeriodLabelX, y: avgSecondPeriod }], {
          x: 'x',
          y: 'y',
          text: (d: { y: number }) => `Avg: ${Math.round(d.y).toLocaleString()}`,
          dy: -10,
          fill: '#059669',
          fontSize: 11
        })
      ]
    })

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(plot)

    return () => plot.remove()
  }, [selectedScenario, scenarioRange, width, startYear, endYear, midYear, scale, avgFirstPeriod, avgSecondPeriod, selectedData, rangeData])

  return <div ref={containerRef} className="demand-chart" />
}
