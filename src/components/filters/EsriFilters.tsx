import { RadioGroup } from './RadioGroup'
import type { EsriFilterState, RadioOption } from './types'

interface EsriFiltersProps {
  filters: EsriFilterState
  options: {
    migration: RadioOption[]
    headship: RadioOption[]
    obsolescence: RadioOption[]
  }
  onMigrationChange: (value: string) => void
  onHeadshipChange: (value: string) => void
  onObsolescenceChange: (value: string) => void
}

export function EsriFilters({
  filters,
  options,
  onMigrationChange,
  onHeadshipChange,
  onObsolescenceChange
}: EsriFiltersProps) {
  return (
    <div className="card" style={{ background: 'var(--theme-background-alt)', padding: '1.5rem', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Scenario Selection</h3>
      <RadioGroup
        label="Migration"
        options={options.migration}
        value={filters.migration}
        onChange={onMigrationChange}
      />
      <div style={{ marginTop: '1.5rem' }}>
        <RadioGroup
          label="Household Formation"
          options={options.headship}
          value={filters.headship}
          onChange={onHeadshipChange}
        />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <RadioGroup
          label="Obsolescence Rate"
          options={options.obsolescence}
          value={filters.obsolescence}
          onChange={onObsolescenceChange}
        />
      </div>
    </div>
  )
}
