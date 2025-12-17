package main

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

// ==================== OTP (One-Time Pad) ====================

// OTPRequest represents a request for OTP encryption/decryption
type OTPRequest struct {
	Message string `json:"message"`
	Key     string `json:"key,omitempty"`
	Action  string `json:"action"` // "encrypt" or "decrypt"
}

// OTPResponse represents the response from OTP operations
type OTPResponse struct {
	Result  string `json:"result"`
	Key     string `json:"key,omitempty"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// xorEncryptDecrypt applies XOR between message and key bytes
func xorEncryptDecrypt(message, key []byte) []byte {
	result := make([]byte, len(message))
	for i := 0; i < len(message); i++ {
		result[i] = message[i] ^ key[i]
	}
	return result
}

// generateKey creates a cryptographically secure random key
func generateKey(length int) ([]byte, error) {
	key := make([]byte, length)
	_, err := rand.Read(key)
	if err != nil {
		return nil, err
	}
	return key, nil
}

// handleOTP handles OTP encryption and decryption requests
func handleOTP(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req OTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body")
		return
	}

	var response OTPResponse

	switch req.Action {
	case "encrypt":
		messageBytes := []byte(req.Message)
		key, err := generateKey(len(messageBytes))
		if err != nil {
			sendJSONError(w, "Failed to generate key")
			return
		}
		encrypted := xorEncryptDecrypt(messageBytes, key)
		response = OTPResponse{
			Result: hex.EncodeToString(encrypted),
			Key:    hex.EncodeToString(key),
		}

	case "decrypt":
		encrypted, err := hex.DecodeString(req.Message)
		if err != nil {
			sendJSONError(w, "Invalid hex message")
			return
		}
		key, err := hex.DecodeString(req.Key)
		if err != nil {
			sendJSONError(w, "Invalid hex key")
			return
		}
		if len(key) != len(encrypted) {
			sendJSONError(w, "Key length must match message length")
			return
		}
		decrypted := xorEncryptDecrypt(encrypted, key)
		response = OTPResponse{
			Result:  string(decrypted),
			Message: "Decryption successful",
		}

	default:
		sendJSONError(w, "Invalid action. Use 'encrypt' or 'decrypt'")
		return
	}

	sendJSON(w, response)
}

// ==================== Caesar Cipher ====================

type CaesarRequest struct {
	Message string `json:"message"`
	Shift   int    `json:"shift"`
	Action  string `json:"action"`
}

type CaesarResponse struct {
	Result  string `json:"result"`
	Shift   int    `json:"shift"`
	Error   string `json:"error,omitempty"`
}

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

func caesarDecrypt(message string, shift int) string {
	return caesarEncrypt(message, -shift)
}

func handleCaesar(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CaesarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body")
		return
	}

	var result string
	switch req.Action {
	case "encrypt":
		result = caesarEncrypt(req.Message, req.Shift)
	case "decrypt":
		result = caesarDecrypt(req.Message, req.Shift)
	default:
		sendJSONError(w, "Invalid action")
		return
	}

	sendJSON(w, CaesarResponse{Result: result, Shift: req.Shift})
}

// ==================== Vigenère Cipher ====================

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

func vigenereEncrypt(message, key string) string {
	key = strings.ToUpper(key)
	result := make([]byte, len(message))
	keyIndex := 0

	for i, char := range message {
		if char >= 'A' && char <= 'Z' {
			shift := int(key[keyIndex%len(key)] - 'A')
			result[i] = byte('A' + (int(char-'A')+shift)%26)
			keyIndex++
		} else if char >= 'a' && char <= 'z' {
			shift := int(key[keyIndex%len(key)] - 'A')
			result[i] = byte('a' + (int(char-'a')+shift)%26)
			keyIndex++
		} else {
			result[i] = byte(char)
		}
	}
	return string(result)
}

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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req VigenereRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body")
		return
	}

	if req.Key == "" {
		sendJSONError(w, "Key is required")
		return
	}

	var result string
	switch req.Action {
	case "encrypt":
		result = vigenereEncrypt(req.Message, req.Key)
	case "decrypt":
		result = vigenereDecrypt(req.Message, req.Key)
	default:
		sendJSONError(w, "Invalid action")
		return
	}

	sendJSON(w, VigenereResponse{Result: result, Key: req.Key})
}

// ==================== AES Encryption ====================

type AESRequest struct {
	Message string `json:"message"`
	Key     string `json:"key,omitempty"` // 16, 24, or 32 bytes for AES-128, AES-192, AES-256
	Action  string `json:"action"`
}

type AESResponse struct {
	Result    string `json:"result"`
	Key       string `json:"key,omitempty"`
	IV        string `json:"iv,omitempty"`
	KeyLength int    `json:"keyLength,omitempty"`
	Error     string `json:"error,omitempty"`
}

func aesEncrypt(plaintext []byte, key []byte) (ciphertext, iv []byte, err error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, nil, err
	}

	// PKCS7 padding
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

func aesDecrypt(ciphertext, key, iv []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	if len(ciphertext)%aes.BlockSize != 0 {
		return nil, fmt.Errorf("ciphertext is not a multiple of block size")
	}

	plaintext := make([]byte, len(ciphertext))
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(plaintext, ciphertext)

	// Remove PKCS7 padding
	padding := int(plaintext[len(plaintext)-1])
	if padding > aes.BlockSize || padding == 0 {
		return nil, fmt.Errorf("invalid padding")
	}

	return plaintext[:len(plaintext)-padding], nil
}

func handleAES(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AESRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body")
		return
	}

	switch req.Action {
	case "encrypt":
		// Generate a 256-bit key if not provided
		var key []byte
		if req.Key == "" {
			key = make([]byte, 32) // AES-256
			if _, err := rand.Read(key); err != nil {
				sendJSONError(w, "Failed to generate key")
				return
			}
		} else {
			// Use SHA-256 to derive a key from the provided password
			hash := sha256.Sum256([]byte(req.Key))
			key = hash[:]
		}

		ciphertext, iv, err := aesEncrypt([]byte(req.Message), key)
		if err != nil {
			sendJSONError(w, "Encryption failed: "+err.Error())
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
			// Try to derive key from password
			hash := sha256.Sum256([]byte(req.Key))
			key = hash[:]
		}

		// Extract IV and ciphertext (IV is prepended or sent separately)
		parts := strings.Split(req.Message, ":")
		var ciphertext, iv []byte

		if len(parts) == 2 {
			iv, err = base64.StdEncoding.DecodeString(parts[0])
			if err != nil {
				sendJSONError(w, "Invalid IV format")
				return
			}
			ciphertext, err = base64.StdEncoding.DecodeString(parts[1])
			if err != nil {
				sendJSONError(w, "Invalid ciphertext format")
				return
			}
		} else {
			sendJSONError(w, "Message format should be 'IV:Ciphertext' in base64")
			return
		}

		plaintext, err := aesDecrypt(ciphertext, key, iv)
		if err != nil {
			sendJSONError(w, "Decryption failed: "+err.Error())
			return
		}

		sendJSON(w, AESResponse{
			Result: string(plaintext),
		})

	default:
		sendJSONError(w, "Invalid action")
	}
}

// ==================== Hash Functions ====================

type HashRequest struct {
	Message   string `json:"message"`
	Algorithm string `json:"algorithm"` // "sha256", "md5", etc.
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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req HashRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body")
		return
	}

	var hash string
	switch req.Algorithm {
	case "sha256", "":
		h := sha256.Sum256([]byte(req.Message))
		hash = hex.EncodeToString(h[:])
	default:
		sendJSONError(w, "Unsupported algorithm. Use 'sha256'")
		return
	}

	sendJSON(w, HashResponse{
		Hash:      hash,
		Algorithm: req.Algorithm,
		Length:    len(hash) * 4, // bits
	})
}

// ==================== XOR Analysis (Educational) ====================

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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req XORAnalysisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body")
		return
	}

	c1, err := hex.DecodeString(req.Ciphertext1)
	if err != nil {
		sendJSONError(w, "Invalid hex for ciphertext1")
		return
	}

	c2, err := hex.DecodeString(req.Ciphertext2)
	if err != nil {
		sendJSONError(w, "Invalid hex for ciphertext2")
		return
	}

	minLen := len(c1)
	if len(c2) < minLen {
		minLen = len(c2)
	}

	xorResult := make([]byte, minLen)
	for i := 0; i < minLen; i++ {
		xorResult[i] = c1[i] ^ c2[i]
	}

	sendJSON(w, XORAnalysisResponse{
		XORResult: hex.EncodeToString(xorResult),
		Explanation: "When two OTP ciphertexts encrypted with the same key are XORed, " +
			"the result is the XOR of the two plaintexts: C1 XOR C2 = (M1 XOR K) XOR (M2 XOR K) = M1 XOR M2. " +
			"This demonstrates why key reuse breaks OTP security.",
	})
}

// ==================== Utility Functions ====================

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func sendJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func sendJSONError(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// ==================== Main ====================

func main() {
	// API endpoints
	http.HandleFunc("/api/otp", handleOTP)
	http.HandleFunc("/api/caesar", handleCaesar)
	http.HandleFunc("/api/vigenere", handleVigenere)
	http.HandleFunc("/api/aes", handleAES)
	http.HandleFunc("/api/hash", handleHash)
	http.HandleFunc("/api/xor-analysis", handleXORAnalysis)

	// Serve static files
	fs := http.FileServer(http.Dir("../frontend"))
	http.Handle("/", fs)

	port := ":8080"
	fmt.Printf("🔐 Cryptography Demo Server starting on http://localhost%s\n", port)
	fmt.Println("Available endpoints:")
	fmt.Println("  POST /api/otp       - One-Time Pad encryption/decryption")
	fmt.Println("  POST /api/caesar    - Caesar cipher")
	fmt.Println("  POST /api/vigenere  - Vigenère cipher")
	fmt.Println("  POST /api/aes       - AES-256 encryption")
	fmt.Println("  POST /api/hash      - SHA-256 hashing")
	fmt.Println("  POST /api/xor-analysis - XOR analysis demonstration")

	log.Fatal(http.ListenAndServe(port, nil))
}
