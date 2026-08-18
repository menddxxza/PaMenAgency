import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'

/**
 * Rutas de la aplicación.
 *
 * La portada se importa de forma directa porque es el destino más frecuente;
 * el resto se carga bajo demanda, de modo que quien sólo visita la home no
 * descarga las páginas legales ni el lector de documentos.
 */
const Nosotros = lazy(() => import('@/pages/Nosotros'))
const Servicios = lazy(() => import('@/pages/Servicios'))
const ServicioDetalle = lazy(() => import('@/pages/ServicioDetalle'))
const IaParaTodos = lazy(() => import('@/pages/IaParaTodos'))
const Conocimiento = lazy(() => import('@/pages/Conocimiento'))
const Documento = lazy(() => import('@/pages/Documento'))
const Grietas = lazy(() => import('@/pages/Grietas'))
const Metodologia = lazy(() => import('@/pages/Metodologia'))
const Diagnostico = lazy(() => import('@/pages/Diagnostico'))
const Faq = lazy(() => import('@/pages/Faq'))
const Contacto = lazy(() => import('@/pages/Contacto'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const LegalIndex = lazy(() => import('@/pages/legal/Index'))
const AvisoLegal = lazy(() => import('@/pages/legal/AvisoLegal'))
const Privacidad = lazy(() => import('@/pages/legal/Privacidad'))
const Cookies = lazy(() => import('@/pages/legal/Cookies'))
const Terminos = lazy(() => import('@/pages/legal/Terminos'))
const TratamientoDatos = lazy(() => import('@/pages/legal/TratamientoDatos'))
const PreferenciasCookies = lazy(() => import('@/pages/legal/PreferenciasCookies'))

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="servicios/:slug" element={<ServicioDetalle />} />
        <Route path="ia-para-todos" element={<IaParaTodos />} />
        <Route path="conocimiento" element={<Conocimiento />} />
        <Route path="conocimiento/:slug" element={<Documento />} />
        <Route path="grietas-de-la-ia" element={<Grietas />} />
        <Route path="metodologia" element={<Metodologia />} />
        <Route path="diagnostico" element={<Diagnostico />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contacto" element={<Contacto />} />

        <Route path="legal">
          <Route index element={<LegalIndex />} />
          <Route path="aviso-legal" element={<AvisoLegal />} />
          <Route path="privacidad" element={<Privacidad />} />
          <Route path="cookies" element={<Cookies />} />
          <Route path="terminos" element={<Terminos />} />
          <Route path="tratamiento-de-datos" element={<TratamientoDatos />} />
          <Route path="preferencias-cookies" element={<PreferenciasCookies />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
