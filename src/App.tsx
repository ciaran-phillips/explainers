import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HousingProjectionsPage } from './pages/HousingProjectionsPage'

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
          <Route path="/" element={<HousingProjectionsPage />} />
          <Route path="/combined" element={<HousingProjectionsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
