/**
 * main.tsx — Punto de entrada de la aplicación Ztress.
 *
 * Monta el árbol de componentes React dentro del elemento con id="root"
 * que se define en index.html. Se utiliza React.StrictMode para detectar
 * posibles problemas durante el desarrollo (renderizados dobles, efectos
 * secundarios impuros, etc.).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
