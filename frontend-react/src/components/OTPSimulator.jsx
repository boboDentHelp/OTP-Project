// componenta principala pentru simularea otp
// cerinte:
// - input mesaj de la utilizator
// - generare cheie aleatoare (crypto.getRandomValues)
// - criptare xor
// - afisare: mesaj original (ascii+hex), cheie (hex), criptat (hex), decriptat
// - verificare daca decriptarea e identica cu originalul
// - optional: salvare in fisiere

import { useState, useCallback, useMemo } from 'react'

// converteste string in array de bytes
function stringToBytes(str) {
  return new TextEncoder().encode(str)
}

// converteste bytes in string
function bytesToString(bytes) {
  return new TextDecoder().decode(bytes)
}

// converteste bytes in hex string
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')
}

// converteste string in reprezentare ascii (coduri)
function stringToAscii(str) {
  return Array.from(str)
    .map(c => c.charCodeAt(0))
    .join(' ')
}

// genereaza cheie aleatoare folosind crypto api (echivalent crypto/rand din go)
function generateKey(length) {
  const key = new Uint8Array(length)
  crypto.getRandomValues(key)
  return key
}

// functia xor - folosita si pentru criptare si decriptare
function xorBytes(data, key) {
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i]
  }
  return result
}

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

  // state pentru rezultate
  const [results, setResults] = useState(null)

  // procesare automata cand se schimba mesajul
  const processOTP = useCallback(() => {
    if (!message) {
      setResults(null)
      return
    }

    // pasul 1: convertim mesajul in bytes
    const messageBytes = stringToBytes(message)

    // pasul 2: generam cheie aleatoare de aceeasi lungime
    const keyBytes = generateKey(messageBytes.length)

    // pasul 3: criptam cu xor
    const encryptedBytes = xorBytes(messageBytes, keyBytes)

    // pasul 4: decriptam cu xor (aplicam xor din nou)
    const decryptedBytes = xorBytes(encryptedBytes, keyBytes)
    const decryptedMessage = bytesToString(decryptedBytes)

    // pasul 5: verificam daca decriptarea e identica
    const isValid = message === decryptedMessage

    setResults({
      original: {
        text: message,
        ascii: stringToAscii(message),
        hex: bytesToHex(messageBytes),
        bytes: messageBytes
      },
      key: {
        hex: bytesToHex(keyBytes),
        bytes: keyBytes
      },
      encrypted: {
        hex: bytesToHex(encryptedBytes),
        bytes: encryptedBytes
      },
      decrypted: {
        text: decryptedMessage,
        ascii: stringToAscii(decryptedMessage),
        hex: bytesToHex(decryptedBytes),
        bytes: decryptedBytes
      },
      isValid
    })
  }, [message])

  // functie pentru salvare in fisiere
  const saveToFiles = useCallback(() => {
    if (!results) return

    // salvam cheia
    const keyBlob = new Blob([results.key.hex], { type: 'text/plain' })
    const keyUrl = URL.createObjectURL(keyBlob)
    const keyLink = document.createElement('a')
    keyLink.href = keyUrl
    keyLink.download = 'otp_key.txt'
    keyLink.click()
    URL.revokeObjectURL(keyUrl)

    // salvam mesajul criptat
    const encBlob = new Blob([results.encrypted.hex], { type: 'text/plain' })
    const encUrl = URL.createObjectURL(encBlob)
    const encLink = document.createElement('a')
    encLink.href = encUrl
    encLink.download = 'encrypted_message.txt'
    encLink.click()
    URL.revokeObjectURL(encUrl)
  }, [results])

  return (
    <div className="space-y-6">
      {/* input mesaj */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          introdu mesajul text simplu (string)
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
            disabled={!message}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600
                       hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700
                       disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-3
                       rounded-lg font-medium transition-all duration-200
                       shadow-lg shadow-emerald-900/30"
          >
            🔐 cripteaza / decripteaza
          </button>
          {results && (
            <button
              onClick={saveToFiles}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg
                         font-medium transition-colors border border-slate-600"
            >
              💾 salveaza fisiere
            </button>
          )}
        </div>
      </div>

      {/* rezultate */}
      {results && (
        <div className="space-y-4">
          {/* mesaj original */}
          <DataSection title="mesaj original" icon="📝" variant="info">
            <DataDisplay label="text" value={results.original.text} variant="text" />
            <DataDisplay label="ascii (coduri)" value={results.original.ascii} variant="ascii" />
            <DataDisplay label="hex" value={results.original.hex} variant="hex" />
            <div className="mt-2 text-xs text-slate-500">
              lungime: {results.original.bytes.length} bytes
            </div>
          </DataSection>

          {/* cheie generata */}
          <DataSection title="cheie otp generata (crypto/rand)" icon="🔑" variant="warning">
            <DataDisplay label="hex" value={results.key.hex} variant="hex" />
            <div className="mt-2 text-xs text-slate-500">
              lungime: {results.key.bytes.length} bytes (egala cu mesajul)
            </div>
          </DataSection>

          {/* mesaj criptat */}
          <DataSection title="mesaj criptat (mesaj XOR cheie)" icon="🔒">
            <DataDisplay label="hex" value={results.encrypted.hex} variant="hex" />
            <div className="mt-2 text-xs text-slate-500">
              lungime: {results.encrypted.bytes.length} bytes
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
        </div>
      )}
    </div>
  )
}

export default OTPSimulator
