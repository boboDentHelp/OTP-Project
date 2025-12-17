// sectiunea pentru one-time pad
// aici demonstram criptarea otp si pericolul reutilizarii cheii

import { memo, useState, useCallback, useActionState } from 'react'
import { otpEncrypt, otpDecrypt, analyzeXOR } from '../services/api'
import Button from './common/Button'
import ResultBox from './common/ResultBox'

// componenta pentru formularul de criptare/decriptare otp
// folosim useActionState din react 19 pentru form actions
function OTPForm() {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [generatedKey, setGeneratedKey] = useState('')

  // useActionState e nou in react 19
  // inlocuieste useFormState si gestioneaza starea formularului
  const [encryptState, encryptAction, isEncrypting] = useActionState(
    async (prevState, formData) => {
      const msg = formData.get('message')
      if (!msg) {
        return { error: 'introdu un mesaj!' }
      }

      const result = await otpEncrypt(msg)
      if (result.error) {
        return { error: result.error }
      }

      // salvam cheia generata
      setGeneratedKey(result.key)
      return { result: result.result, key: result.key }
    },
    null
  )

  const [decryptState, decryptAction, isDecrypting] = useActionState(
    async (prevState, formData) => {
      const msg = formData.get('message')
      const k = formData.get('key')

      if (!msg || !k) {
        return { error: 'introdu mesajul criptat si cheia!' }
      }

      const result = await otpDecrypt(msg, k)
      if (result.error) {
        return { error: result.error }
      }

      return { result: result.result }
    },
    null
  )

  // handler pentru schimbarea mesajului
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value)
  }, [])

  // handler pentru schimbarea cheii
  const handleKeyChange = useCallback((e) => {
    setKey(e.target.value)
  }, [])

  // determinam ce rezultat sa afisam
  const currentResult = encryptState?.result || decryptState?.result
  const currentError = encryptState?.error || decryptState?.error

  return (
    <div className="crypto-card">
      {/* folosim doua form-uri separate pentru actiunile diferite */}
      <div className="input-group">
        <label htmlFor="otp-message">mesaj</label>
        <textarea
          id="otp-message"
          name="message"
          placeholder="introdu mesajul de criptat sau decriptat..."
          value={message}
          onChange={handleMessageChange}
        />
      </div>

      <div className="input-group">
        <label htmlFor="otp-key">cheie (hex) - lasa gol pentru generare automata la criptare</label>
        <input
          type="text"
          id="otp-key"
          name="key"
          placeholder="cheia in format hexadecimal..."
          value={key}
          onChange={handleKeyChange}
        />
      </div>

      <div className="button-group">
        {/* form pentru criptare */}
        <form action={encryptAction} style={{ display: 'inline' }}>
          <input type="hidden" name="message" value={message} />
          <Button type="submit" variant="primary" isLoading={isEncrypting}>
            cripteaza
          </Button>
        </form>

        {/* form pentru decriptare */}
        <form action={decryptAction} style={{ display: 'inline' }}>
          <input type="hidden" name="message" value={message} />
          <input type="hidden" name="key" value={key} />
          <Button type="submit" variant="secondary" isLoading={isDecrypting}>
            decripteaza
          </Button>
        </form>
      </div>

      {/* afisam rezultatul sau eroarea */}
      <ResultBox
        label="rezultat"
        value={currentError || currentResult}
        type={currentError ? 'error' : 'normal'}
      />

      {/* afisam cheia generata daca exista */}
      {generatedKey && !currentError && (
        <ResultBox
          label="cheie generata (hex)"
          value={generatedKey}
          type="key"
          showCopy
        />
      )}
    </div>
  )
}

// componenta pentru demonstratia de key reuse
function XORAnalysisDemo() {
  const [cipher1, setCipher1] = useState('')
  const [cipher2, setCipher2] = useState('')

  const [state, action, isPending] = useActionState(
    async (prevState, formData) => {
      const c1 = formData.get('cipher1')
      const c2 = formData.get('cipher2')

      if (!c1 || !c2) {
        return { error: 'introdu ambele mesaje criptate!' }
      }

      const result = await analyzeXOR(c1, c2)
      if (result.error) {
        return { error: result.error }
      }

      return result
    },
    null
  )

  return (
    <div className="crypto-card demo-card">
      <h3>⚠️ demonstratie: pericolul reutilizarii cheii</h3>
      <p className="warning-text">
        asta demonstreaza de ce cheia otp nu trebuie folosita niciodata de doua ori.
      </p>

      <form action={action}>
        <div className="input-group">
          <label htmlFor="xor-cipher1">mesaj criptat 1 (hex)</label>
          <input
            type="text"
            id="xor-cipher1"
            name="cipher1"
            placeholder="prima criptograma..."
            value={cipher1}
            onChange={(e) => setCipher1(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="xor-cipher2">mesaj criptat 2 (hex)</label>
          <input
            type="text"
            id="xor-cipher2"
            name="cipher2"
            placeholder="a doua criptograma..."
            value={cipher2}
            onChange={(e) => setCipher2(e.target.value)}
          />
        </div>

        <Button type="submit" variant="warning" isLoading={isPending}>
          analizeaza xor
        </Button>
      </form>

      {state && (
        <div className="result-box" style={{ marginTop: '1rem' }}>
          {state.error ? (
            <span style={{ color: 'var(--danger-color)' }}>{state.error}</span>
          ) : (
            <>
              <strong>xor result (m1 ⊕ m2):</strong> {state.xorResult}
              <br /><br />
              <strong>explicatie:</strong> {state.explanation}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// componenta principala pentru sectiunea otp
function OTPSection() {
  return (
    <section id="otp" className="crypto-section">
      <div className="section-header">
        <h2>🔑 one-time pad (otp)</h2>
        <span className="security-badge perfect">securitate perfecta</span>
      </div>

      <div className="section-description">
        <p>
          one-time pad este singurul sistem criptografic demonstrat matematic ca avand{' '}
          <strong>securitate perfecta</strong> (shannon, 1949). conditii: cheia trebuie
          sa fie complet aleatorie, de aceeasi lungime cu mesajul, si folosita o singura data.
        </p>
      </div>

      <OTPForm />
      <XORAnalysisDemo />
    </section>
  )
}

export default memo(OTPSection)
