package main

// serverul go pentru aplicatia de criptografie
// ofera api rest pentru diferiti algoritmi criptografici

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

// ==================== otp (one-time pad) ====================

// structura pentru requestul otp
type OTPRequest struct {
	Message string `json:"message"`
	Key     string `json:"key,omitempty"`
	Action  string `json:"action"` // "encrypt" sau "decrypt"
}

// structura pentru raspunsul otp
type OTPResponse struct {
	Result  string `json:"result"`
	Key     string `json:"key,omitempty"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// functia care face xor intre mesaj si cheie
// e simpla dar asta e tot ce face otp
func xorEncryptDecrypt(message, key []byte) []byte {
	result := make([]byte, len(message))
	for i := 0; i < len(message); i++ {
		result[i] = message[i] ^ key[i]
	}
	return result
}

// genereaza o cheie aleatorie securizata
// important: folosim crypto/rand nu math/rand!!
func generateKey(length int) ([]byte, error) {
	key := make([]byte, length)
	_, err := rand.Read(key)
	if err != nil {
		return nil, err
	}
	return key, nil
}

// handler pentru endpoint-ul otp
func handleOTP(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req OTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "request invalid")
		return
	}

	var response OTPResponse

	switch req.Action {
	case "encrypt":
		// convertim mesajul in bytes
		messageBytes := []byte(req.Message)
		// generam cheie de aceeasi lungime
		key, err := generateKey(len(messageBytes))
		if err != nil {
			sendJSONError(w, "nu am putut genera cheia")
			return
		}
		// facem xor si gata
		encrypted := xorEncryptDecrypt(messageBytes, key)
		response = OTPResponse{
			Result: hex.EncodeToString(encrypted),
			Key:    hex.EncodeToString(key),
		}

	case "decrypt":
		// decodam din hex
		encrypted, err := hex.DecodeString(req.Message)
		if err != nil {
			sendJSONError(w, "mesaj hex invalid")
			return
		}
		key, err := hex.DecodeString(req.Key)
		if err != nil {
			sendJSONError(w, "cheie hex invalida")
			return
		}
		// verificam lungimile
		if len(key) != len(encrypted) {
			sendJSONError(w, "lungimea cheii trebuie sa fie egala cu lungimea mesajului")
			return
		}
		// facem xor pentru decriptare (e acelasi lucru)
		decrypted := xorEncryptDecrypt(encrypted, key)
		response = OTPResponse{
			Result:  string(decrypted),
			Message: "decriptare reusita",
		}

	default:
		sendJSONError(w, "actiune invalida. foloseste 'encrypt' sau 'decrypt'")
		return
	}

	sendJSON(w, response)
}

// ==================== cifrul caesar ====================

type CaesarRequest struct {
	Message string `json:"message"`
	Shift   int    `json:"shift"`
	Action  string `json:"action"`
}

type CaesarResponse struct {
	Result string `json:"result"`
	Shift  int    `json:"shift"`
	Error  string `json:"error,omitempty"`
}

// criptare caesar - deplasam fiecare litera cu shift pozitii
func caesarEncrypt(message string, shift int) string {
	// normalizam shift-ul sa fie intre 0 si 25
	shift = shift % 26
	if shift < 0 {
		shift += 26
	}

	result := make([]byte, len(message))
	for i, char := range message {
		if char >= 'A' && char <= 'Z' {
			// litera mare
			result[i] = byte('A' + (int(char-'A')+shift)%26)
		} else if char >= 'a' && char <= 'z' {
			// litera mica
			result[i] = byte('a' + (int(char-'a')+shift)%26)
		} else {
			// alte caractere raman neschimbate
			result[i] = byte(char)
		}
	}
	return string(result)
}

// decriptare caesar - deplasam in sens invers
func caesarDecrypt(message string, shift int) string {
	return caesarEncrypt(message, -shift)
}

func handleCaesar(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CaesarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "request invalid")
		return
	}

	var result string
	switch req.Action {
	case "encrypt":
		result = caesarEncrypt(req.Message, req.Shift)
	case "decrypt":
		result = caesarDecrypt(req.Message, req.Shift)
	default:
		sendJSONError(w, "actiune invalida")
		return
	}

	sendJSON(w, CaesarResponse{Result: result, Shift: req.Shift})
}

// ==================== cifrul vigenere ====================

type VigenereRequest struct {
	Message string `json:"message"`
	Key     string `json:"key"`
	Action  string `json:"action"`
}

type VigenereResponse struct {
	Result string `json:"result"`
	Key    string `json:"key"`
	Error  string `json:"error,omitempty"`
}

// criptare vigenere - ca caesar dar cu cheie variabila
func vigenereEncrypt(message, key string) string {
	key = strings.ToUpper(key)
	result := make([]byte, len(message))
	keyIndex := 0

	for i, char := range message {
		if char >= 'A' && char <= 'Z' {
			// calculam shift-ul din litera cheii
			shift := int(key[keyIndex%len(key)] - 'A')
			result[i] = byte('A' + (int(char-'A')+shift)%26)
			keyIndex++
		} else if char >= 'a' && char <= 'z' {
			shift := int(key[keyIndex%len(key)] - 'A')
			result[i] = byte('a' + (int(char-'a')+shift)%26)
			keyIndex++
		} else {
			// non-litere nu incrementeaza indexul cheii
			result[i] = byte(char)
		}
	}
	return string(result)
}

// decriptare vigenere - scadem shift-ul in loc sa-l adunam
func vigenereDecrypt(message, key string) string {
	key = strings.ToUpper(key)
	result := make([]byte, len(message))
	keyIndex := 0

	for i, char := range message {
		if char >= 'A' && char <= 'Z' {
			shift := int(key[keyIndex%len(key)] - 'A')
			result[i] = byte('A' + (int(char-'A')-shift+26)%26)
			keyIndex++
		} else if char >= 'a' && char <= 'z' {
			shift := int(key[keyIndex%len(key)] - 'A')
			result[i] = byte('a' + (int(char-'a')-shift+26)%26)
			keyIndex++
		} else {
			result[i] = byte(char)
		}
	}
	return string(result)
}

func handleVigenere(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req VigenereRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "request invalid")
		return
	}

	if req.Key == "" {
		sendJSONError(w, "cheia este obligatorie")
		return
	}

	var result string
	switch req.Action {
	case "encrypt":
		result = vigenereEncrypt(req.Message, req.Key)
	case "decrypt":
		result = vigenereDecrypt(req.Message, req.Key)
	default:
		sendJSONError(w, "actiune invalida")
		return
	}

	sendJSON(w, VigenereResponse{Result: result, Key: req.Key})
}

// ==================== criptare aes ====================

type AESRequest struct {
	Message string `json:"message"`
	Key     string `json:"key,omitempty"` // 16, 24, sau 32 bytes pentru aes-128, aes-192, aes-256
	Action  string `json:"action"`
}

type AESResponse struct {
	Result    string `json:"result"`
	Key       string `json:"key,omitempty"`
	IV        string `json:"iv,omitempty"`
	KeyLength int    `json:"keyLength,omitempty"`
	Error     string `json:"error,omitempty"`
}

// criptare aes in mod cbc
// returneaza ciphertext, iv si eroare
func aesEncrypt(plaintext []byte, key []byte) (ciphertext, iv []byte, err error) {
	// cream cipher-ul aes
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, nil, err
	}

	// pkcs7 padding - adaugam bytes pana avem multiplu de blocksize
	padding := aes.BlockSize - len(plaintext)%aes.BlockSize
	padtext := make([]byte, len(plaintext)+padding)
	copy(padtext, plaintext)
	for i := len(plaintext); i < len(padtext); i++ {
		padtext[i] = byte(padding)
	}

	// alocam spatiu pentru ciphertext si iv
	ciphertext = make([]byte, len(padtext))
	iv = make([]byte, aes.BlockSize)
	// generam iv random
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, nil, err
	}

	// criptam in mod cbc
	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(ciphertext, padtext)

	return ciphertext, iv, nil
}

// decriptare aes
func aesDecrypt(ciphertext, key, iv []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// verificam ca ciphertext-ul e multiplu de blocksize
	if len(ciphertext)%aes.BlockSize != 0 {
		return nil, fmt.Errorf("ciphertext nu e multiplu de blocksize")
	}

	plaintext := make([]byte, len(ciphertext))
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(plaintext, ciphertext)

	// scoatem pkcs7 padding
	padding := int(plaintext[len(plaintext)-1])
	if padding > aes.BlockSize || padding == 0 {
		return nil, fmt.Errorf("padding invalid")
	}

	return plaintext[:len(plaintext)-padding], nil
}

func handleAES(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AESRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "request invalid")
		return
	}

	switch req.Action {
	case "encrypt":
		// generam cheie de 256 biti daca nu e data
		var key []byte
		if req.Key == "" {
			key = make([]byte, 32) // aes-256
			if _, err := rand.Read(key); err != nil {
				sendJSONError(w, "nu am putut genera cheia")
				return
			}
		} else {
			// derivam cheie din parola cu sha-256
			hash := sha256.Sum256([]byte(req.Key))
			key = hash[:]
		}

		ciphertext, iv, err := aesEncrypt([]byte(req.Message), key)
		if err != nil {
			sendJSONError(w, "criptare esuata: "+err.Error())
			return
		}

		sendJSON(w, AESResponse{
			Result:    base64.StdEncoding.EncodeToString(ciphertext),
			Key:       base64.StdEncoding.EncodeToString(key),
			IV:        base64.StdEncoding.EncodeToString(iv),
			KeyLength: len(key) * 8,
		})

	case "decrypt":
		key, err := base64.StdEncoding.DecodeString(req.Key)
		if err != nil {
			// poate e parola, derivam cheie
			hash := sha256.Sum256([]byte(req.Key))
			key = hash[:]
		}

		// extragem iv si ciphertext (format: iv:ciphertext)
		parts := strings.Split(req.Message, ":")
		var ciphertext, iv []byte

		if len(parts) == 2 {
			iv, err = base64.StdEncoding.DecodeString(parts[0])
			if err != nil {
				sendJSONError(w, "format iv invalid")
				return
			}
			ciphertext, err = base64.StdEncoding.DecodeString(parts[1])
			if err != nil {
				sendJSONError(w, "format ciphertext invalid")
				return
			}
		} else {
			sendJSONError(w, "formatul mesajului trebuie sa fie 'iv:ciphertext' in base64")
			return
		}

		plaintext, err := aesDecrypt(ciphertext, key, iv)
		if err != nil {
			sendJSONError(w, "decriptare esuata: "+err.Error())
			return
		}

		sendJSON(w, AESResponse{
			Result: string(plaintext),
		})

	default:
		sendJSONError(w, "actiune invalida")
	}
}

// ==================== functii hash ====================

type HashRequest struct {
	Message   string `json:"message"`
	Algorithm string `json:"algorithm"` // "sha256"
}

type HashResponse struct {
	Hash      string `json:"hash"`
	Algorithm string `json:"algorithm"`
	Length    int    `json:"length"`
	Error     string `json:"error,omitempty"`
}

func handleHash(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req HashRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "request invalid")
		return
	}

	var hash string
	switch req.Algorithm {
	case "sha256", "":
		// calculam hash sha256
		h := sha256.Sum256([]byte(req.Message))
		hash = hex.EncodeToString(h[:])
	default:
		sendJSONError(w, "algoritm nesuportat. foloseste 'sha256'")
		return
	}

	sendJSON(w, HashResponse{
		Hash:      hash,
		Algorithm: req.Algorithm,
		Length:    len(hash) * 4, // lungime in biti
	})
}

// ==================== analiza xor (educational) ====================

// demonstratie pentru ce se intampla cand refolosesti cheia otp

type XORAnalysisRequest struct {
	Ciphertext1 string `json:"ciphertext1"`
	Ciphertext2 string `json:"ciphertext2"`
}

type XORAnalysisResponse struct {
	XORResult   string `json:"xorResult"`
	Explanation string `json:"explanation"`
	Error       string `json:"error,omitempty"`
}

func handleXORAnalysis(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req XORAnalysisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "request invalid")
		return
	}

	// decodam cele doua ciphertexturi
	c1, err := hex.DecodeString(req.Ciphertext1)
	if err != nil {
		sendJSONError(w, "hex invalid pentru ciphertext1")
		return
	}

	c2, err := hex.DecodeString(req.Ciphertext2)
	if err != nil {
		sendJSONError(w, "hex invalid pentru ciphertext2")
		return
	}

	// luam lungimea minima
	minLen := len(c1)
	if len(c2) < minLen {
		minLen = len(c2)
	}

	// facem xor intre ele
	xorResult := make([]byte, minLen)
	for i := 0; i < minLen; i++ {
		xorResult[i] = c1[i] ^ c2[i]
	}

	sendJSON(w, XORAnalysisResponse{
		XORResult: hex.EncodeToString(xorResult),
		Explanation: "cand doua ciphertexturi otp criptate cu aceeasi cheie sunt xor-ate, " +
			"rezultatul e xor-ul celor doua plaintexturi: c1 xor c2 = (m1 xor k) xor (m2 xor k) = m1 xor m2. " +
			"asta demonstreaza de ce reutilizarea cheii strica securitatea otp.",
	})
}

// ==================== functii utilitare ====================

// activeaza cors pentru toate originile (doar pentru development!)
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// trimite raspuns json
func sendJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// trimite eroare json
func sendJSONError(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// ==================== main ====================

func main() {
	// inregistram endpoint-urile api
	http.HandleFunc("/api/otp", handleOTP)
	http.HandleFunc("/api/caesar", handleCaesar)
	http.HandleFunc("/api/vigenere", handleVigenere)
	http.HandleFunc("/api/aes", handleAES)
	http.HandleFunc("/api/hash", handleHash)
	http.HandleFunc("/api/xor-analysis", handleXORAnalysis)

	// servim fisierele statice din frontend
	fs := http.FileServer(http.Dir("../frontend"))
	http.Handle("/", fs)

	port := ":8080"
	fmt.Printf("🔐 server criptografie pornit pe http://localhost%s\n", port)
	fmt.Println("endpoint-uri disponibile:")
	fmt.Println("  POST /api/otp       - criptare/decriptare one-time pad")
	fmt.Println("  POST /api/caesar    - cifrul caesar")
	fmt.Println("  POST /api/vigenere  - cifrul vigenère")
	fmt.Println("  POST /api/aes       - criptare aes-256")
	fmt.Println("  POST /api/hash      - hash sha-256")
	fmt.Println("  POST /api/xor-analysis - demonstratie xor")

	log.Fatal(http.ListenAndServe(port, nil))
}
