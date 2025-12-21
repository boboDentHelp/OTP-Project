# nota despre backend

## aplicatia actuala nu foloseste backend

simulatorul otp functioneaza complet **client-side** in browser:

- generarea cheii se face cu `crypto.getRandomValues()` (web crypto api)
- criptarea/decriptarea xor se face in javascript
- nu e nevoie de server

## de ce client-side?

1. **simplitate** - nu e nevoie de comunicare cu serverul
2. **securitate** - cheia nu paraseste browser-ul
3. **performanta** - operatiile sunt instant
4. **offline** - functioneaza fara internet (dupa ce se incarca)

## echivalente

| browser (javascript) | go |
|---------------------|-----|
| `crypto.getRandomValues()` | `crypto/rand` |
| `TextEncoder/TextDecoder` | `[]byte` conversions |
| `^` (xor operator) | `^` (xor operator) |

## daca vrei sa adaugi backend

daca ai nevoie de backend pentru alte cerinte, poti folosi:

### go server minimal

```go
package main

import (
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "net/http"
)

type OTPRequest struct {
    Message string `json:"message"`
}

type OTPResponse struct {
    Original  string `json:"original"`
    Key       string `json:"key"`
    Encrypted string `json:"encrypted"`
}

func handleOTP(w http.ResponseWriter, r *http.Request) {
    var req OTPRequest
    json.NewDecoder(r.Body).Decode(&req)

    message := []byte(req.Message)
    key := make([]byte, len(message))
    rand.Read(key)

    encrypted := make([]byte, len(message))
    for i := range message {
        encrypted[i] = message[i] ^ key[i]
    }

    resp := OTPResponse{
        Original:  req.Message,
        Key:       hex.EncodeToString(key),
        Encrypted: hex.EncodeToString(encrypted),
    }

    json.NewEncoder(w).Encode(resp)
}

func main() {
    http.HandleFunc("/api/otp", handleOTP)
    http.ListenAndServe(":8080", nil)
}
```

dar pentru proiectul curent, **nu e necesar** - totul merge din browser.
