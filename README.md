# Simulare One-Time Pad (OTP)

Proiect de criptografie care demonstrează implementarea algoritmului **One-Time Pad** - singurul sistem criptografic cu securitate perfectă demonstrată matematic de Claude Shannon în 1949.

## Cuprins

- [Descriere](#descriere)
- [Funcționalități](#funcționalități)
- [Structura Proiectului](#structura-proiectului)
- [Instalare și Rulare](#instalare-și-rulare)
- [Cum Funcționează OTP](#cum-funcționează-otp)
- [Documentație](#documentație)
- [Tehnologii](#tehnologii)

## Descriere

Aplicația simulează mecanismul de criptare One-Time Pad:
- Primește un mesaj text de la utilizator
- Backend-ul Go generează cheie aleatorie cu `crypto/rand` (CSPRNG)
- Criptează mesajul folosind operația XOR
- Afișează rezultatele în multiple formate (text, ASCII, hex)
- Verifică că decriptarea produce mesajul original

## Funcționalități

### Criptare OTP
- **Input mesaj**: Introducerea unui text de criptat
- **Generare cheie**: Cheie aleatorie criptografic securizată
- **Criptare XOR**: Aplicarea operației XOR între mesaj și cheie
- **Decriptare automată**: Verificarea că XOR-ul invers produce mesajul original

### Afișare Rezultate
- **Mesaj original**: text, coduri ASCII, hexazecimal
- **Cheie OTP**: hexazecimal
- **Mesaj criptat**: hexazecimal
- **Mesaj decriptat**: text, coduri ASCII, hexazecimal
- **Verificare**: Confirmarea că decriptarea este identică cu originalul

### Salvare Fișiere (Opțional)
- Salvare cheie în `otp_cheie.txt`
- Salvare mesaj criptat în `mesaj_criptat.txt`

## Structura Proiectului

```
OTP-Project/
├── frontend-react/
│   ├── src/
│   │   ├── App.jsx              # componenta principala
│   │   └── components/
│   │       └── OTPSimulator.jsx # simulatorul otp
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   ├── presentation/
│   │   └── presentation.tex     # prezentare latex beamer
│   ├── report/
│   │   └── project_report.tex   # raport latex
│   ├── BACKEND.md
│   └── FRONTEND.md
└── README.md
```

## Instalare și Rulare

### Cerințe
- **Go 1.21+** (pentru backend)
- **Node.js 18+** (pentru frontend React)
- Browser web modern (Chrome, Firefox, Edge)
- LaTeX (opțional, pentru compilare documente)

### Pornire Rapidă

```bash
# clonare repository
git clone <repository-url>
cd OTP-Project

# 1. pornire backend go (intr-un terminal)
cd backend
go run main.go
# server porneste pe http://localhost:8080

# 2. pornire frontend react (in alt terminal)
cd frontend-react
npm install
npm run dev
# frontend porneste pe http://localhost:5173
```

**Important:** Backend-ul trebuie să ruleze pentru ca frontend-ul să funcționeze!

### Compilare Documentație LaTeX

```bash
cd docs

# compilare prezentare
cd presentation
pdflatex presentation.tex

# compilare raport
cd ../report
pdflatex project_report.tex
```

## Cum Funcționează OTP

### Formula Matematică

```
Criptare: C = M ⊕ K
Decriptare: M = C ⊕ K
```

unde:
- M = mesajul original (plaintext)
- K = cheia aleatorie
- C = mesajul criptat (ciphertext)
- ⊕ = operația XOR

### Condiții pentru Securitate Perfectă

1. **Aleatorietate**: Cheia trebuie să fie complet aleatorie (CSPRNG)
2. **Lungime**: Cheia trebuie să aibă lungimea mesajului
3. **Utilizare unică**: Cheia nu trebuie refolosită niciodată
4. **Secret**: Cheia trebuie păstrată secretă

### Exemplu

```
Mesaj:    "ABC"
ASCII:    65 66 67
Hex:      41 42 43

Cheie:    (random)
Hex:      A7 3F 82

Criptat:  mesaj XOR cheie
Hex:      E6 7D C1

Decriptat: criptat XOR cheie = mesaj original
```

### Operația XOR

| A | B | A ⊕ B |
|---|---|-------|
| 0 | 0 | 0     |
| 0 | 1 | 1     |
| 1 | 0 | 1     |
| 1 | 1 | 0     |

**Proprietăți importante:**
- `A ⊕ A = 0` (auto-inversă)
- `A ⊕ 0 = A` (element neutru)
- `(A ⊕ B) ⊕ B = A` (reversibilă)

## Documentație

### Raport LaTeX
- **Locație**: `docs/report/project_report.tex`
- **Conținut**: Teorie OTP, implementare, formule matematice, concluzii

### Prezentare LaTeX (Beamer)
- **Locație**: `docs/presentation/presentation.tex`
- **Durată**: ~10 minute
- **Conținut**: Slide-uri despre OTP, XOR, implementare

### Documentație Cod
- **Frontend**: `docs/FRONTEND.md`

## Tehnologii

### Backend
- **Go 1.21+** - server API
- **crypto/rand** - generare cheie criptografic securizată (CSPRNG)

### Frontend
- **React 19** - framework JavaScript modern
- **Tailwind CSS** - framework CSS pentru stilizare
- **Vite** - build tool rapid

### Documentație
- **LaTeX** - raport și prezentare
- **Beamer** - template pentru prezentare

## De Ce OTP?

One-Time Pad este special pentru că:

| Aspect | OTP |
|--------|-----|
| Securitate | Perfectă (demonstrată matematic) |
| Complexitate | Simplă (doar XOR) |
| Viteză | Foarte rapidă |
| Practică | Limitată (problema distribuției cheilor) |

### Avantaje
- Imposibil de spart dacă respectă condițiile
- Nu necesită putere de calcul mare
- Algoritm simplu și elegant

### Dezavantaje
- Cheia trebuie să fie la fel de lungă ca mesajul
- Fiecare cheie se folosește o singură dată
- Problema distribuției securizate a cheilor

## Bibliografie

1. Shannon, C. E. (1949). "Communication Theory of Secrecy Systems"
2. Schneier, B. (2015). "Applied Cryptography"
3. Go Documentation: crypto/rand package

## Autor

Proiect realizat pentru cursul de Criptografie.
