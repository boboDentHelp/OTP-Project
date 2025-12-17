// componenta hero - sectiunea de introducere
// e pur prezentationala deci o memoizam

import { memo } from 'react'

function Hero() {
  return (
    <header className="hero">
      <h1>Laboratorul de Criptografie</h1>
      <p>
        explorarea algoritmilor criptografici: one-time pad, caesar, vigenère, aes si functii hash
      </p>
    </header>
  )
}

export default memo(Hero)
