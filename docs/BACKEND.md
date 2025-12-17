# documentatie backend

documentatia pentru serverul go care furnizeaza api-ul pentru aplicatia de criptografie.

## cuprins

- [prezentare generala](#prezentare-generala)
- [structura proiectului](#structura-proiectului)
- [pornire server](#pornire-server)
- [endpoint-uri api](#endpoint-uri-api)
- [implementare algoritmi](#implementare-algoritmi)
- [exemple de utilizare](#exemple-de-utilizare)

## prezentare generala

backend-ul este scris in go si ofera un api rest pentru operatii criptografice. folosim pachetele standard din go pentru criptografie (`crypto/rand`, `crypto/aes`, `crypto/sha256`) care sunt securizate si testate.

### tehnologii folosite

- **go 1.21+** - limbajul de programare
- **net/http** - server http nativ din go
- **crypto/rand** - generare numere aleatoare criptografic securizate
- **crypto/aes** - implementare aes
- **crypto/sha256** - functie hash sha-256
- **encoding/json** - serializare/deserializare json
- **encoding/hex** - conversie hex
- **encoding/base64** - conversie base64

## structura proiectului

```
backend/
└── main.go    # tot codul e intr-un singur fisier ca e simplu
```

### organizarea codului in main.go

```go
// structura fisierului:

// 1. import-uri
// 2. structuri pentru request/response otp
// 3. functii otp (xorEncryptDecrypt, generateKey, handleOTP)
// 4. structuri pentru caesar
// 5. functii caesar
// 6. structuri pentru vigenere
// 7. functii vigenere
// 8. structuri pentru aes
// 9. functii aes
// 10. structuri pentru hash
// 11. functii hash
// 12. structuri pentru xor analysis
// 13. functii xor analysis
// 14. functii utilitare (cors, json)
// 15. main
```

## pornire server

```bash
# navigam in directorul backend
cd backend

# rulam serverul
go run main.go

# sau compilam si rulam
go build -o server main.go
./server
```

serverul porneste pe portul 8080 si afiseaza:
```
🔐 cryptography demo server starting on http://localhost:8080
available endpoints:
  post /api/otp       - one-time pad encryption/decryption
  post /api/caesar    - caesar cipher
  post /api/vigenere  - vigenère cipher
  post /api/aes       - aes-256 encryption
  post /api/hash      - sha-256 hashing
  post /api/xor-analysis - xor analysis demonstration
```

## endpoint-uri api

### post /api/otp

criptare si decriptare one-time pad.

**request pentru criptare:**
```json
{
  "message": "mesajul de criptat",
  "action": "encrypt"
}
```

**response:**
```json
{
  "result": "a5b3c2d1e0f9...",
  "key": "1a2b3c4d5e6f..."
}
```

**request pentru decriptare:**
```json
{
  "message": "a5b3c2d1e0f9...",
  "key": "1a2b3c4d5e6f...",
  "action": "decrypt"
}
```

**response:**
```json
{
  "result": "mesajul de criptat",
  "message": "decryption successful"
}
```

### post /api/caesar

cifrul caesar cu deplasare configurabila.

**request:**
```json
{
  "message": "hello world",
  "shift": 3,
  "action": "encrypt"
}
```

**response:**
```json
{
  "result": "khoor zruog",
  "shift": 3
}
```

### post /api/vigenere

cifrul vigenere cu cuvant cheie.

**request:**
```json
{
  "message": "hello world",
  "key": "secret",
  "action": "encrypt"
}
```

**response:**
```json
{
  "result": "zincs pgvnu",
  "key": "secret"
}
```

### post /api/aes

criptare aes-256 in mod cbc.

**request pentru criptare:**
```json
{
  "message": "mesaj secret",
  "key": "",
  "action": "encrypt"
}
```

daca `key` e gol, se genereaza automat.

**response:**
```json
{
  "result": "base64_ciphertext",
  "key": "base64_key",
  "iv": "base64_iv",
  "keyLength": 256
}
```

**request pentru decriptare:**
```json
{
  "message": "base64_iv:base64_ciphertext",
  "key": "base64_key",
  "action": "decrypt"
}
```

### post /api/hash

calculeaza hash sha-256.

**request:**
```json
{
  "message": "text de hasurat",
  "algorithm": "sha256"
}
```

**response:**
```json
{
  "hash": "64_caractere_hex",
  "algorithm": "sha256",
  "length": 256
}
```

### post /api/xor-analysis

demonstratie pentru pericolul reutilizarii cheii otp.

**request:**
```json
{
  "ciphertext1": "hex_ciphertext_1",
  "ciphertext2": "hex_ciphertext_2"
}
```

**response:**
```json
{
  "xorResult": "hex_xor_result",
  "explanation": "explicatie..."
}
```

## implementare algoritmi

### one-time pad (otp)

```go
// functia principala pentru xor
func xorEncryptDecrypt(message, key []byte) []byte {
    result := make([]byte, len(message))
    for i := 0; i < len(message); i++ {
        result[i] = message[i] ^ key[i]
    }
    return result
}

// generare cheie cu crypto/rand (securizat)
func generateKey(length int) ([]byte, error) {
    key := make([]byte, length)
    _, err := rand.Read(key)
    if err != nil {
        return nil, err
    }
    return key, nil
}
```

**nota importanta:** folosim `crypto/rand` nu `math/rand` pentru ca `math/rand` nu e criptografic securizat!

### caesar cipher

```go
func caesarEncrypt(message string, shift int) string {
    shift = shift % 26
    if shift < 0 {
        shift += 26
    }

    result := make([]byte, len(message))
    for i, char := range message {
        if char >= 'A' && char <= 'Z' {
            result[i] = byte('A' + (int(char-'A')+shift)%26)
        } else if char >= 'a' && char <= 'z' {
            result[i] = byte('a' + (int(char-'a')+shift)%26)
        } else {
            result[i] = byte(char)
        }
    }
    return string(result)
}
```

### aes-256

folosim aes in mod cbc (cipher block chaining):

```go
func aesEncrypt(plaintext []byte, key []byte) (ciphertext, iv []byte, err error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, nil, err
    }

    // pkcs7 padding
    padding := aes.BlockSize - len(plaintext)%aes.BlockSize
    padtext := make([]byte, len(plaintext)+padding)
    copy(padtext, plaintext)
    for i := len(plaintext); i < len(padtext); i++ {
        padtext[i] = byte(padding)
    }

    ciphertext = make([]byte, len(padtext))
    iv = make([]byte, aes.BlockSize)
    if _, err := io.ReadFull(rand.Reader, iv); err != nil {
        return nil, nil, err
    }

    mode := cipher.NewCBCEncrypter(block, iv)
    mode.CryptBlocks(ciphertext, padtext)

    return ciphertext, iv, nil
}
```

## exemple de utilizare

### cu curl

```bash
# criptare otp
curl -X POST http://localhost:8080/api/otp \
  -H "Content-Type: application/json" \
  -d '{"message": "salut", "action": "encrypt"}'

# caesar cu shift 3
curl -X POST http://localhost:8080/api/caesar \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "shift": 3, "action": "encrypt"}'

# hash sha256
curl -X POST http://localhost:8080/api/hash \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "algorithm": "sha256"}'
```

### cu javascript (fetch)

```javascript
// criptare otp
const response = await fetch('/api/otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'mesaj secret',
    action: 'encrypt'
  })
})
const data = await response.json()
console.log('ciphertext:', data.result)
console.log('key:', data.key)
```

## gestionarea erorilor

toate endpoint-urile returneaza erori in format json:

```json
{
  "error": "mesaj de eroare"
}
```

coduri http folosite:
- **200** - succes
- **400** - bad request (date invalide)
- **405** - method not allowed (metoda http gresita)
- **500** - internal server error

## cors

serverul permite cors pentru toate originile (pentru development):

```go
func enableCORS(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
```

**nota:** in productie ar trebui sa restrictionam originile permise!

## securitate

cateva aspecte de securitate de retinut:

1. **generare chei** - folosim `crypto/rand` care e criptografic securizat
2. **aes** - folosim modul cbc cu iv random pentru fiecare criptare
3. **padding** - folosim pkcs7 care e standardul
4. **validare input** - verificam lungimile si formatele

ce **nu** facem (dar ar trebui in productie):
- rate limiting
- autentificare
- logging securizat
- https (in dev folosim http)
