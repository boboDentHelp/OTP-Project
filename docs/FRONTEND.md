# documentatie frontend react - simulare otp

documentatia pentru aplicatia frontend react 19 care simuleaza mecanismul one-time pad.

## cuprins

- [prezentare generala](#prezentare-generala)
- [tehnologii folosite](#tehnologii-folosite)
- [structura proiectului](#structura-proiectului)
- [instalare si rulare](#instalare-si-rulare)
- [componenta otpsimulator](#componenta-otpsimulator)
- [implementare otp](#implementare-otp)
- [formate de afisare](#formate-de-afisare)

## prezentare generala

frontend-ul e o aplicatie react 19 care simuleaza criptarea one-time pad. totul se face client-side folosind web crypto api pentru generarea cheilor.

### ce face aplicatia

1. primeste un mesaj text de la utilizator
2. genereaza cheie aleatorie de aceeasi lungime cu `crypto.getRandomValues()`
3. cripteaza cu xor intre mesaj si cheie
4. afiseaza: mesaj original (text, ascii, hex), cheie (hex), criptat (hex), decriptat
5. verifica ca decriptarea e identica cu originalul
6. optional: salveaza cheie si mesaj criptat in fisiere

## tehnologii folosite

- **react 19** - framework javascript
- **tailwind css** - framework css pentru stilizare
- **vite** - bundler rapid pentru development
- **web crypto api** - `crypto.getRandomValues()` pentru generare cheie securizata

## structura proiectului

```
frontend-react/
├── index.html              # html principal
├── package.json            # dependente npm
├── tailwind.config.js      # configurare tailwind
├── vite.config.js          # configurare vite
└── src/
    ├── main.jsx            # punct de intrare
    ├── App.jsx             # componenta principala
    ├── index.css           # stiluri globale + tailwind
    └── components/
        └── OTPSimulator.jsx  # simulatorul otp
```

## instalare si rulare

```bash
# navigam in directorul frontend
cd frontend-react

# instalam dependentele
npm install

# pornim serverul de development
npm run dev

# build pentru productie
npm run build
```

serverul porneste pe `http://localhost:5173`

## componenta otpsimulator

componenta principala care face toata treaba:

```jsx
// importuri
import { useState, useCallback } from 'react'

function OTPSimulator() {
  const [message, setMessage] = useState('')
  const [results, setResults] = useState(null)

  // functie pentru criptare
  const encrypt = useCallback(() => {
    // ... logica de criptare
  }, [message])

  return (
    // ... jsx
  )
}
```

### state-ul componentei

```jsx
const [message, setMessage] = useState('')      // mesajul introdus de user
const [results, setResults] = useState(null)    // rezultatele criptarii
```

### structura results

```javascript
results = {
  original: {
    text: 'ABC',           // mesajul original
    bytes: Uint8Array,     // bytes
    ascii: '65 66 67',     // coduri ascii
    hex: '41 42 43'        // hexazecimal
  },
  key: {
    bytes: Uint8Array,     // cheia generata
    hex: 'A7 3F 82'        // hex
  },
  encrypted: {
    bytes: Uint8Array,     // mesaj criptat
    hex: 'E6 7D C1'        // hex
  },
  decrypted: {
    text: 'ABC',           // mesaj decriptat
    bytes: Uint8Array,
    ascii: '65 66 67',
    hex: '41 42 43'
  },
  isMatch: true            // verifica daca decriptarea = original
}
```

## implementare otp

### generare cheie aleatorie

folosim `crypto.getRandomValues()` care e echivalent cu `crypto/rand` din go:

```javascript
// genereaza cheie aleatorie securizata
const generateKey = (length) => {
  const key = new Uint8Array(length)
  crypto.getRandomValues(key)  // csprng - cryptographically secure
  return key
}
```

**nota importanta:** `crypto.getRandomValues()` e criptografic securizat, spre deosebire de `Math.random()` care nu e!

### operatia xor

```javascript
// xor intre doua array-uri de bytes
const xorBytes = (a, b) => {
  const result = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i]
  }
  return result
}
```

### conversie text la bytes

```javascript
// text -> bytes (utf-8)
const encoder = new TextEncoder()
const messageBytes = encoder.encode(message)

// bytes -> text
const decoder = new TextDecoder()
const text = decoder.decode(bytes)
```

### conversie la hex

```javascript
// bytes -> hex string
const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')
}
```

### conversie la ascii

```javascript
// bytes -> ascii codes
const bytesToAscii = (bytes) => {
  return Array.from(bytes)
    .map(b => b.toString())
    .join(' ')
}
```

### flow complet de criptare

```javascript
const encrypt = useCallback(() => {
  if (!message.trim()) return

  // 1. convertim mesajul la bytes
  const encoder = new TextEncoder()
  const messageBytes = encoder.encode(message)

  // 2. generam cheie aleatorie de aceeasi lungime
  const keyBytes = new Uint8Array(messageBytes.length)
  crypto.getRandomValues(keyBytes)

  // 3. criptam cu xor
  const encryptedBytes = new Uint8Array(messageBytes.length)
  for (let i = 0; i < messageBytes.length; i++) {
    encryptedBytes[i] = messageBytes[i] ^ keyBytes[i]
  }

  // 4. decriptam (pt verificare)
  const decryptedBytes = new Uint8Array(encryptedBytes.length)
  for (let i = 0; i < encryptedBytes.length; i++) {
    decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i]
  }

  // 5. verificam ca decriptarea = original
  const decoder = new TextDecoder()
  const decryptedText = decoder.decode(decryptedBytes)
  const isMatch = decryptedText === message

  // 6. setam rezultatele
  setResults({
    original: {
      text: message,
      bytes: messageBytes,
      ascii: bytesToAscii(messageBytes),
      hex: bytesToHex(messageBytes)
    },
    key: {
      bytes: keyBytes,
      hex: bytesToHex(keyBytes)
    },
    encrypted: {
      bytes: encryptedBytes,
      hex: bytesToHex(encryptedBytes)
    },
    decrypted: {
      text: decryptedText,
      bytes: decryptedBytes,
      ascii: bytesToAscii(decryptedBytes),
      hex: bytesToHex(decryptedBytes)
    },
    isMatch
  })
}, [message])
```

## formate de afisare

aplicatia afiseaza rezultatele in 3 formate:

| format | descriere | exemplu pentru "ABC" |
|--------|-----------|---------------------|
| text | caracterele originale | ABC |
| ascii | coduri ascii (decimal) | 65 66 67 |
| hex | valori hexazecimale | 41 42 43 |

### de ce multiple formate?

1. **text** - pentru intelegere umana
2. **ascii** - pentru a vedea valorile numerice ale caracterelor
3. **hex** - standard in criptografie, mai compact decat ascii

## salvare fisiere

aplicatia permite salvarea cheii si mesajului criptat in fisiere separate:

```javascript
// functie pentru download fisier
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
  const content = `OTP KEY (hex)\n${results.key.hex}\n\nLungime: ${results.key.bytes.length} bytes`
  downloadFile(content, 'otp_cheie.txt')
}, [results, downloadFile])

// salvare mesaj criptat
const saveEncrypted = useCallback(() => {
  if (!results) return
  const content = `MESAJ CRIPTAT (hex)\n${results.encrypted.hex}\n\nMesaj original: "${results.original.text}"\nLungime: ${results.encrypted.bytes.length} bytes`
  downloadFile(content, 'mesaj_criptat.txt')
}, [results, downloadFile])
```

## stilizare cu tailwind

folosim tailwind css pentru stilizare:

```jsx
// exemplu de clase tailwind
<div className="min-h-screen bg-slate-950 text-slate-100">
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
      one-time pad simulator
    </h1>
  </div>
</div>
```

### clase principale folosite

- `bg-slate-950` - fundal inchis
- `text-slate-100` - text deschis
- `from-emerald-400 to-cyan-400` - gradient pentru titlu
- `rounded-lg` - colturi rotunjite
- `p-4`, `px-4`, `py-8` - padding
- `space-y-4` - spatiu vertical intre elemente

## verificare securitate

aplicatia verifica automat ca decriptarea produce mesajul original:

```jsx
{results.isMatch ? (
  <div className="text-emerald-400">
    ✓ decriptarea este identica cu mesajul original
  </div>
) : (
  <div className="text-red-400">
    ✗ eroare - decriptarea nu corespunde
  </div>
)}
```

## note importante

1. **crypto.getRandomValues()** e criptografic securizat (csprng)
2. **xor e reversibil** - aceeasi operatie pentru criptare si decriptare
3. **cheia trebuie sa fie unica** - "one-time" inseamna o singura utilizare
4. **lungimea cheii = lungimea mesajului** - conditie obligatorie pentru otp
