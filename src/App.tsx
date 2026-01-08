import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { EsriPage } from './pages/EsriPage'
import { CentralBankPage } from './pages/CentralBankPage'
import { CombinedPage } from './pages/CombinedPage'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <h2 className="sidebar-title">Housing Need Ireland</h2>
        <NavLink to="/combined" className={({ isActive }) => isActive ? 'active' : ''}>
          Combined
        </NavLink>
        <NavLink to="/esri" className={({ isActive }) => isActive ? 'active' : ''}>
          ESRI projections
        </NavLink>
        <NavLink to="/central-bank" className={({ isActive }) => isActive ? 'active' : ''}>
          Central bank projections
        </NavLink>
      </nav>
      <main className="content">{children}</main>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CombinedPage />} />
          <Route path="/combined" element={<CombinedPage />} />
          <Route path="/esri" element={<EsriPage />} />
          <Route path="/central-bank" element={<CentralBankPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
