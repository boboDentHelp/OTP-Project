package main

// server go pentru simulare otp
// foloseste crypto/rand pentru generare cheie securizata

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// structura pentru request otp
type OTPRequest struct {
	Message string `json:"message"`
}

// structura pentru raspuns otp - contine tot ce cere tema
type OTPResponse struct {
	// mesaj original
	OriginalText  string `json:"originalText"`
	OriginalASCII string `json:"originalAscii"`
	OriginalHex   string `json:"originalHex"`

	// cheie generata cu crypto/rand
	KeyHex string `json:"keyHex"`

	// mesaj criptat
	EncryptedHex string `json:"encryptedHex"`

	// mesaj decriptat (pentru verificare)
	DecryptedText  string `json:"decryptedText"`
	DecryptedASCII string `json:"decryptedAscii"`
	DecryptedHex   string `json:"decryptedHex"`

	// verificare ca decriptarea e corecta
	IsMatch bool   `json:"isMatch"`
	Error   string `json:"error,omitempty"`
}

// xor intre doua array-uri de bytes
// e simplu dar asta e tot ce face otp
func xorBytes(a, b []byte) []byte {
	result := make([]byte, len(a))
	for i := 0; i < len(a); i++ {
		result[i] = a[i] ^ b[i]
	}
	return result
}

// genereaza cheie aleatorie securizata folosind crypto/rand
// asta e csprng - cryptographically secure pseudo-random number generator
func generateKey(length int) ([]byte, error) {
	key := make([]byte, length)
	_, err := rand.Read(key)
	if err != nil {
		return nil, err
	}
	return key, nil
}

// converteste bytes la coduri ascii separate prin spatiu
func bytesToASCII(b []byte) string {
	result := ""
	for i, byte := range b {
		if i > 0 {
			result += " "
		}
		result += fmt.Sprintf("%d", byte)
	}
	return result
}

// converteste bytes la hex cu spatii intre bytes
func bytesToHexSpaced(b []byte) string {
	result := ""
	for i, byte := range b {
		if i > 0 {
			result += " "
		}
		result += fmt.Sprintf("%02X", byte)
	}
	return result
}

// handler principal pentru otp
func handleOTP(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	// handle preflight
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req OTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendError(w, "request invalid")
		return
	}

	if req.Message == "" {
		sendError(w, "mesajul nu poate fi gol")
		return
	}

	// 1. convertim mesajul la bytes
	messageBytes := []byte(req.Message)

	// 2. generam cheie aleatorie de aceeasi lungime cu crypto/rand
	keyBytes, err := generateKey(len(messageBytes))
	if err != nil {
		sendError(w, "nu am putut genera cheia: "+err.Error())
		return
	}

	// 3. criptam cu xor
	encryptedBytes := xorBytes(messageBytes, keyBytes)

	// 4. decriptam (pentru verificare) - xor cu aceeasi cheie
	decryptedBytes := xorBytes(encryptedBytes, keyBytes)
	decryptedText := string(decryptedBytes)

	// 5. verificam ca decriptarea e identica cu originalul
	isMatch := decryptedText == req.Message

	// 6. construim raspunsul cu toate formatele cerute
	response := OTPResponse{
		// mesaj original in toate formatele
		OriginalText:  req.Message,
		OriginalASCII: bytesToASCII(messageBytes),
		OriginalHex:   bytesToHexSpaced(messageBytes),

		// cheia in hex (generat cu crypto/rand)
		KeyHex: bytesToHexSpaced(keyBytes),

		// mesaj criptat in hex
		EncryptedHex: bytesToHexSpaced(encryptedBytes),

		// mesaj decriptat in toate formatele
		DecryptedText:  decryptedText,
		DecryptedASCII: bytesToASCII(decryptedBytes),
		DecryptedHex:   bytesToHexSpaced(decryptedBytes),

		// verificare
		IsMatch: isMatch,
	}

	sendJSON(w, response)
}

// activeaza cors (pentru development)
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// trimite raspuns json
func sendJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// trimite eroare json
func sendError(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(OTPResponse{Error: message})
}

func main() {
	// endpoint pentru otp
	http.HandleFunc("/api/otp", handleOTP)

	port := ":8080"
	fmt.Printf("server otp pornit pe http://localhost%s\n", port)
	fmt.Println("endpoint: POST /api/otp")
	fmt.Println("foloseste crypto/rand pentru generare cheie")

	log.Fatal(http.ListenAndServe(port, nil))
}
