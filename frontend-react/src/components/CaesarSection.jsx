// sectiunea pentru cifrul caesar
// include criptare, decriptare si atac brute force

import { memo, useState, useCallback, useMemo } from 'react'
import { useLocalCaesar } from '../hooks/useCrypto'
import Button from './common/Button'
import ResultBox from './common/ResultBox'

// componenta pentru rezultatele brute force
const BruteForceResults = memo(function BruteForceResults({ results }) {
  if (!results || results.length === 0) return null

  return (
    <div className="result-group">
      <label>toate variantele posibile:</label>
      <div className="result-box brute-force-results">
        {results.map(({ shift, result }) => (
          <div key={shift} className="brute-force-item">
            <span className="shift">{shift}</span>
            <span>{result}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

function CaesarSection() {
  const [message, setMessage] = useState('')
  const [shift, setShift] = useState(3)
  const [result, setResult] = useState('')
  const [bruteForceResults, setBruteForceResults] = useState(null)

  // hook-ul nostru custom pentru operatii caesar
  const { cipher, bruteForce } = useLocalCaesar()

  // handler pentru criptare
  const handleEncrypt = useCallback(() => {
    if (!message) {
      setResult('introdu un mesaj!')
      return
    }
    const encrypted = cipher(message, shift, true)
    setResult(encrypted)
    setBruteForceResults(null)
  }, [message, shift, cipher])

  // handler pentru decriptare
  const handleDecrypt = useCallback(() => {
    if (!message) {
      setResult('introdu un mesaj!')
      return
    }
    const decrypted = cipher(message, shift, false)
    setResult(decrypted)
    setBruteForceResults(null)
  }, [message, shift, cipher])

  // handler pentru brute force
  const handleBruteForce = useCallback(() => {
    if (!message) {
      setResult('introdu un mesaj!')
      return
    }
    const results = bruteForce(message)
    setBruteForceResults(results)
    setResult('vezi toate variantele mai jos:')
  }, [message, bruteForce])

  // handler pentru schimbarea shift-ului din slider
  const handleShiftChange = useCallback((e) => {
    setShift(parseInt(e.target.value))
  }, [])

  // handler pentru schimbarea mesajului
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value)
  }, [])

  return (
    <section id="caesar" className="crypto-section">
      <div className="section-header">
        <h2>📜 cifrul caesar</h2>
        <span className="security-badge weak">securitate slaba</span>
      </div>

      <div className="section-description">
        <p>
          unul dintre cele mai vechi si simple cifruri de substitutie. fiecare litera
          este deplasata cu un numar fix de pozitii in alfabet. vulnerabil la atacuri
          de forta bruta (doar 25 de chei posibile) si analiza de frecventa.
        </p>
      </div>

      <div className="crypto-card">
        <div className="input-group">
          <label htmlFor="caesar-message">mesaj</label>
          <textarea
            id="caesar-message"
            placeholder="introdu mesajul..."
            value={message}
            onChange={handleMessageChange}
          />
        </div>

        <div className="input-group">
          <label htmlFor="caesar-shift">deplasare (0-25): {shift}</label>
          <input
            type="range"
            id="caesar-shift"
            min="0"
            max="25"
            value={shift}
            onChange={handleShiftChange}
          />
        </div>

        <div className="button-group">
          <Button variant="primary" onClick={handleEncrypt}>
            cripteaza
          </Button>
          <Button variant="secondary" onClick={handleDecrypt}>
            decripteaza
          </Button>
          <Button variant="accent" onClick={handleBruteForce}>
            forta bruta
          </Button>
        </div>

        <ResultBox label="rezultat" value={result} />
        <BruteForceResults results={bruteForceResults} />
      </div>
    </section>
  )
}

export default memo(CaesarSection)
