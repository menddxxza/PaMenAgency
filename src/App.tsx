import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RequireBusiness } from '@/components/layout/RequireBusiness'
import { RequireSubscription } from '@/components/layout/RequireSubscription'
import { RequirePlanFeature } from '@/components/layout/RequirePlanFeature'
import { Shell } from '@/components/layout/Shell'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Dashboard } from '@/pages/Dashboard'
import { Citas } from '@/pages/Citas'
import { Clientes } from '@/pages/Clientes'
import { Conversaciones } from '@/pages/Conversaciones'
import { Estadisticas } from '@/pages/Estadisticas'
import { Configuracion } from '@/pages/Configuracion'
import { Suscripcion } from '@/pages/Suscripcion'
import { NotFound } from '@/pages/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/suscripcion"
                element={
                  <ProtectedRoute>
                    <RequireBusiness>
                      <Suscripcion />
                    </RequireBusiness>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <RequireBusiness>
                      <RequireSubscription>
                        <Shell />
                      </RequireSubscription>
                    </RequireBusiness>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="citas" element={<Citas />} />
                <Route
                  path="clientes"
                  element={
                    <RequirePlanFeature feature="hasClientes">
                      <Clientes />
                    </RequirePlanFeature>
                  }
                />
                <Route path="conversaciones" element={<Conversaciones />} />
                <Route
                  path="estadisticas"
                  element={
                    <RequirePlanFeature feature="hasEstadisticas">
                      <Estadisticas />
                    </RequirePlanFeature>
                  }
                />
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
