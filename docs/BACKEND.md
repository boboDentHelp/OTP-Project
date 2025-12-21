# documentatie backend go - simulare otp

serverul go pentru simularea mecanismului one-time pad.

## cuprins

- [prezentare generala](#prezentare-generala)
- [pornire server](#pornire-server)
- [endpoint api](#endpoint-api)
- [implementare otp](#implementare-otp)
- [exemple curl](#exemple-curl)

## prezentare generala

backend-ul e scris in go si face toata criptarea otp:
- genereaza cheie aleatorie cu `crypto/rand` (csprng)
- face xor intre mesaj si cheie
- returneaza rezultatele in toate formatele cerute

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

serverul porneste pe portul 8080:
```
server otp pornit pe http://localhost:8080
endpoint: POST /api/otp
foloseste crypto/rand pentru generare cheie
```

## endpoint api

### POST /api/otp

criptare one-time pad cu generare cheie.

**request:**
```json
{
  "message": "mesajul de criptat"
}
```

**response:**
```json
{
  "originalText": "mesajul de criptat",
  "originalAscii": "109 101 115 97 106 117 108",
  "originalHex": "6D 65 73 61 6A 75 6C",

  "keyHex": "A7 3F 82 1B C9 D4 E5",

  "encryptedHex": "CA 5A F1 7A A3 A1 89",

  "decryptedText": "mesajul de criptat",
  "decryptedAscii": "109 101 115 97 106 117 108",
  "decryptedHex": "6D 65 73 61 6A 75 6C",

  "isMatch": true
}
```

## implementare otp

### structuri

```go
// request - doar mesajul
type OTPRequest struct {
    Message string `json:"message"`
}

// response - toate formatele cerute de tema
type OTPResponse struct {
    OriginalText  string `json:"originalText"`
    OriginalASCII string `json:"originalAscii"`
    OriginalHex   string `json:"originalHex"`

    KeyHex string `json:"keyHex"`

    EncryptedHex string `json:"encryptedHex"`

    DecryptedText  string `json:"decryptedText"`
    DecryptedASCII string `json:"decryptedAscii"`
    DecryptedHex   string `json:"decryptedHex"`

    IsMatch bool   `json:"isMatch"`
    Error   string `json:"error,omitempty"`
}
```

### generare cheie cu crypto/rand

```go
// genereaza cheie aleatorie securizata folosind crypto/rand
// asta e csprng - cryptographically secure pseudo-random number generator
func generateKey(length int) ([]byte, error) {
    key := make([]byte, length)
    _, err := rand.Read(key)  // crypto/rand.Read
    if err != nil {
        return nil, err
    }
    return key, nil
}
```

**nota importanta:** folosim `crypto/rand` nu `math/rand`!
- `crypto/rand` e criptografic securizat (csprng)
- `math/rand` nu e securizat, e previzibil

### operatia xor

```go
// xor intre doua array-uri de bytes
// e simplu dar asta e tot ce face otp
func xorBytes(a, b []byte) []byte {
    result := make([]byte, len(a))
    for i := 0; i < len(a); i++ {
        result[i] = a[i] ^ b[i]
    }
    return result
}
```

### flow complet

```go
func handleOTP(w http.ResponseWriter, r *http.Request) {
    // 1. citim mesajul
    var req OTPRequest
    json.NewDecoder(r.Body).Decode(&req)
    messageBytes := []byte(req.Message)

    // 2. generam cheie de aceeasi lungime cu crypto/rand
    keyBytes, _ := generateKey(len(messageBytes))

    // 3. criptam cu xor
    encryptedBytes := xorBytes(messageBytes, keyBytes)

    // 4. decriptam (pentru verificare)
    decryptedBytes := xorBytes(encryptedBytes, keyBytes)

    // 5. verificam ca decriptarea = original
    isMatch := string(decryptedBytes) == req.Message

    // 6. returnam toate formatele
    response := OTPResponse{
        OriginalText:  req.Message,
        OriginalASCII: bytesToASCII(messageBytes),
        OriginalHex:   bytesToHexSpaced(messageBytes),
        KeyHex:        bytesToHexSpaced(keyBytes),
        EncryptedHex:  bytesToHexSpaced(encryptedBytes),
        DecryptedText: string(decryptedBytes),
        // ...
        IsMatch: isMatch,
    }
    json.NewEncoder(w).Encode(response)
}
```

## exemple curl

```bash
# criptare otp
curl -X POST http://localhost:8080/api/otp \
  -H "Content-Type: application/json" \
  -d '{"message": "salut"}'

# raspuns:
# {
#   "originalText": "salut",
#   "originalAscii": "115 97 108 117 116",
#   "originalHex": "73 61 6C 75 74",
#   "keyHex": "A7 3F 82 1B C9",
#   "encryptedHex": "D4 5E EE 6E BD",
#   "decryptedText": "salut",
#   "decryptedAscii": "115 97 108 117 116",
#   "decryptedHex": "73 61 6C 75 74",
#   "isMatch": true
# }
```

## cors

serverul permite cors pentru development:

```go
func enableCORS(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
```

## note de securitate

1. **crypto/rand** e criptografic securizat (csprng)
2. cheia are exact lungimea mesajului (conditie otp)
3. verificam ca decriptarea e corecta
4. pentru productie ar trebui adaugat https si rate limiting
