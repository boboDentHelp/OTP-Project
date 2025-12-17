// componenta footer - simpla, afiseaza informatii despre proiect

import { memo } from 'react'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>proiect criptografie - securitatea informatiilor</p>
        <p>implementare algoritmi: one-time pad, caesar, vigenère, aes-256, sha-256</p>
      </div>
    </footer>
  )
}

export default memo(Footer)
