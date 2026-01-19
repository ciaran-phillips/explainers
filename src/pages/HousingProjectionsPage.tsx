import { useState, useMemo } from 'react'
import { DemandChart } from '@/components/DemandChart'
import { Intro } from '@/components/Intro'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useEsriData } from '@/hooks/useEsriData'
import { useCentralBankData } from '@/hooks/useCentralBankData'
import { computeEsriTimeSeries } from '@/lib/esriTimeSeries'
import { computeCentralBankTimeSeries } from '@/lib/centralBankTimeSeries'
import {
  EsriFilters,
  CentralBankFilters,
  RadioGroup,
  type EsriFilterState,
  type CentralBankFilterState
} from '@/components/filters'

type ViewMode = 'esri' | 'central-bank'

export function HousingProjectionsPage() {
  const [containerRef, width] = useResizeObserver()
  const [viewMode, setViewMode] = useState<ViewMode>('esri')

  // Filter states (persist when switching models)
  const [esriFilters, setEsriFilters] = useState<EsriFilterState>({
    migration: 'baseline',
    headship: 'current',
    obsolescence: 'low'
  })

  const [cbFilters, setCbFilters] = useState<CentralBankFilterState>({
    migration: 'M2',
    headship: 'current',
    obsolescence: 0.0025
  })

  // Load data from both models
  const esriData = useEsriData()
  const cbData = useCentralBankData()

  // Compute ESRI time series
  const esriResult = useMemo(() => {
    if (!esriData.scenarios || !esriData.populationProjections || !esriData.headshipRates) {
      return null
    }
    return computeEsriTimeSeries(
      esriData.scenarios,
      esriData.populationProjections,
      esriData.headshipRates,
      esriFilters
    )
  }, [esriData.scenarios, esriData.populationProjections, esriData.headshipRates, esriFilters])

  // Compute Central Bank time series
  const cbResult = useMemo(() => {
    if (!cbData.populationByCohort || !cbData.headshipRates) {
      return null
    }
    return computeCentralBankTimeSeries(
      cbData.populationByCohort,
      cbData.headshipRates,
      cbFilters
    )
  }, [cbData.populationByCohort, cbData.headshipRates, cbFilters])

  // Determine which data to show based on view mode
  const activeData = viewMode === 'esri' ? esriResult : cbResult
  const isLoading = viewMode === 'esri' ? esriData.loading : cbData.loading
  const hasError = viewMode === 'esri' ? esriData.error : cbData.error

  // Handle filter changes
  const handleEsriMigrationChange = (value: string) => {
    setEsriFilters(prev => ({ ...prev, migration: value }))
  }
  const handleEsriHeadshipChange = (value: string) => {
    setEsriFilters(prev => ({ ...prev, headship: value }))
  }
  const handleEsriObsolescenceChange = (value: string) => {
    setEsriFilters(prev => ({ ...prev, obsolescence: value }))
  }

  const handleCbMigrationChange = (value: 'M1' | 'M2' | 'M3') => {
    setCbFilters(prev => ({ ...prev, migration: value }))
  }
  const handleCbHeadshipChange = (value: 'current' | 'gradual' | 'fast') => {
    setCbFilters(prev => ({ ...prev, headship: value }))
  }
  const handleCbObsolescenceChange = (value: number) => {
    setCbFilters(prev => ({ ...prev, obsolescence: value }))
  }

  return (
    <div ref={containerRef}>
      <div className="mb-6">
        <h1>Understanding Ireland's Housing Numbers</h1>
        <h3>
          <em>Explore the data behind the headlines — and build your own projections.</em>
        </h3>
        <sub>(scroll to the bottom for the full interactive chart)</sub>
      </div>
      <Intro />

      <hr className="section-divider" />

      <div className="controls-grid" style={{ marginBottom: '2rem' }}>
        <RadioGroup
          label="View Mode"
          options={[
            { value: 'esri', label: 'ESRI Model' },
            { value: 'central-bank', label: 'Central Bank Model' }
          ]}
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
        />
      </div>

      {isLoading && <div className="loading">Loading...</div>}
      {hasError && <div className="loading">Failed to load data</div>}

      {!isLoading && !hasError && activeData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
            {viewMode === 'esri' && esriResult && (
              <EsriFilters
                filters={esriFilters}
                options={esriResult.filterOptions}
                onMigrationChange={handleEsriMigrationChange}
                onHeadshipChange={handleEsriHeadshipChange}
                onObsolescenceChange={handleEsriObsolescenceChange}
              />
            )}

            {viewMode === 'central-bank' && (
              <CentralBankFilters
                filters={cbFilters}
                onMigrationChange={handleCbMigrationChange}
                onHeadshipChange={handleCbHeadshipChange}
                onObsolescenceChange={handleCbObsolescenceChange}
              />
            )}

            <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
              <DemandChart
                selectedScenario={activeData.selectedTimeSeries}
                scenarioRange={activeData.scenarioRange}
                width={Math.max(400, width - 380)}
                scale={activeData.chartConfig.scale}
                yearDomain={activeData.chartConfig.yearDomain}
                yDomain={activeData.chartConfig.yDomain}
                periodBreak={activeData.chartConfig.periodBreak}
              />
            </div>
          </div>

          <hr style={{ margin: '2rem 0' }} />

          <h2>Understanding the Model</h2>

          {viewMode === 'esri' && (
            <>
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
            </>
          )}

          {viewMode === 'central-bank' && (
            <>
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
            </>
          )}
        </>
      )}
    </div>
  )
}
