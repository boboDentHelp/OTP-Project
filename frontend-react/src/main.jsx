// punctul de intrare in aplicatie
// aici initializam react si montam componenta principala
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// luam elementul root din html
const container = document.getElementById('root')

// cream root-ul react 19 (metoda noua, nu mai folosim ReactDOM.render)
const root = createRoot(container)

// randam aplicatia in strict mode ca sa vedem warninguri
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
