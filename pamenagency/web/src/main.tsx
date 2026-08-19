import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'

// La pantalla de carga vive en index.html para aparecer antes que el bundle.
// Se retira siempre, incluso si algo falla al arrancar: sin esto, un error no
// capturado deja la pantalla de carga congelada para siempre, en vez de
// mostrar el aviso de ErrorBoundary o el sitio.
function dismissBootScreen() {
  document.getElementById('pm-boot')?.setAttribute('data-done', 'true')
  window.setTimeout(() => document.getElementById('pm-boot')?.remove(), 600)
}
window.addEventListener('error', dismissBootScreen, { once: true })
window.addEventListener('unhandledrejection', dismissBootScreen, { once: true })

try {
  const root = document.getElementById('root')
  if (!root) throw new Error('No se ha encontrado el nodo raíz #root')

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  )
} finally {
  requestAnimationFrame(dismissBootScreen)
}
