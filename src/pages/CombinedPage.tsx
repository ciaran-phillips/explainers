import React, { useState } from 'react'
import { EsriPage } from './EsriPage'
import { CentralBankPage } from './CentralBankPage'
import { Intro } from '@/components/Intro'

type ViewMode = 'esri' | 'central-bank'

export function CombinedPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('esri')

  return (
    <div>
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
