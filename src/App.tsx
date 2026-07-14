import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RequireBusiness } from '@/components/layout/RequireBusiness'
import { Shell } from '@/components/layout/Shell'
import { Login } from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Dashboard } from '@/pages/Dashboard'
import { Citas } from '@/pages/Citas'
import { Clientes } from '@/pages/Clientes'
import { Conversaciones } from '@/pages/Conversaciones'
import { Estadisticas } from '@/pages/Estadisticas'
import { Configuracion } from '@/pages/Configuracion'
import { NotFound } from '@/pages/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
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
                <Route path="clientes" element={<Clientes />} />
                <Route path="conversaciones" element={<Conversaciones />} />
                <Route path="estadisticas" element={<Estadisticas />} />
                <Route path="configuracion" element={<Configuracion />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
