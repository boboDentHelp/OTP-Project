// componenta principala pentru simularea otp
// cerinte:
// - input mesaj de la utilizator
// - backend go genereaza cheie cu crypto/rand
// - criptare xor pe backend
// - afisare: mesaj original (ascii+hex), cheie (hex), criptat (hex), decriptat
// - verificare daca decriptarea e identica cu originalul
// - optional: salvare in fisiere

import { useState, useCallback } from 'react'

// url-ul backend-ului go
const API_URL = 'http://localhost:8080/api/otp'

// componenta pentru afisarea unei sectiuni de date
function DataSection({ title, icon, children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-900 border-slate-700',
    success: 'bg-emerald-950/50 border-emerald-700',
    warning: 'bg-amber-950/50 border-amber-700',
    info: 'bg-cyan-950/50 border-cyan-700'
  }

  return (
    <div className={`rounded-xl border p-4 ${variants[variant]}`}>
      <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

// componenta pentru afisarea valorilor hex/ascii
function DataDisplay({ label, value, variant = 'hex' }) {
  const styles = {
    hex: 'text-cyan-400',
    ascii: 'text-amber-400',
    text: 'text-emerald-400'
  }

  return (
    <div className="mb-2 last:mb-0">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}:</span>
      <div className={`font-mono text-sm mt-1 p-2 bg-slate-950 rounded-lg break-all ${styles[variant]}`}>
        {value || '-'}
      </div>
    </div>
  )
}

function OTPSimulator() {
  // state pentru input
  const [message, setMessage] = useState('')

  // state pentru rezultate de la backend
  const [results, setResults] = useState(null)

  // state pentru loading si erori
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // apeleaza backend-ul go pentru criptare
  const processOTP = useCallback(async () => {
    if (!message) {
      setResults(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setResults(null)
        return
      }

      // formatam rezultatele primite de la backend
      setResults({
        original: {
          text: data.originalText,
          ascii: data.originalAscii,
          hex: data.originalHex,
          length: data.originalText.length
        },
        key: {
          hex: data.keyHex,
          length: data.keyHex.split(' ').length
        },
        encrypted: {
          hex: data.encryptedHex,
          length: data.encryptedHex.split(' ').length
        },
        decrypted: {
          text: data.decryptedText,
          ascii: data.decryptedAscii,
          hex: data.decryptedHex
        },
        isValid: data.isMatch
      })
    } catch (err) {
      setError('nu s-a putut conecta la server. porneste backend-ul cu: cd backend && go run main.go')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [message])

  // functie pentru salvare fisier individual
  const downloadFile = useCallback((content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  // salvare cheie
  const saveKey = useCallback(() => {
    if (!results) return
    const content = `OTP KEY (hex) - generat cu crypto/rand\n${results.key.hex}\n\nLungime: ${results.key.length} bytes`
    downloadFile(content, 'otp_cheie.txt')
  }, [results, downloadFile])

  // salvare mesaj criptat
  const saveEncrypted = useCallback(() => {
    if (!results) return
    const content = `MESAJ CRIPTAT (hex)\n${results.encrypted.hex}\n\nMesaj original: "${results.original.text}"\nLungime: ${results.encrypted.length} bytes`
    downloadFile(content, 'mesaj_criptat.txt')
  }, [results, downloadFile])

  return (
    <div className="space-y-6">
      {/* input mesaj */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          introdu mesajul de criptat
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="scrie mesajul aici..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3
                     text-white placeholder-slate-600 focus:outline-none focus:ring-2
                     focus:ring-emerald-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={processOTP}
            disabled={!message || loading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600
                       hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700
                       disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-3
                       rounded-lg font-medium transition-all duration-200
                       shadow-lg shadow-emerald-900/30"
          >
            {loading ? '⏳ se proceseaza...' : '🔐 cripteaza cu backend go'}
          </button>
          {results && (
            <>
              <button
                onClick={saveKey}
                className="px-4 py-3 bg-amber-900/50 hover:bg-amber-800/50 rounded-lg
                           font-medium transition-colors border border-amber-700 text-amber-300"
              >
                🔑 salveaza cheie
              </button>
              <button
                onClick={saveEncrypted}
                className="px-4 py-3 bg-cyan-900/50 hover:bg-cyan-800/50 rounded-lg
                           font-medium transition-colors border border-cyan-700 text-cyan-300"
              >
                🔒 salveaza criptat
              </button>
            </>
          )}
        </div>
      </div>

      {/* eroare */}
      {error && (
        <div className="bg-red-950/50 border border-red-700 rounded-xl p-4 text-red-400">
          <p className="font-medium">eroare:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* rezultate */}
      {results && (
        <div className="space-y-4">
          {/* mesaj original */}
          <DataSection title="mesaj original" icon="📝" variant="info">
            <DataDisplay label="text" value={results.original.text} variant="text" />
            <DataDisplay label="ascii (coduri)" value={results.original.ascii} variant="ascii" />
            <DataDisplay label="hex" value={results.original.hex} variant="hex" />
            <div className="mt-2 text-xs text-slate-500">
              lungime: {results.original.length} bytes
            </div>
          </DataSection>

          {/* cheie generata */}
          <DataSection title="cheie otp generata (go crypto/rand)" icon="🔑" variant="warning">
            <DataDisplay label="hex" value={results.key.hex} variant="hex" />
            <div className="mt-2 text-xs text-slate-500">
              lungime: {results.key.length} bytes (egala cu mesajul) - generata de backend cu crypto/rand
            </div>
          </DataSection>

          {/* mesaj criptat */}
          <DataSection title="mesaj criptat (mesaj XOR cheie)" icon="🔒">
            <DataDisplay label="hex" value={results.encrypted.hex} variant="hex" />
            <div className="mt-2 text-xs text-slate-500">
              lungime: {results.encrypted.length} bytes
            </div>
          </DataSection>

          {/* mesaj decriptat */}
          <DataSection title="mesaj decriptat (criptat XOR cheie)" icon="🔓" variant="success">
            <DataDisplay label="text" value={results.decrypted.text} variant="text" />
            <DataDisplay label="ascii (coduri)" value={results.decrypted.ascii} variant="ascii" />
            <DataDisplay label="hex" value={results.decrypted.hex} variant="hex" />
          </DataSection>

          {/* verificare */}
          <div className={`rounded-xl border p-4 ${
            results.isValid
              ? 'bg-emerald-950/50 border-emerald-500'
              : 'bg-red-950/50 border-red-500'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{results.isValid ? '✅' : '❌'}</span>
              <div>
                <h3 className={`font-medium ${results.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  verificare: {results.isValid ? 'decriptare corecta!' : 'eroare!'}
                </h3>
                <p className="text-sm text-slate-400">
                  {results.isValid
                    ? 'mesajul decriptat este identic cu mesajul original'
                    : 'mesajul decriptat nu corespunde cu originalul'}
                </p>
              </div>
            </div>
          </div>

          {/* formula xor */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-2">📐 formula aplicata</h3>
            <div className="font-mono text-sm space-y-1">
              <p><span className="text-cyan-400">criptare:</span> C = M ⊕ K</p>
              <p><span className="text-emerald-400">decriptare:</span> M = C ⊕ K</p>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              proprietatea xor: (A ⊕ B) ⊕ B = A
            </p>
          </div>

          {/* nota despre backend */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-2">🖥️ backend go</h3>
            <p className="text-xs text-slate-500">
              cheia e generata pe server cu <code className="text-cyan-400">crypto/rand</code> (csprng).
              operatiile xor se fac tot pe backend.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OTPSimulator
