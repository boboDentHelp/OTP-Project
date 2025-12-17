# documentatie frontend react

documentatia pentru aplicatia frontend react 19 cu algoritmi criptografici.

## cuprins

- [prezentare generala](#prezentare-generala)
- [tehnologii si features](#tehnologii-si-features)
- [structura proiectului](#structura-proiectului)
- [instalare si rulare](#instalare-si-rulare)
- [componente](#componente)
- [hook-uri custom](#hook-uri-custom)
- [context api](#context-api)
- [servicii api](#servicii-api)
- [stiluri css](#stiluri-css)
- [react compiler](#react-compiler)

## prezentare generala

frontend-ul e o aplicatie react 19 care demonstreaza algoritmii criptografici. am folosit cele mai noi features din react inclusiv react compiler pentru optimizari automate.

### ce face aplicatia

- **otp** - criptare/decriptare one-time pad + demo vulnerabilitate key reuse
- **caesar** - cifrul caesar cu brute force
- **vigenere** - cifrul vigenere cu tabela interactiva
- **aes** - criptare aes-256
- **hash** - sha-256 cu demo efect avalansa
- **teorie** - explicatii si comparatii

## tehnologii si features

### react 19 features folosite

1. **useActionState** - pentru form actions (inlocuieste useFormState)
2. **useTransition** - pentru tranzitii smooth la operatii async
3. **react compiler** - memoizare automata (nu mai trebuie useMemo/useCallback manual)
4. **memo()** - pentru componentele care nu au nevoie de re-render
5. **forwardRef** - pentru a pasa ref-uri la componente

### alte tehnologii

- **vite** - bundler rapid pentru development
- **css variables** - pentru theming
- **web crypto api** - pentru hashing client-side

## structura proiectului

```
frontend-react/
├── index.html              # html principal
├── package.json            # dependente npm
├── vite.config.js          # configurare vite + react compiler
└── src/
    ├── main.jsx            # punct de intrare
    ├── App.jsx             # componenta principala
    ├── index.css           # stiluri globale
    ├── components/
    │   ├── Navbar.jsx      # navigare
    │   ├── Hero.jsx        # hero section
    │   ├── Footer.jsx      # footer
    │   ├── OTPSection.jsx  # sectiunea otp
    │   ├── CaesarSection.jsx
    │   ├── VigenereSection.jsx
    │   ├── AESSection.jsx
    │   ├── HashSection.jsx
    │   ├── TheorySection.jsx
    │   └── common/
    │       ├── Button.jsx  # buton reutilizabil
    │       ├── ResultBox.jsx
    │       └── index.js    # exporturi
    ├── hooks/
    │   └── useCrypto.js    # hook-uri pentru crypto
    ├── services/
    │   └── api.js          # comunicare cu backend
    ├── context/
    │   └── AppContext.jsx  # state global
    └── utils/              # functii utilitare
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

**nota:** trebuie sa ruleze si backend-ul pe port 8080 ca sa functioneze api-ul!

## componente

### App.jsx

componenta principala care pune totul cap la cap:

```jsx
function App() {
  return (
    <AppProvider>
      <div className="app">
        <Navbar />
        <MainContent />
        <Footer />
      </div>
    </AppProvider>
  )
}
```

### OTPSection.jsx

sectiunea pentru one-time pad foloseste `useActionState` din react 19:

```jsx
// useActionState e nou in react 19
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

    return { result: result.result, key: result.key }
  },
  null
)
```

### CaesarSection.jsx

foloseste hook-ul custom `useLocalCaesar` pentru operatii locale (fara server):

```jsx
const { cipher, bruteForce } = useLocalCaesar()

const handleBruteForce = useCallback(() => {
  const results = bruteForce(message)
  setBruteForceResults(results)
}, [message, bruteForce])
```

### VigenereSection.jsx

include tabela vigenere memoizata:

```jsx
const VigenereTable = memo(function VigenereTable() {
  const tableData = useMemo(() => {
    // generam tabela 26x26
    const rows = []
    // ...
    return rows
  }, [])

  return (
    <table className="vigenere-table">
      {/* ... */}
    </table>
  )
})
```

### HashSection.jsx

demonstratie efectul avalansa cu comparatie vizuala:

```jsx
const AvalancheDemo = memo(function AvalancheDemo() {
  const { comparison, compare } = useAvalancheDemo()

  useEffect(() => {
    compare(text1, text2)
  }, [text1, text2, compare])

  // afisam diferentele cu culori
  const renderHashDiff = useCallback((hash1, hash2) => {
    return hash1.split('').map((char, i) => {
      const isDiff = char !== hash2[i]
      return (
        <span className={isDiff ? 'hash-diff' : 'hash-same'}>
          {char}
        </span>
      )
    })
  }, [])
})
```

### componente comune

#### Button.jsx

buton reutilizabil cu suport pentru loading:

```jsx
const Button = forwardRef(function Button(
  { children, variant = 'primary', isLoading = false, disabled = false, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner" />}
      {children}
    </button>
  )
})
```

#### ResultBox.jsx

afisare rezultate cu suport pentru copiere:

```jsx
function ResultBox({ label, value, type = 'normal', showCopy = false }) {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    alert('copiat!')
  }, [value])

  return (
    <div className="result-group">
      <label>{label}</label>
      <div className={`result-box ${type}`}>
        {value || 'niciun rezultat...'}
      </div>
      {showCopy && value && (
        <button onClick={handleCopy}>copiaza</button>
      )}
    </div>
  )
}
```

## hook-uri custom

### useCrypto.js

hook-uri pentru operatii criptografice:

#### useCryptoOperation

hook generic pentru operatii async cu loading state:

```jsx
export function useCryptoOperation() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  const execute = useCallback(async (operation) => {
    setError(null)
    startTransition(async () => {
      try {
        const response = await operation()
        if (response.error) {
          setError(response.error)
        } else {
          setResult(response)
        }
      } catch (err) {
        setError(err.message)
      }
    })
  }, [])

  return { result, error, isLoading: isPending, execute }
}
```

#### useLocalHash

calculeaza hash sha-256 in browser cu web crypto api:

```jsx
export function useLocalHash() {
  const [hash, setHash] = useState('')
  const [isPending, startTransition] = useTransition()

  const calculateHash = useCallback(async (text) => {
    startTransition(async () => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setHash(hashHex)
    })
  }, [])

  return { hash, calculateHash, isCalculating: isPending }
}
```

#### useLocalCaesar

cifrul caesar implementat local:

```jsx
export function useLocalCaesar() {
  const cipher = useMemo(() => {
    return (text, shift, encrypt = true) => {
      const actualShift = encrypt ? shift : -shift
      const normalizedShift = ((actualShift % 26) + 26) % 26

      return text.split('').map(char => {
        if (char >= 'A' && char <= 'Z') {
          const code = char.charCodeAt(0) - 65
          const newCode = (code + normalizedShift) % 26
          return String.fromCharCode(newCode + 65)
        }
        // ... similar pentru lowercase
        return char
      }).join('')
    }
  }, [])

  const bruteForce = useCallback((text) => {
    const results = []
    for (let i = 0; i < 26; i++) {
      results.push({ shift: i, result: cipher(text, i, false) })
    }
    return results
  }, [cipher])

  return { cipher, bruteForce }
}
```

#### useAvalancheDemo

compara doua hash-uri si calculeaza diferentele:

```jsx
export function useAvalancheDemo() {
  const [comparison, setComparison] = useState(null)

  const compare = useCallback(async (text1, text2) => {
    // calculeaza ambele hash-uri
    // numara bitii diferiti
    // returneaza procentajul de diferenta
  }, [])

  return { comparison, compare }
}
```

## context api

### AppContext.jsx

gestioneaza starea globala (sectiunea activa):

```jsx
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeSection, setActiveSection] = useState('otp')

  const navigateTo = useCallback((sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const value = useMemo(() => ({
    activeSection,
    navigateTo,
    sections: SECTIONS
  }), [activeSection, navigateTo])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp trebuie folosit in AppProvider')
  }
  return context
}
```

## servicii api

### api.js

functii pentru comunicarea cu backend-ul:

```jsx
const API_BASE = '/api'

async function postRequest(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    return { error: 'nu s-a putut conecta la server' }
  }
}

export async function otpEncrypt(message) {
  return postRequest('/otp', { message, action: 'encrypt' })
}

export async function otpDecrypt(message, key) {
  return postRequest('/otp', { message, key, action: 'decrypt' })
}

// ... alte functii pentru fiecare endpoint
```

## stiluri css

folosim css variables pentru theming:

```css
:root {
  --primary-color: #6366f1;
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  /* ... */
}
```

### clase principale

- `.navbar` - bara de navigare fixa
- `.crypto-section` - sectiune pentru un algoritm
- `.crypto-card` - card cu continut
- `.btn` - buton cu variante (primary, secondary, accent)
- `.result-box` - afisare rezultate
- `.vigenere-table` - tabela interactiva

## react compiler

react compiler e o chestie noua din react 19 care face memoizare automata.

### configurare in vite.config.js

```jsx
import react from '@vitejs/plugin-react'

const ReactCompilerConfig = {
  target: '19'
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', ReactCompilerConfig]
        ]
      }
    })
  ]
})
```

### ce face react compiler

1. **memoizare automata** - nu mai trebuie sa punem useMemo si useCallback manual
2. **optimizari la build** - cod mai mic si mai rapid
3. **detectare dependente** - compilatorul stie ce sa memoizeze

### de ce tot folosim memo() si useCallback()

chiar daca react compiler face memoizare automata, tot le-am pus manual pentru:
1. sa fim siguri ca functioneaza corect
2. sa fie clar ce intentionam sa optimizam
3. pentru compatibilitate cu versiuni mai vechi

## performanta

### optimizari facute

1. **memo()** pe componente care nu se schimba des (Navbar, Footer, VigenereTable)
2. **useCallback()** pentru handlere ca sa nu se recreeze la fiecare render
3. **useMemo()** pentru date calculate (tabela vigenere)
4. **useTransition()** pentru operatii async fara blocking
5. **lazy loading** - ar putea fi adaugat pentru sectiuni

### ce ar mai putea fi imbunatatit

- code splitting cu React.lazy()
- virtualizare pentru lista brute force
- service worker pentru caching
- web workers pentru operatii grele
