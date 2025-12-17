// componenta principala pentru demonstratia otp
// etape: generare cheie, criptare xor, decriptare xor
import { useState, useCallback } from 'react'

// functie pentru generare cheie aleatoare (client-side)
// folosim crypto.getRandomValues care e securizat
function generateRandomKey(length) {
  const key = new Uint8Array(length)
  crypto.getRandomValues(key)
  return key
}

// functie xor - folosita si pentru criptare si pentru decriptare
// asta e tot secretul otp: mesaj XOR cheie = criptat, criptat XOR cheie = mesaj
function xorBytes(data, key) {
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i]
  }
  return result
}

// converteste bytes in hex string pentru afisare
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// converteste hex string inapoi in bytes
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

// converteste string in bytes (utf-8)
function stringToBytes(str) {
  return new TextEncoder().encode(str)
}

// converteste bytes in string
function bytesToString(bytes) {
  return new TextDecoder().decode(bytes)
}

function OTPDemo() {
  // state pentru criptare
  const [message, setMessage] = useState('')
  const [encryptedHex, setEncryptedHex] = useState('')
  const [keyHex, setKeyHex] = useState('')

  // state pentru decriptare
  const [decryptInput, setDecryptInput] = useState('')
  const [decryptKey, setDecryptKey] = useState('')
  const [decryptedMessage, setDecryptedMessage] = useState('')

  // state pentru erori
  const [error, setError] = useState('')

  // functia de criptare
  const handleEncrypt = useCallback(() => {
    setError('')

    if (!message) {
      setError('introdu un mesaj pentru criptare')
      return
    }

    // pasul 1: convertim mesajul in bytes
    const messageBytes = stringToBytes(message)

    // pasul 2: generam cheie aleatoare de aceeasi lungime cu mesajul
    const key = generateRandomKey(messageBytes.length)

    // pasul 3: aplicam xor intre mesaj si cheie
    const encrypted = xorBytes(messageBytes, key)

    // salvam rezultatele in hex pentru afisare
    setEncryptedHex(bytesToHex(encrypted))
    setKeyHex(bytesToHex(key))
  }, [message])

  // functia de decriptare
  const handleDecrypt = useCallback(() => {
    setError('')
    setDecryptedMessage('')

    if (!decryptInput || !decryptKey) {
      setError('introdu mesajul criptat si cheia')
      return
    }

    try {
      // convertim din hex in bytes
      const encryptedBytes = hexToBytes(decryptInput)
      const keyBytes = hexToBytes(decryptKey)

      // verificam ca au aceeasi lungime
      if (encryptedBytes.length !== keyBytes.length) {
        setError('lungimea cheii trebuie sa fie egala cu lungimea mesajului criptat')
        return
      }

      // aplicam xor pentru decriptare (acelasi lucru ca la criptare!)
      const decrypted = xorBytes(encryptedBytes, keyBytes)

      // convertim bytes in string
      setDecryptedMessage(bytesToString(decrypted))
    } catch (e) {
      setError('format hex invalid')
    }
  }, [decryptInput, decryptKey])

  // functie pentru a copia automat valorile in sectiunea de decriptare
  const handleCopyToDecrypt = useCallback(() => {
    setDecryptInput(encryptedHex)
    setDecryptKey(keyHex)
  }, [encryptedHex, keyHex])

  return (
    <div className="space-y-8">
      {/* sectiunea de criptare */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-400">1.</span> criptare
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              mesaj original (plaintext)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="scrie mesajul aici..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          <button
            onClick={handleEncrypt}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium
                       transition-colors"
          >
            cripteaza
          </button>

          {encryptedHex && (
            <div className="space-y-4 mt-4 p-4 bg-gray-900 rounded-lg">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  cheie generata (hex) - lungime: {keyHex.length / 2} bytes
                </label>
                <div className="font-mono text-sm bg-gray-700 p-3 rounded break-all text-yellow-400">
                  {keyHex}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  mesaj criptat (hex)
                </label>
                <div className="font-mono text-sm bg-gray-700 p-3 rounded break-all text-green-400">
                  {encryptedHex}
                </div>
              </div>

              <button
                onClick={handleCopyToDecrypt}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                → copiaza in sectiunea de decriptare
              </button>
            </div>
          )}
        </div>
      </section>

      {/* sectiunea de decriptare */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-400">2.</span> decriptare
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              mesaj criptat (hex)
            </label>
            <textarea
              value={decryptInput}
              onChange={(e) => setDecryptInput(e.target.value)}
              placeholder="introdu mesajul criptat in format hex..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                         font-mono text-sm text-white placeholder-gray-500
                         focus:outline-none focus:border-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              cheie (hex)
            </label>
            <textarea
              value={decryptKey}
              onChange={(e) => setDecryptKey(e.target.value)}
              placeholder="introdu cheia in format hex..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
                         font-mono text-sm text-white placeholder-gray-500
                         focus:outline-none focus:border-blue-500"
              rows={2}
            />
          </div>

          <button
            onClick={handleDecrypt}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium
                       transition-colors"
          >
            decripteaza
          </button>

          {decryptedMessage && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <label className="block text-sm text-gray-400 mb-2">
                mesaj decriptat
              </label>
              <div className="bg-gray-700 p-3 rounded text-green-400">
                {decryptedMessage}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* afisare erori */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

export default OTPDemo
