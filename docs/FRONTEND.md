# documentatie frontend react - simulare otp

documentatia pentru aplicatia frontend react 19 care afiseaza interfata pentru simulatorul otp.

## cuprins

- [prezentare generala](#prezentare-generala)
- [tehnologii folosite](#tehnologii-folosite)
- [structura proiectului](#structura-proiectului)
- [instalare si rulare](#instalare-si-rulare)
- [componenta otpsimulator](#componenta-otpsimulator)
- [comunicare cu backend](#comunicare-cu-backend)

## prezentare generala

frontend-ul e o aplicatie react 19 care ofera interfata pentru simulatorul otp. **toata logica criptografica se face in backend-ul go**.

### ce face frontend-ul

1. primeste mesaj text de la utilizator
2. trimite mesajul la backend-ul go (`POST /api/otp`)
3. primeste rezultatele de la backend (cheie, criptat, decriptat)
4. afiseaza rezultatele in formate diferite (text, ascii, hex)
5. permite salvarea cheii si mesajului criptat in fisiere

**nota importanta:** frontend-ul nu face criptare! doar afiseaza rezultatele primite de la backend.

## tehnologii folosite

- **react 19** - framework javascript
- **tailwind css** - framework css pentru stilizare
- **vite** - bundler rapid pentru development
- **fetch api** - pentru comunicare cu backend-ul go

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
# 1. porneste backend-ul go mai intai!
cd backend
go run main.go

# 2. apoi porneste frontend-ul
cd frontend-react
npm install
npm run dev
```

serverul frontend porneste pe `http://localhost:5173`
backend-ul trebuie sa ruleze pe `http://localhost:8080`

## componenta otpsimulator

componenta principala care comunica cu backend-ul:

```jsx
import { useState, useCallback } from 'react'

// url-ul backend-ului go
const API_URL = 'http://localhost:8080/api/otp'

function OTPSimulator() {
  const [message, setMessage] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // apeleaza backend-ul pentru criptare
  const processOTP = useCallback(async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const data = await response.json()
    setResults(data)
  }, [message])

  return (
    // ... jsx pentru afisare
  )
}
```

### state-ul componentei

```jsx
const [message, setMessage] = useState('')      // mesajul introdus de user
const [results, setResults] = useState(null)    // rezultatele de la backend
const [loading, setLoading] = useState(false)   // indicator loading
const [error, setError] = useState(null)        // mesaj eroare
```

### structura results (de la backend)

```javascript
results = {
  original: {
    text: 'ABC',           // mesajul original
    ascii: '65 66 67',     // coduri ascii
    hex: '41 42 43'        // hexazecimal
  },
  key: {
    hex: 'A7 3F 82'        // cheia generata de backend cu crypto/rand
  },
  encrypted: {
    hex: 'E6 7D C1'        // mesaj criptat
  },
  decrypted: {
    text: 'ABC',           // mesaj decriptat
    ascii: '65 66 67',
    hex: '41 42 43'
  },
  isValid: true            // verifica daca decriptarea = original
}
```

## comunicare cu backend

### request

```javascript
const response = await fetch('http://localhost:8080/api/otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: 'mesajul de criptat' }),
})
```

### response de la backend

```json
{
  "originalText": "mesajul",
  "originalAscii": "109 101 115 97 106 117 108",
  "originalHex": "6D 65 73 61 6A 75 6C",
  "keyHex": "A7 3F 82 1B C9 D4 E5",
  "encryptedHex": "CA 5A F1 7A A3 A1 89",
  "decryptedText": "mesajul",
  "decryptedAscii": "109 101 115 97 106 117 108",
  "decryptedHex": "6D 65 73 61 6A 75 6C",
  "isMatch": true
}
```

### mapare raspuns backend -> state frontend

```javascript
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
```

## salvare fisiere

frontend-ul permite salvarea cheii si mesajului criptat:

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
  const content = `OTP KEY (hex) - generat cu crypto/rand\n${results.key.hex}`
  downloadFile(content, 'otp_cheie.txt')
}, [results, downloadFile])
```

## stilizare cu tailwind

folosim tailwind css pentru stilizare:

```jsx
<div className="min-h-screen bg-slate-950 text-slate-100">
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
      one-time pad simulator
    </h1>
  </div>
</div>
```

## note importante

1. **frontend-ul nu face criptare** - doar afiseaza rezultatele de la backend
2. **backend-ul trebuie sa ruleze** - pe port 8080
3. **cheia e generata de backend** - cu go crypto/rand (csprng)
4. **cors e activat** - backend-ul permite requesturi de la frontend
