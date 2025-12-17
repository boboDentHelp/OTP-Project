// sectiunea pentru criptare aes-256
// foloseste server-ul pentru operatii (ca aes e mai complex)

import { memo, useState, useActionState } from 'react'
import { aesEncrypt, aesDecrypt } from '../services/api'
import Button from './common/Button'
import ResultBox from './common/ResultBox'

function AESSection() {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [details, setDetails] = useState(null)

  // action pentru criptare
  const [encryptState, encryptAction, isEncrypting] = useActionState(
    async (prevState, formData) => {
      const msg = formData.get('message')
      const k = formData.get('key')

      if (!msg) {
        return { error: 'introdu un mesaj!' }
      }

      const result = await aesEncrypt(msg, k)
      if (result.error) {
        setDetails(null)
        return { error: result.error }
      }

      // salvam detaliile pentru afisare
      setDetails({
        algorithm: `aes-${result.keyLength} cbc`,
        iv: result.iv,
        key: result.key,
        ciphertext: result.result
      })

      // returnam rezultatul in format iv:ciphertext
      return { result: `${result.iv}:${result.result}` }
    },
    null
  )

  // action pentru decriptare
  const [decryptState, decryptAction, isDecrypting] = useActionState(
    async (prevState, formData) => {
      const msg = formData.get('message')
      const k = formData.get('key')

      if (!msg || !k) {
        return { error: 'introdu mesajul criptat (format iv:ciphertext) si cheia!' }
      }

      const result = await aesDecrypt(msg, k)
      if (result.error) {
        return { error: result.error }
      }

      setDetails(null)
      return { result: result.result }
    },
    null
  )

  // determinam rezultatul curent
  const currentResult = encryptState?.result || decryptState?.result
  const currentError = encryptState?.error || decryptState?.error

  return (
    <section id="aes" className="crypto-section">
      <div className="section-header">
        <h2>🛡️ aes-256</h2>
        <span className="security-badge strong">securitate puternica</span>
      </div>

      <div className="section-description">
        <p>
          advanced encryption standard (aes) este standardul actual pentru criptarea
          simetrica. folosit de guverne si organizatii din intreaga lume. implementarea
          noastra foloseste aes-256 in modul cbc cu padding pkcs7.
        </p>
      </div>

      <div className="crypto-card">
        <div className="input-group">
          <label htmlFor="aes-message">mesaj / text criptat</label>
          <textarea
            id="aes-message"
            placeholder="introdu mesajul pentru criptare sau format iv:ciphertext pentru decriptare..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="aes-key">parola / cheie (lasa gol pentru generare automata)</label>
          <input
            type="text"
            id="aes-key"
            placeholder="parola sau cheia in base64..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>

        <div className="button-group">
          <form action={encryptAction} style={{ display: 'inline' }}>
            <input type="hidden" name="message" value={message} />
            <input type="hidden" name="key" value={key} />
            <Button type="submit" variant="primary" isLoading={isEncrypting}>
              cripteaza
            </Button>
          </form>

          <form action={decryptAction} style={{ display: 'inline' }}>
            <input type="hidden" name="message" value={message} />
            <input type="hidden" name="key" value={key} />
            <Button type="submit" variant="secondary" isLoading={isDecrypting}>
              decripteaza
            </Button>
          </form>
        </div>

        <ResultBox
          label="rezultat"
          value={currentError || currentResult}
          type={currentError ? 'error' : 'normal'}
        />

        {details && !currentError && (
          <div className="result-group">
            <label>detalii criptare</label>
            <div className="result-box" style={{ color: 'var(--text-secondary)' }}>
              <strong>algoritm:</strong> {details.algorithm}<br />
              <strong>iv (base64):</strong> {details.iv}<br />
              <strong>cheie (base64):</strong> {details.key}<br />
              <strong>ciphertext (base64):</strong> {details.ciphertext}<br /><br />
              <em>format pentru decriptare: iv:ciphertext</em>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default memo(AESSection)
