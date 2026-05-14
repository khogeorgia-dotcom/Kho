import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './style.css'

const rootElement = document.getElementById('app')
const splashElement = document.getElementById('boot-splash')
const path = window.location.pathname || '/'

if (splashElement) {
  if (path === '/') splashElement.classList.add('is-home')
  if (path.startsWith('/property/')) splashElement.classList.add('is-property')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

let didRevealApp = false
const revealApp = () => {
  if (didRevealApp) return
  didRevealApp = true
  document.body.classList.add('app-ready')
  if (splashElement) {
    splashElement.classList.add('is-hidden')
    setTimeout(() => splashElement.remove(), 260)
  }
}

window.addEventListener('kho:app-ready', revealApp, { once: true })

// Safety fallback: keep short to avoid visible "preload flash" on navigation.
setTimeout(revealApp, 900)
