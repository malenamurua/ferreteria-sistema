import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VenderPage from './pages/VenderPage'
import ProductosPage from './pages/ProductosPage'
import VentasHistorialPage from './pages/VentasHistorialPage'
import ReportesPage from './pages/ReportesPage'
import UsuariosPage from './pages/UsuariosPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <RutaProtegida>
                  <Layout />
                </RutaProtegida>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/vender" element={<VenderPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/ventas" element={<VentasHistorialPage />} />
              <Route
                path="/reportes"
                element={
                  <RutaProtegida soloAdmin>
                    <ReportesPage />
                  </RutaProtegida>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <RutaProtegida soloAdmin>
                    <UsuariosPage />
                  </RutaProtegida>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
