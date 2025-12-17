package main

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

// xorEncryptDecrypt aplică XOR între fiecare caracter al mesajului și cheia corespunzătoare.
func xorEncryptDecrypt(message, key []byte) []byte {
	result := make([]byte, len(message))
	for i := 0; i < len(message); i++ {
		result[i] = message[i] ^ key[i]
	}
	return result
}

// generateKey creează o cheie aleatorie de aceeași lungime ca mesajul.
func generateKey(length int) []byte {
	key := make([]byte, length)
	_, err := rand.Read(key)
	if err != nil {
		panic(err)
	}
	return key
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	var lastEncrypted, lastKey []byte

	for {
		fmt.Println("\n=== Sistem de criptare One-Time Pad (OTP) ===")
		fmt.Println("1. Criptare mesaj (automat)")
		fmt.Println("2. Decriptare ultimul mesaj (automat)")
		fmt.Println("3. Decriptare manuală (introduci mesajul și cheia)")
		fmt.Println("4. Ieșire")
		fmt.Print("Alege o opțiune: ")

		var option int
		fmt.Scanln(&option)

		switch option {
		case 1:
			fmt.Print("Introdu mesajul de criptat: ")
			text, _ := reader.ReadString('\n')
			text = strings.TrimSpace(text)

			key := generateKey(len(text))
			encrypted := xorEncryptDecrypt([]byte(text), key)

			lastEncrypted = encrypted
			lastKey = key

			fmt.Println("Mesaj criptat (hex):", hex.EncodeToString(encrypted))
			fmt.Println("Cheia este generată intern și poate fi folosită pentru decriptare automată.")
		case 2:
			if lastEncrypted == nil || lastKey == nil {
				fmt.Println("Nu există mesaj criptat anterior!")
				continue
			}
			decrypted := xorEncryptDecrypt(lastEncrypted, lastKey)
			fmt.Println("Mesaj decriptat:", string(decrypted))
		case 3:
			fmt.Print("Introdu mesajul criptat (hex): ")
			encHex, _ := reader.ReadString('\n')
			encHex = strings.TrimSpace(encHex)
			encrypted, err := hex.DecodeString(encHex)
			if err != nil {
				fmt.Println("Hex invalid!")
				continue
			}

			fmt.Print("Introdu cheia (hex): ")
			keyHex, _ := reader.ReadString('\n')
			keyHex = strings.TrimSpace(keyHex)
			key, err := hex.DecodeString(keyHex)
			if err != nil || len(key) != len(encrypted) {
				fmt.Println("Cheie invalidă sau de lungime diferită!")
				continue
			}

			decrypted := xorEncryptDecrypt(encrypted, key)
			fmt.Println("Mesaj decriptat:", string(decrypted))
		case 4:
			fmt.Println("La revedere!")
			return
		default:
			fmt.Println("Opțiune invalidă!")
		}
	}
}
