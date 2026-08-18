import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'

import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'

const root = document.getElementById('root')
if (!root) throw new Error('No se ha encontrado el nodo raíz #root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// La pantalla de carga vive en index.html para aparecer antes que el bundle;
// se retira en cuanto React ha montado el primer render.
requestAnimationFrame(() => {
  document.getElementById('pm-boot')?.setAttribute('data-done', 'true')
  window.setTimeout(() => document.getElementById('pm-boot')?.remove(), 600)
})
