// ===== Configuration =====
const API_BASE = '/api';

// ===== Utility Functions =====
async function apiCall(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Eroare de conexiune la server. Asigurați-vă că serverul rulează.' };
    }
}

function displayResult(elementId, result, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = result;
    element.classList.toggle('error', isError);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copiat în clipboard!');
    });
}

function copyKey(elementId) {
    const element = document.getElementById(elementId);
    copyToClipboard(element.textContent);
}

// ===== OTP Functions =====
async function otpEncrypt() {
    const message = document.getElementById('otp-message').value;
    if (!message) {
        displayResult('otp-result', 'Introduceți un mesaj!', true);
        return;
    }

    const result = await apiCall('/otp', { message, action: 'encrypt' });

    if (result.error) {
        displayResult('otp-result', result.error, true);
        document.getElementById('otp-key-display').style.display = 'none';
    } else {
        displayResult('otp-result', result.result);
        document.getElementById('otp-generated-key').textContent = result.key;
        document.getElementById('otp-key-display').style.display = 'block';
    }
}

async function otpDecrypt() {
    const message = document.getElementById('otp-message').value;
    const key = document.getElementById('otp-key').value;

    if (!message || !key) {
        displayResult('otp-result', 'Introduceți mesajul criptat și cheia!', true);
        return;
    }

    const result = await apiCall('/otp', { message, key, action: 'decrypt' });

    if (result.error) {
        displayResult('otp-result', result.error, true);
    } else {
        displayResult('otp-result', result.result);
    }
    document.getElementById('otp-key-display').style.display = 'none';
}

async function analyzeXOR() {
    const c1 = document.getElementById('xor-cipher1').value;
    const c2 = document.getElementById('xor-cipher2').value;

    if (!c1 || !c2) {
        displayResult('xor-result', 'Introduceți ambele mesaje criptate!', true);
        return;
    }

    const result = await apiCall('/xor-analysis', { ciphertext1: c1, ciphertext2: c2 });

    if (result.error) {
        displayResult('xor-result', result.error, true);
    } else {
        document.getElementById('xor-result').innerHTML = `
            <strong>XOR Result (M1 ⊕ M2):</strong> ${result.xorResult}<br><br>
            <strong>Explicație:</strong> ${result.explanation}
        `;
    }
}

// ===== Caesar Functions =====
function caesarCipher(text, shift, encrypt = true) {
    shift = encrypt ? shift : -shift;
    shift = ((shift % 26) + 26) % 26;

    return text.split('').map(char => {
        if (char >= 'A' && char <= 'Z') {
            return String.fromCharCode((char.charCodeAt(0) - 65 + shift) % 26 + 65);
        } else if (char >= 'a' && char <= 'z') {
            return String.fromCharCode((char.charCodeAt(0) - 97 + shift) % 26 + 97);
        }
        return char;
    }).join('');
}

function caesarEncrypt() {
    const message = document.getElementById('caesar-message').value;
    const shift = parseInt(document.getElementById('caesar-shift').value) || 0;

    if (!message) {
        displayResult('caesar-result', 'Introduceți un mesaj!', true);
        return;
    }

    const result = caesarCipher(message, shift, true);
    displayResult('caesar-result', result);
    document.getElementById('caesar-brute-force').style.display = 'none';
}

function caesarDecrypt() {
    const message = document.getElementById('caesar-message').value;
    const shift = parseInt(document.getElementById('caesar-shift').value) || 0;

    if (!message) {
        displayResult('caesar-result', 'Introduceți un mesaj!', true);
        return;
    }

    const result = caesarCipher(message, shift, false);
    displayResult('caesar-result', result);
    document.getElementById('caesar-brute-force').style.display = 'none';
}

function caesarBruteForce() {
    const message = document.getElementById('caesar-message').value;

    if (!message) {
        displayResult('caesar-result', 'Introduceți un mesaj!', true);
        return;
    }

    let results = '<table style="width:100%; font-family: monospace;">';
    results += '<tr><th style="text-align:left">Deplasare</th><th style="text-align:left">Rezultat</th></tr>';

    for (let i = 0; i < 26; i++) {
        const decrypted = caesarCipher(message, i, false);
        results += `<tr><td style="color: var(--accent-color)">${i}</td><td>${decrypted}</td></tr>`;
    }
    results += '</table>';

    document.getElementById('caesar-all-results').innerHTML = results;
    document.getElementById('caesar-brute-force').style.display = 'block';
    displayResult('caesar-result', 'Vezi toate variantele mai jos:');
}

// Sync slider and input
document.getElementById('caesar-shift')?.addEventListener('input', function () {
    document.getElementById('caesar-shift-slider').value = this.value;
});

// ===== Vigenère Functions =====
function vigenereCipher(text, key, encrypt = true) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return text;

    let keyIndex = 0;
    return text.split('').map(char => {
        const isUpper = char >= 'A' && char <= 'Z';
        const isLower = char >= 'a' && char <= 'z';

        if (!isUpper && !isLower) return char;

        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyCode = key[keyIndex % key.length].charCodeAt(0) - 65;
        keyIndex++;

        let newCode;
        if (encrypt) {
            newCode = (charCode + keyCode) % 26;
        } else {
            newCode = (charCode - keyCode + 26) % 26;
        }

        const newChar = String.fromCharCode(newCode + 65);
        return isLower ? newChar.toLowerCase() : newChar;
    }).join('');
}

function vigenereEncrypt() {
    const message = document.getElementById('vigenere-message').value;
    const key = document.getElementById('vigenere-key').value;

    if (!message || !key) {
        displayResult('vigenere-result', 'Introduceți mesajul și cheia!', true);
        return;
    }

    const result = vigenereCipher(message, key, true);
    displayResult('vigenere-result', result);
}

function vigenereDecrypt() {
    const message = document.getElementById('vigenere-message').value;
    const key = document.getElementById('vigenere-key').value;

    if (!message || !key) {
        displayResult('vigenere-result', 'Introduceți mesajul și cheia!', true);
        return;
    }

    const result = vigenereCipher(message, key, false);
    displayResult('vigenere-result', result);
}

// Generate Vigenère Table
function generateVigenereTable() {
    const container = document.getElementById('vigenere-table');
    if (!container) return;

    let html = '<table class="vigenere-table"><tr><th></th>';

    // Header row
    for (let i = 0; i < 26; i++) {
        html += `<th>${String.fromCharCode(65 + i)}</th>`;
    }
    html += '</tr>';

    // Data rows
    for (let i = 0; i < 26; i++) {
        html += `<tr><th>${String.fromCharCode(65 + i)}</th>`;
        for (let j = 0; j < 26; j++) {
            const char = String.fromCharCode(65 + (i + j) % 26);
            html += `<td>${char}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';

    container.innerHTML = html;
}

// ===== AES Functions =====
async function aesEncrypt() {
    const message = document.getElementById('aes-message').value;
    const key = document.getElementById('aes-key').value;

    if (!message) {
        displayResult('aes-result', 'Introduceți un mesaj!', true);
        return;
    }

    const result = await apiCall('/aes', { message, key, action: 'encrypt' });

    if (result.error) {
        displayResult('aes-result', result.error, true);
        document.getElementById('aes-details').style.display = 'none';
    } else {
        displayResult('aes-result', `${result.iv}:${result.result}`);
        document.getElementById('aes-details-content').innerHTML = `
            <strong>Algoritm:</strong> AES-${result.keyLength} CBC<br>
            <strong>IV (Base64):</strong> ${result.iv}<br>
            <strong>Cheie (Base64):</strong> ${result.key}<br>
            <strong>Ciphertext (Base64):</strong> ${result.result}<br><br>
            <em>Format pentru decriptare: IV:Ciphertext</em>
        `;
        document.getElementById('aes-details').style.display = 'block';
    }
}

async function aesDecrypt() {
    const message = document.getElementById('aes-message').value;
    const key = document.getElementById('aes-key').value;

    if (!message || !key) {
        displayResult('aes-result', 'Introduceți mesajul criptat (format IV:Ciphertext) și cheia!', true);
        return;
    }

    const result = await apiCall('/aes', { message, key, action: 'decrypt' });

    if (result.error) {
        displayResult('aes-result', result.error, true);
    } else {
        displayResult('aes-result', result.result);
    }
    document.getElementById('aes-details').style.display = 'none';
}

// ===== Hash Functions =====
async function calculateHash(text) {
    // Use Web Crypto API for client-side hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function updateHash() {
    const message = document.getElementById('hash-message').value;
    const resultElement = document.getElementById('hash-result');

    if (!message) {
        resultElement.textContent = 'Introduceți text pentru a vedea hash-ul...';
        return;
    }

    const hash = await calculateHash(message);
    resultElement.textContent = hash;
}

async function demonstrateAvalanche() {
    const text1 = document.getElementById('avalanche-text1').value;
    const text2 = document.getElementById('avalanche-text2').value;
    const resultContainer = document.getElementById('avalanche-result');

    if (!text1 || !text2) {
        resultContainer.innerHTML = '<p style="color: var(--text-muted)">Introduceți text în ambele câmpuri...</p>';
        return;
    }

    const hash1 = await calculateHash(text1);
    const hash2 = await calculateHash(text2);

    // Calculate bit differences
    let diffBits = 0;
    let diffDisplay1 = '';
    let diffDisplay2 = '';

    for (let i = 0; i < hash1.length; i++) {
        const bits1 = parseInt(hash1[i], 16).toString(2).padStart(4, '0');
        const bits2 = parseInt(hash2[i], 16).toString(2).padStart(4, '0');

        for (let j = 0; j < 4; j++) {
            if (bits1[j] !== bits2[j]) diffBits++;
        }

        if (hash1[i] !== hash2[i]) {
            diffDisplay1 += `<span class="hash-diff">${hash1[i]}</span>`;
            diffDisplay2 += `<span class="hash-diff">${hash2[i]}</span>`;
        } else {
            diffDisplay1 += `<span class="hash-same">${hash1[i]}</span>`;
            diffDisplay2 += `<span class="hash-same">${hash2[i]}</span>`;
        }
    }

    const totalBits = 256;
    const diffPercentage = ((diffBits / totalBits) * 100).toFixed(1);

    resultContainer.innerHTML = `
        <div class="avalanche-hash">
            <span class="label">Hash 1 ("${text1.substring(0, 20)}${text1.length > 20 ? '...' : ''}"):</span>
            <div class="hash">${diffDisplay1}</div>
        </div>
        <div class="avalanche-hash">
            <span class="label">Hash 2 ("${text2.substring(0, 20)}${text2.length > 20 ? '...' : ''}"):</span>
            <div class="hash">${diffDisplay2}</div>
        </div>
        <div class="diff-stats">
            <div class="percentage">${diffPercentage}%</div>
            <p>din biți sunt diferiți (${diffBits} din ${totalBits} biți)</p>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">
                Caracterele roșii indică diferențele. Ideal, ~50% din biți ar trebui să difere (efectul avalanșă).
            </p>
        </div>
    `;
}

// ===== Navigation =====
function setupNavigation() {
    const sections = document.querySelectorAll('.crypto-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    generateVigenereTable();
    setupNavigation();
    demonstrateAvalanche();

    // Set up hash live update
    const hashInput = document.getElementById('hash-message');
    if (hashInput) {
        hashInput.addEventListener('input', updateHash);
    }
});
