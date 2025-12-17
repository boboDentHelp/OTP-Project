// serviciu pentru comunicarea cu backend-ul
// aici avem toate functiile care fac request-uri la api

// url-ul de baza pentru api (in dev e proxy prin vite)
const API_BASE = '/api'

// functie generica pentru a face request-uri post
// am facut-o separata ca sa nu repet codul peste tot
async function postRequest(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    // parsam raspunsul ca json
    const result = await response.json()
    return result
  } catch (error) {
    // daca e eroare de retea sau ceva, returnam un obiect cu eroare
    console.error('eroare la request:', error)
    return {
      error: 'nu s-a putut conecta la server. verifica daca backend-ul ruleaza.'
    }
  }
}

// functii pentru one-time pad
export async function otpEncrypt(message) {
  // trimitem mesajul si actiunea de criptare
  return postRequest('/otp', {
    message,
    action: 'encrypt'
  })
}

export async function otpDecrypt(message, key) {
  // pentru decriptare avem nevoie si de cheie
  return postRequest('/otp', {
    message,
    key,
    action: 'decrypt'
  })
}

// analiza xor pentru demonstratia cu reutilizarea cheii
export async function analyzeXOR(ciphertext1, ciphertext2) {
  return postRequest('/xor-analysis', {
    ciphertext1,
    ciphertext2
  })
}

// functii pentru cifrul caesar
export async function caesarEncrypt(message, shift) {
  return postRequest('/caesar', {
    message,
    shift: parseInt(shift),
    action: 'encrypt'
  })
}

export async function caesarDecrypt(message, shift) {
  return postRequest('/caesar', {
    message,
    shift: parseInt(shift),
    action: 'decrypt'
  })
}

// functii pentru cifrul vigenere
export async function vigenereEncrypt(message, key) {
  return postRequest('/vigenere', {
    message,
    key,
    action: 'encrypt'
  })
}

export async function vigenereDecrypt(message, key) {
  return postRequest('/vigenere', {
    message,
    key,
    action: 'decrypt'
  })
}

// functii pentru aes
export async function aesEncrypt(message, key = '') {
  return postRequest('/aes', {
    message,
    key,
    action: 'encrypt'
  })
}

export async function aesDecrypt(message, key) {
  return postRequest('/aes', {
    message,
    key,
    action: 'decrypt'
  })
}

// functie pentru hash sha256
export async function hashSHA256(message) {
  return postRequest('/hash', {
    message,
    algorithm: 'sha256'
  })
}
