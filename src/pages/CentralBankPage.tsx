import React, { useState, useEffect, useMemo } from 'react'
import * as Plot from '@observablehq/plot'
import { DemandChart } from '@/components/DemandChart'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { dataLoaders } from '@/lib/dataLoader'
import {
  CONSTANTS,
  generateCohortTimeSeries,
  generateAllCohortScenarios,
  getScenarioRange,
  type PopulationProjections,
  type HeadshipProjections
} from '@/components/cohort-calculations'

interface RadioOption<T> {
  value: T
  label: string
}

function RadioGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel
}: {
  label: string
  options: RadioOption<T>[]
  value: T
  onChange: (value: T) => void
  formatLabel?: (opt: RadioOption<T>) => string
}) {
  return (
    <div className="radio-group">
      <div className="radio-group-label">{label}</div>
      {options.map(opt => (
        <label key={String(opt.value)} className="radio-option">
          <input
            type="radio"
            name={label}
            value={String(opt.value)}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {formatLabel ? formatLabel(opt) : opt.label}
        </label>
      ))}
    </div>
  )
}

function PopulationChart({ data, width }: { data: { year: number; population: number }[]; width: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const plot = Plot.plot({
      width: Math.max(200, width - 32),
      height: 200,
      marginLeft: 60,
      x: { label: 'Year' },
      y: { label: 'Population (millions)', transform: (d: number) => d / 1_000_000 },
      marks: [
        Plot.line(data, { x: 'year', y: 'population', stroke: 'steelblue', strokeWidth: 2 }),
        Plot.dot(data, { x: 'year', y: 'population', fill: 'steelblue', r: 3 })
      ]
    })

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(plot)

    return () => plot.remove()
  }, [data, width])

  return <div ref={containerRef} />
}

export function CentralBankPage() {
  const [containerRef, width] = useResizeObserver()

  // Data state
  const [populationByCohort, setPopulationByCohort] = useState<PopulationProjections | null>(null)
  const [headshipRates, setHeadshipRates] = useState<HeadshipProjections | null>(null)
  const [loading, setLoading] = useState(true)

  // Input state
  const [migration, setMigration] = useState<'M1' | 'M2' | 'M3'>('M2')
  const [headship, setHeadship] = useState<'current' | 'gradual' | 'fast'>('current')
  const [obsolescence, setObsolescence] = useState(0.0025)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [pop, head] = await Promise.all([
          dataLoaders.cbPopulation(),
          dataLoaders.cbHeadship()
        ])
        setPopulationByCohort(pop)
        setHeadshipRates(head)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const migrationOptions: RadioOption<'M1' | 'M2' | 'M3'>[] = [
    { value: 'M3', label: 'Low Migration' },
    { value: 'M2', label: 'Baseline Migration' },
    { value: 'M1', label: 'High Migration' }
  ]

  const headshipOptions: RadioOption<'current' | 'gradual' | 'fast'>[] = [
    { value: 'current', label: 'Irish Current' },
    { value: 'gradual', label: 'Gradual convergence (until 2050)' },
    { value: 'fast', label: 'Fast convergence (until 2035)' }
  ]

  const obsolescenceOptions: RadioOption<number>[] = [
    { value: 0, label: '0.00%' },
    { value: 0.0025, label: '0.25%' },
    { value: 0.005, label: '0.50%' }
  ]

  const { allScenarios, scenarioRange, timeSeries, populationByYear } = useMemo(() => {
    if (!populationByCohort || !headshipRates) {
      return {
        allScenarios: [],
        scenarioRange: [],
        timeSeries: [],
        populationByYear: []
      }
    }

    const all = generateAllCohortScenarios(
      populationByCohort,
      headshipRates,
      CONSTANTS.DEFAULT_OBSOLESCENCE,
      CONSTANTS.BASE_HOUSING_STOCK
    )

    const range = getScenarioRange(all)

    const selected = generateCohortTimeSeries(
      populationByCohort[migration].data,
      headshipRates[headship].data,
      obsolescence,
      CONSTANTS.BASE_HOUSING_STOCK
    )

    const popByYear = Object.entries(populationByCohort[migration].data)
      .map(([year, yearData]) => ({
        year: +year,
        population: yearData.total
      }))
      .sort((a, b) => a.year - b.year)

    return {
      allScenarios: all,
      scenarioRange: range,
      timeSeries: selected,
      populationByYear: popByYear
    }
  }, [populationByCohort, headshipRates, migration, headship, obsolescence])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!populationByCohort || !headshipRates) {
    return <div className="loading">Failed to load data</div>
  }

  return (
    <div ref={containerRef}>
      <h1>Housing Demand Projections</h1>
      <p>
        An interactive tool to explore Ireland's projected housing demand from 2022 to 2057,
        using age-cohort-based population projections and headship rates.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
        <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Scenario Selection</h3>

          <RadioGroup
            label="Migration Scenario"
            options={migrationOptions}
            value={migration}
            onChange={setMigration}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <RadioGroup
              label="Household Formation"
              options={headshipOptions}
              value={headship}
              onChange={setHeadship}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <RadioGroup
              label="Obsolescence Rate"
              options={obsolescenceOptions}
              value={obsolescence}
              onChange={setObsolescence}
              formatLabel={opt => opt.label}
            />
          </div>
        </div>

        <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <DemandChart
            selectedScenario={timeSeries}
            scenarioRange={scenarioRange}
            width={Math.max(400, width - 380)}
            yearDomain={[2023, 2050]}
            periodBreak={2035}
          />
        </div>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Understanding the Model</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="note">
          <h4 className="note-title">How This Works</h4>
          <p className="note-text">
            This projection uses <strong>age-specific headship rates</strong> applied to CSO population projections:
          </p>
          <ul className="note-list">
            <li><strong>Population data</strong>: CSO M1/M2/M3 scenarios by 5-year age cohorts</li>
            <li><strong>Headship rates</strong>: Proportion of each age group heading a household</li>
            <li><strong>Obsolescence</strong>: Annual replacement of deteriorating housing stock</li>
          </ul>
          <p className="note-text">Annual Housing Need = Household Growth + Obsolescence</p>
        </div>
        <div className="note">
          <h4 className="note-title">Key Assumptions</h4>
          <ul className="note-list">
            <li><strong>Irish Current</strong>: Headship rates stay at 2022 levels</li>
            <li><strong>Gradual Convergence</strong>: Linear shift to UK rates over 20 years (2022-2042)</li>
            <li><strong>UK Rates</strong>: Immediate adoption of UK household formation patterns</li>
          </ul>
          <p className="note-text">
            Higher headship rates mean more people forming independent households, increasing demand.
          </p>
        </div>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <div className="source-info">
        <p>Source: Population projections from CSO (M1/M2/M3 scenarios). Headship rates estimated based on Census data and UK comparisons.</p>
        <p>Reference lines: 52k (ESRI RS190 estimate), 33k (2023 actual completions)</p>
      </div>
    </div>
  )
}
