import React, { useState } from 'react'
import { EsriPage } from './EsriPage'
import { CentralBankPage } from './CentralBankPage'

type ViewMode = 'esri' | 'central-bank'

export function CombinedPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('esri')

  return (
    <div>
      <h1>Housing Need Projections</h1>
      <p>
        Compare housing demand projections from different models.
      </p>

      <div className="controls-grid" style={{ marginBottom: '2rem' }}>
        <div className="radio-group">
          <div className="radio-group-label">View Mode</div>
          <label className="radio-option">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'esri'}
              onChange={() => setViewMode('esri')}
            />
            ESRI Model
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'central-bank'}
              onChange={() => setViewMode('central-bank')}
            />
            Central Bank Model
          </label>
        </div>
      </div>

      {viewMode === 'esri' ? (
        <EsriPage />
      ) : (
        <CentralBankPage />
      )}
    </div>
  )
}
