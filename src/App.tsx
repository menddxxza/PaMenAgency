import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RequireBusiness } from '@/components/layout/RequireBusiness'
import { Shell } from '@/components/layout/Shell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Citas } from '@/pages/Citas'
import { Conversaciones } from '@/pages/Conversaciones'
import { Estadisticas } from '@/pages/Estadisticas'
import { Configuracion } from '@/pages/Configuracion'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RequireBusiness>
                    <Shell />
                  </RequireBusiness>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="citas" element={<Citas />} />
              <Route path="conversaciones" element={<Conversaciones />} />
              <Route path="estadisticas" element={<Estadisticas />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>
          </Routes>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
