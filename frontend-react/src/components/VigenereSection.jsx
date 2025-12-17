// sectiunea pentru cifrul vigenere
// include criptare/decriptare si tabela vigenere

import { memo, useState, useCallback, useMemo } from 'react'
import { useLocalVigenere } from '../hooks/useCrypto'
import Button from './common/Button'
import ResultBox from './common/ResultBox'

// componenta pentru tabela vigenere - memoizata ca e costisitoare
const VigenereTable = memo(function VigenereTable() {
  // generam tabela o singura data cu useMemo
  const tableData = useMemo(() => {
    const rows = []
    // header cu literele
    const header = ['']
    for (let i = 0; i < 26; i++) {
      header.push(String.fromCharCode(65 + i))
    }
    rows.push(header)

    // randurile cu datele
    for (let i = 0; i < 26; i++) {
      const row = [String.fromCharCode(65 + i)]
      for (let j = 0; j < 26; j++) {
        row.push(String.fromCharCode(65 + (i + j) % 26))
      }
      rows.push(row)
    }

    return rows
  }, [])

  return (
    <div className="crypto-card">
      <h3>tabela vigenère</h3>
      <div className="vigenere-table-container">
        <table className="vigenere-table">
          <thead>
            <tr>
              {tableData[0].map((cell, i) => (
                <th key={i}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, i) => (
              <tr key={i}>
                <th>{row[0]}</th>
                {row.slice(1).map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

function VigenereSection() {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [result, setResult] = useState('')

  // hook-ul nostru pentru operatii vigenere
  const { cipher } = useLocalVigenere()

  // handler pentru criptare
  const handleEncrypt = useCallback(() => {
    if (!message || !key) {
      setResult('introdu mesajul si cheia!')
      return
    }
    const encrypted = cipher(message, key, true)
    setResult(encrypted)
  }, [message, key, cipher])

  // handler pentru decriptare
  const handleDecrypt = useCallback(() => {
    if (!message || !key) {
      setResult('introdu mesajul si cheia!')
      return
    }
    const decrypted = cipher(message, key, false)
    setResult(decrypted)
  }, [message, key, cipher])

  return (
    <section id="vigenere" className="crypto-section">
      <div className="section-header">
        <h2>🔤 cifrul vigenère</h2>
        <span className="security-badge moderate">securitate moderata</span>
      </div>

      <div className="section-description">
        <p>
          o extensie a cifrului caesar care foloseste un cuvant cheie. fiecare litera
          din cheie determina deplasarea pentru litera corespunzatoare din mesaj.
          rezistent la analiza simpla de frecventa, dar vulnerabil la atacuri de tip
          kasiski si friedman.
        </p>
      </div>

      <div className="crypto-card">
        <div className="input-group">
          <label htmlFor="vigenere-message">mesaj</label>
          <textarea
            id="vigenere-message"
            placeholder="introdu mesajul..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="vigenere-key">cheie (cuvant)</label>
          <input
            type="text"
            id="vigenere-key"
            placeholder="introdu cheia..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>

        <div className="button-group">
          <Button variant="primary" onClick={handleEncrypt}>
            cripteaza
          </Button>
          <Button variant="secondary" onClick={handleDecrypt}>
            decripteaza
          </Button>
        </div>

        <ResultBox label="rezultat" value={result} />
      </div>

      <VigenereTable />
    </section>
  )
}

export default memo(VigenereSection)
