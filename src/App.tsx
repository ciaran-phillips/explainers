import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { EsriPage } from './pages/EsriPage'
import { CentralBankPage } from './pages/CentralBankPage'
import { CombinedPage } from './pages/CombinedPage'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
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
