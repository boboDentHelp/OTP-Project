// hook-uri custom pentru operatii criptografice
// folosim react 19 features: useTransition, useOptimistic, etc

import { useState, useCallback, useTransition, useMemo } from 'react'

// hook pentru operatii async cu loading state
// useTransition e din react 18+ si face tranzitii smooth
export function useCryptoOperation() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  // functia care executa operatia
  // useCallback memoreaza functia ca sa nu se recreeze la fiecare renderlogic
  const execute = useCallback(async (operation) => {
    // resetam erorile dinainte
    setError(null)

    // folosim startTransition pentru o experienta mai buna
    // practic react nu blocheaza ui-ul cand se face request
    startTransition(async () => {
      try {
        const response = await operation()

        if (response.error) {
          setError(response.error)
          setResult(null)
        } else {
          setResult(response)
          setError(null)
        }
      } catch (err) {
        setError(err.message || 'ceva nu a mers bine')
        setResult(null)
      }
    })
  }, [])

  // reset function ca sa stergem rezultatele
  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    error,
    isLoading: isPending,
    execute,
    reset
  }
}

// hook pentru calcularea hash-ului local (fara server)
// foloseste web crypto api care e disponibil in browser
export function useLocalHash() {
  const [hash, setHash] = useState('')
  const [isPending, startTransition] = useTransition()

  // functie pentru calcularea sha256 in browser
  const calculateHash = useCallback(async (text) => {
    if (!text) {
      setHash('')
      return
    }

    startTransition(async () => {
      try {
        // convertim textul in bytes
        const encoder = new TextEncoder()
        const data = encoder.encode(text)

        // calculam hash-ul cu web crypto api
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)

        // convertim rezultatul in hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        setHash(hashHex)
      } catch (err) {
        console.error('eroare la calcularea hash-ului:', err)
        setHash('')
      }
    })
  }, [])

  return { hash, calculateHash, isCalculating: isPending }
}

// hook pentru compararea a doua hash-uri (efectul avalansa)
export function useAvalancheDemo() {
  const [comparison, setComparison] = useState(null)
  const [isPending, startTransition] = useTransition()

  const compare = useCallback(async (text1, text2) => {
    if (!text1 || !text2) {
      setComparison(null)
      return
    }

    startTransition(async () => {
      try {
        const encoder = new TextEncoder()

        // calculam ambele hash-uri
        const hash1Buffer = await crypto.subtle.digest('SHA-256', encoder.encode(text1))
        const hash2Buffer = await crypto.subtle.digest('SHA-256', encoder.encode(text2))

        const hash1Array = Array.from(new Uint8Array(hash1Buffer))
        const hash2Array = Array.from(new Uint8Array(hash2Buffer))

        const hash1 = hash1Array.map(b => b.toString(16).padStart(2, '0')).join('')
        const hash2 = hash2Array.map(b => b.toString(16).padStart(2, '0')).join('')

        // numaram bitii diferiti
        let diffBits = 0
        for (let i = 0; i < hash1Array.length; i++) {
          // xor intre bytes ne da bitii diferiti
          let xor = hash1Array[i] ^ hash2Array[i]
          // numaram bitii setati (1) din rezultatul xor
          while (xor) {
            diffBits += xor & 1
            xor >>= 1
          }
        }

        const totalBits = 256
        const diffPercentage = ((diffBits / totalBits) * 100).toFixed(1)

        setComparison({
          hash1,
          hash2,
          diffBits,
          totalBits,
          diffPercentage
        })
      } catch (err) {
        console.error('eroare la compararea hash-urilor:', err)
        setComparison(null)
      }
    })
  }, [])

  return { comparison, compare, isComparing: isPending }
}

// hook pentru cifrul caesar local (nu are nevoie de server)
export function useLocalCaesar() {
  // functie memoizata pentru criptare/decriptare caesar
  const cipher = useMemo(() => {
    return (text, shift, encrypt = true) => {
      // ajustam shift-ul pentru decriptare
      const actualShift = encrypt ? shift : -shift
      // ne asiguram ca e pozitiv si in range
      const normalizedShift = ((actualShift % 26) + 26) % 26

      return text.split('').map(char => {
        // verificam daca e litera mare
        if (char >= 'A' && char <= 'Z') {
          const code = char.charCodeAt(0) - 65
          const newCode = (code + normalizedShift) % 26
          return String.fromCharCode(newCode + 65)
        }
        // verificam daca e litera mica
        if (char >= 'a' && char <= 'z') {
          const code = char.charCodeAt(0) - 97
          const newCode = (code + normalizedShift) % 26
          return String.fromCharCode(newCode + 97)
        }
        // alte caractere raman neschimbate
        return char
      }).join('')
    }
  }, [])

  // functie pentru brute force - incearca toate deplasarile
  const bruteForce = useCallback((text) => {
    const results = []
    for (let i = 0; i < 26; i++) {
      results.push({
        shift: i,
        result: cipher(text, i, false)
      })
    }
    return results
  }, [cipher])

  return { cipher, bruteForce }
}

// hook pentru cifrul vigenere local
export function useLocalVigenere() {
  const cipher = useMemo(() => {
    return (text, key, encrypt = true) => {
      // normalizare cheie - doar litere mari
      const normalizedKey = key.toUpperCase().replace(/[^A-Z]/g, '')
      if (!normalizedKey) return text

      let keyIndex = 0

      return text.split('').map(char => {
        const isUpper = char >= 'A' && char <= 'Z'
        const isLower = char >= 'a' && char <= 'z'

        if (!isUpper && !isLower) return char

        const charCode = char.toUpperCase().charCodeAt(0) - 65
        const keyCode = normalizedKey[keyIndex % normalizedKey.length].charCodeAt(0) - 65
        keyIndex++

        let newCode
        if (encrypt) {
          newCode = (charCode + keyCode) % 26
        } else {
          newCode = (charCode - keyCode + 26) % 26
        }

        const newChar = String.fromCharCode(newCode + 65)
        return isLower ? newChar.toLowerCase() : newChar
      }).join('')
    }
  }, [])

  return { cipher }
}
