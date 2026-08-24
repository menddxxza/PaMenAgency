import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { ToastProvider } from '@/context/ToastContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { BusinessDataProvider } from '@/context/BusinessDataContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RequireBusiness } from '@/components/layout/RequireBusiness'
import { RequireSubscription } from '@/components/layout/RequireSubscription'
import { RequirePlanFeature } from '@/components/layout/RequirePlanFeature'
import { Shell } from '@/components/layout/Shell'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { NotFound } from '@/pages/NotFound'
import { Privacidad } from '@/pages/legal/Privacidad'
import { Cookies } from '@/pages/legal/Cookies'
import { Terminos } from '@/pages/legal/Terminos'

// Las pantallas del panel son la mayor parte del bundle y solo las necesita
// quien ya ha iniciado sesión. Cargarlas aparte deja la landing —que es lo
// que ve un visitante que aún no es cliente— mucho más ligera.
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Citas = lazy(() => import('@/pages/Citas').then((m) => ({ default: m.Citas })))
const Clientes = lazy(() => import('@/pages/Clientes').then((m) => ({ default: m.Clientes })))
const Conversaciones = lazy(() => import('@/pages/Conversaciones').then((m) => ({ default: m.Conversaciones })))
const Facturacion = lazy(() => import('@/pages/Facturacion').then((m) => ({ default: m.Facturacion })))
const Inventario = lazy(() => import('@/pages/Inventario').then((m) => ({ default: m.Inventario })))
const Estadisticas = lazy(() => import('@/pages/Estadisticas').then((m) => ({ default: m.Estadisticas })))
const Configuracion = lazy(() => import('@/pages/Configuracion').then((m) => ({ default: m.Configuracion })))
const Suscripcion = lazy(() => import('@/pages/Suscripcion').then((m) => ({ default: m.Suscripcion })))

function RouteFallback() {
  return <div className="route-fallback" role="status" aria-live="polite" aria-label="Cargando" />
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <SubscriptionProvider>
            <ToastProvider>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/privacidad" element={<Privacidad />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/terminos" element={<Terminos />} />

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
                            <BusinessDataProvider>
                              <Shell />
                            </BusinessDataProvider>
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
                      path="facturacion"
                      element={
                        <RequirePlanFeature feature="hasFacturacion">
                          <Facturacion />
                        </RequirePlanFeature>
                      }
                    />
                    <Route
                      path="inventario"
                      element={
                        <RequirePlanFeature feature="hasInventario">
                          <Inventario />
                        </RequirePlanFeature>
                      }
                    />
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
              </Suspense>
            </ToastProvider>
          </SubscriptionProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
