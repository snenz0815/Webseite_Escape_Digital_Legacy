import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'klaro/dist/klaro.css'
import './klaro-custom.css'
import App from './App.jsx'
import klaroConfig from './klaro-config.js'
import * as Klaro from 'klaro'

// Make config globally available (needed for klaro.show() calls from footer)
window.klaro = Klaro;
window.klaroConfig = klaroConfig;

// Initialize Klaro
Klaro.setup(klaroConfig);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
