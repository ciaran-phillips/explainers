import React, { useState, useEffect, useMemo } from 'react'
import { DemandChart } from '@/components/DemandChart'
import { SummaryStats } from '@/components/SummaryStats'
import { ComparisonTable } from '@/components/ComparisonTable'
import { BreakdownChart } from '@/components/BreakdownChart'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { dataLoaders, type ScenariosFile } from '@/lib/dataLoader'
import {
  generateScenarioTimeSeries,
  generateAllScenarios,
  getScenarioRange,
  type PopulationProjectionsFlexible
} from '@/components/calculations'
import type { HeadshipProjections } from '@/data/headship-types'

interface RadioOption {
  value: string
  label: string
}

function RadioGroup({
  label,
  options,
  value,
  onChange
}: {
  label: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="radio-group">
      <div className="radio-group-label">{label}</div>
      {options.map(opt => (
        <label key={opt.value} className="radio-option">
          <input
            type="radio"
            name={label}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

export function EsriPage() {
  const [containerRef, width] = useResizeObserver()

  // Data state
  const [scenarios, setScenarios] = useState<ScenariosFile | null>(null)
  const [populationProjections, setPopulationProjections] = useState<PopulationProjectionsFlexible | null>(null)
  const [headshipRates, setHeadshipRates] = useState<HeadshipProjections | null>(null)
  const [loading, setLoading] = useState(true)

  // Input state
  const [migration, setMigration] = useState('baseline')
  const [headship, setHeadship] = useState('current')
  const [obsolescence, setObsolescence] = useState('low')

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [scen, pop, head] = await Promise.all([
          dataLoaders.esriScenarios(),
          dataLoaders.esriPopulation(),
          dataLoaders.esriHeadship()
        ])
        setScenarios(scen)
        setPopulationProjections(pop as PopulationProjectionsFlexible)
        setHeadshipRates(head)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Compute derived data
  const { allScenarios, scenarioRange, selectedTimeSeries, migrationOptions, headshipOptions, obsolescenceOptions } = useMemo(() => {
    if (!scenarios || !populationProjections || !headshipRates) {
      return {
        allScenarios: [],
        scenarioRange: [],
        selectedTimeSeries: [],
        migrationOptions: [],
        headshipOptions: [],
        obsolescenceOptions: []
      }
    }

    const migrationOpts = Object.entries(scenarios.populationScenarios).map(([key, value]) => ({
      value: key,
      label: value.label
    }))

    const headshipOpts = Object.entries(scenarios.headshipScenarios).map(([key, value]) => ({
      value: key,
      label: value.label
    }))

    const obsolescenceOpts = Object.entries(scenarios.obsolescenceScenarios).map(([key, value]) => ({
      value: key,
      label: value.label
    }))

    const all = generateAllScenarios(
      populationProjections,
      headshipRates,
      scenarios.obsolescenceScenarios,
      scenarios.housingStock[2022]
    )

    const range = getScenarioRange(all)

    const selected = generateScenarioTimeSeries(
      populationProjections[migration]?.data || Object.values(populationProjections)[0].data,
      headshipRates[headship]?.data || Object.values(headshipRates)[0].data,
      scenarios.obsolescenceScenarios[obsolescence]?.rate || 0.0025,
      scenarios.housingStock[2022]
    )

    return {
      allScenarios: all,
      scenarioRange: range,
      selectedTimeSeries: selected,
      migrationOptions: migrationOpts,
      headshipOptions: headshipOpts,
      obsolescenceOptions: obsolescenceOpts
    }
  }, [scenarios, populationProjections, headshipRates, migration, headship, obsolescence])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!scenarios || !populationProjections || !headshipRates) {
    return <div className="loading">Failed to load data</div>
  }

  return (
    <div ref={containerRef}>
      <h1>Housing Demand Calculator</h1>
      <p>
        An interactive tool to explore Ireland's projected housing demand based on the ESRI model
        from "Population Projections, The Flow of New Households and Structural Housing Demand" (RS190, July 2024).
      </p>

      <div className="grid grid-cols-4" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
        <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Scenario Selection</h3>
          <RadioGroup
            label="Migration"
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
            />
          </div>
        </div>

        <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <DemandChart
            selectedScenario={selectedTimeSeries}
            scenarioRange={scenarioRange}
            width={Math.max(400, width - 350)}
            scale={1000}
            yearDomain={[2023, 2040]}
            periodBreak={2030}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <SummaryStats
            selectedScenario={selectedTimeSeries}
            allScenarios={allScenarios}
          />
        </div>
        <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <ComparisonTable
            selectedScenario={selectedTimeSeries}
            allScenarios={allScenarios}
          />
        </div>
      </div>

      <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Demand Breakdown by Component</h3>
        <BreakdownChart
          selectedScenario={selectedTimeSeries}
          width={width - 48}
        />
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Understanding the Model</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="note">
          <h4 className="note-title">What This Shows</h4>
          <p className="note-text">
            This calculator shows <strong>structural housing demand</strong> - the number of new dwellings needed each year based on:
          </p>
          <ul className="note-list">
            <li><strong>Population growth</strong> - people need places to live</li>
            <li><strong>Household formation</strong> - changing household sizes</li>
            <li><strong>Replacing obsolete housing</strong> - wear and tear</li>
          </ul>
          <p className="note-text">
            <strong>Note:</strong> This does NOT include pent-up demand from existing housing shortages. The actual need may be higher.
          </p>
        </div>
        <div className="note">
          <h4 className="note-title">Understanding the Range</h4>
          <p className="note-text">
            The wide range across scenarios isn't measurement error - it reflects genuine uncertainty about:
          </p>
          <ul className="note-list">
            <li>How many people will move to Ireland</li>
            <li>How fast household sizes will fall</li>
            <li>How quickly housing stock will deteriorate</li>
          </ul>
          <p className="note-text">
            Different assumptions lead to very different futures.
          </p>
        </div>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <div className="source-info">
        <p>Source: ESRI Research Series RS190, "Population Projections, The Flow of New Households and Structural Housing Demand", July 2024.</p>
        <p>Formula: Annual Housing Demand = New Households Formation + Replacement Stock</p>
      </div>
    </div>
  )
}
