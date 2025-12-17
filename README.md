# Proiect Criptografie: One-Time Pad și Algoritmi Criptografici

Acest proiect demonstrează implementarea și analiza algoritmilor criptografici, cu accent pe **One-Time Pad (OTP)** - singurul sistem criptografic cu securitate perfectă demonstrată matematic.

## Cuprins

- [Descriere](#descriere)
- [Funcționalități](#funcționalități)
- [Structura Proiectului](#structura-proiectului)
- [Instalare și Rulare](#instalare-și-rulare)
- [Algoritmi Implementați](#algoritmi-implementați)
- [Documentație](#documentație)
- [Capturi de Ecran](#capturi-de-ecran)
- [Tehnologii](#tehnologii)
- [Bibliografie](#bibliografie)

## Descriere

Proiectul explorează mai mulți algoritmi criptografici prin intermediul unei aplicații web interactive:

- **Cifruri Clasice**: Caesar, Vigenère
- **Criptare Modernă**: AES-256 (CBC mode)
- **Funcții Hash**: SHA-256
- **Focus Principal**: One-Time Pad cu demonstrații de securitate perfectă și vulnerabilități

## Funcționalități

### One-Time Pad (OTP)
- Criptare/decriptare cu cheie generată automat
- Generare cheie criptografic securizată (crypto/rand)
- Demonstrație interactivă a pericolului reutilizării cheii
- Vizualizarea operației XOR

### Cifrul Caesar
- Criptare/decriptare cu deplasare configurabilă (0-25)
- Slider interactiv pentru selectarea deplasării
- **Atac brute-force** - afișează toate cele 25 de variante posibile

### Cifrul Vigenère
- Criptare/decriptare cu cuvânt-cheie
- Tabel Vigenère interactiv generat automat
- Explicații teoretice despre vulnerabilități

### AES-256
- Criptare în modul CBC
- Padding PKCS7
- IV aleatoriu pentru fiecare criptare
- Suport pentru parole (derivare cheie cu SHA-256)

### SHA-256 Hash
- Hashing în timp real
- **Demonstrație Efect Avalanșă** - vizualizare diferențe între hash-uri
- Statistici despre biții diferiți

### Secțiunea Teoretică
- Formule matematice pentru fiecare algoritm
- Tabel comparativ al algoritmilor
- Explicații despre securitate și vulnerabilități

## Structura Proiectului

```
OTP-Project/
├── backend/
│   └── main.go              # Server Go + API REST
├── frontend/
│   ├── index.html           # Interfața web
│   ├── styles.css           # Stiluri CSS (dark theme)
│   └── app.js               # Logica JavaScript
├── docs/
│   ├── presentation/
│   │   └── presentation.tex # Prezentare LaTeX (Beamer)
│   ├── report/
│   │   └── project_report.tex # Raport LaTeX
│   ├── output/              # PDF-uri generate
│   └── Makefile             # Build pentru LaTeX
├── OTP-main/
│   └── Proiect Criptografie/
│       └── OTP.go           # Implementarea originală CLI
└── README.md
```

## Instalare și Rulare

### Cerințe
- Go 1.21+ (pentru backend)
- Browser web modern (Chrome, Firefox, Edge)
- LaTeX (opțional, pentru compilare documente)

### Pornire Rapidă

```bash
# Clonare repository
git clone <repository-url>
cd OTP-Project

# Pornire server
cd backend
go run main.go

# Deschide în browser
# http://localhost:8080
```

### Compilare Documentație LaTeX

```bash
cd docs

# Compilare toate documentele
make all

# Sau individual
make presentation  # Generează prezentarea
make report        # Generează raportul

# Curățare fișiere auxiliare
make clean
```

## Algoritmi Implementați

### 1. One-Time Pad (OTP)

**Securitate**: Perfectă (teoretic)

**Formula**:
```
Criptare: C = M ⊕ K
Decriptare: M = C ⊕ K
```

**Condiții pentru securitate perfectă**:
1. Cheia trebuie să fie complet aleatorie
2. Cheia trebuie să aibă lungimea mesajului
3. Cheia nu trebuie refolosită niciodată
4. Cheia trebuie păstrată secretă

### 2. Cifrul Caesar

**Securitate**: Foarte slabă (25 chei posibile)

**Formula**:
```
Criptare: E(x) = (x + k) mod 26
Decriptare: D(x) = (x - k) mod 26
```

### 3. Cifrul Vigenère

**Securitate**: Moderată (vulnerabil la atacuri Kasiski/Friedman)

**Formula**:
```
Criptare: Ci = (Mi + Ki mod |K|) mod 26
Decriptare: Mi = (Ci - Ki mod |K| + 26) mod 26
```

### 4. AES-256

**Securitate**: Foarte puternică

**Caracteristici**:
- Lungime cheie: 256 biți
- Dimensiune bloc: 128 biți
- Număr runde: 14
- Mod implementat: CBC cu PKCS7 padding

### 5. SHA-256

**Tip**: Funcție hash criptografică

**Proprietăți**:
- Output: 256 biți (64 caractere hex)
- Determinism, eficiență
- Rezistență la preimage și coliziuni
- Efect avalanșă

## Documentație

### Prezentare (PowerPoint Alternative)
- Format: LaTeX Beamer
- Locație: `docs/presentation/presentation.tex`
- Output: `docs/output/presentation.pdf`
- Durată estimată: ~10 minute

### Raport (Word Alternative)
- Format: LaTeX Article
- Locație: `docs/report/project_report.tex`
- Output: `docs/output/project_report.pdf`
- Conținut: Teorie completă + implementare + concluzii

## API Endpoints

| Endpoint | Metodă | Descriere |
|----------|--------|-----------|
| `/api/otp` | POST | Criptare/Decriptare OTP |
| `/api/caesar` | POST | Cifrul Caesar |
| `/api/vigenere` | POST | Cifrul Vigenère |
| `/api/aes` | POST | Criptare AES-256 CBC |
| `/api/hash` | POST | Hash SHA-256 |
| `/api/xor-analysis` | POST | Demonstrație key reuse |

### Exemplu Request OTP

```json
// Criptare
POST /api/otp
{
    "message": "Hello World",
    "action": "encrypt"
}

// Response
{
    "result": "a5b3c2d1e0f9...",
    "key": "1a2b3c4d5e6f..."
}
```

## Tehnologii

- **Backend**: Go (Golang)
  - `crypto/rand` - generare numere aleatoare securizate
  - `crypto/aes` - implementare AES
  - `crypto/sha256` - funcție hash
  - `net/http` - server HTTP

- **Frontend**: HTML5, CSS3, JavaScript
  - Web Crypto API pentru hashing client-side
  - Fetch API pentru comunicare REST
  - CSS Variables pentru tematizare

- **Documentație**: LaTeX
  - Beamer pentru prezentări
  - Article pentru rapoarte

## Bibliografie

1. Shannon, C. E. (1949). "Communication Theory of Secrecy Systems"
2. Schneier, B. (2015). "Applied Cryptography"
3. Ferguson, N., Schneier, B. (2010). "Cryptography Engineering"
4. NIST FIPS 197 - AES Standard
5. NIST FIPS 180-4 - SHA Standard

## Autor

Proiect realizat pentru cursul de Criptografie și Securitatea Informațiilor.

## Licență

Acest proiect este destinat exclusiv scopurilor educaționale.
