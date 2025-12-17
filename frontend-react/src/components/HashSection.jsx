// sectiunea pentru functii hash (sha-256)
// include hashing in timp real si demonstratia efectului avalansa

import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalHash, useAvalancheDemo } from '../hooks/useCrypto'
import ResultBox from './common/ResultBox'

// componenta pentru demonstratia efectului avalansa
const AvalancheDemo = memo(function AvalancheDemo() {
  const [text1, setText1] = useState('hello world')
  const [text2, setText2] = useState('hello world!')
  const { comparison, compare, isComparing } = useAvalancheDemo()

  // comparam automat cand se schimba textele
  useEffect(() => {
    compare(text1, text2)
  }, [text1, text2, compare])

  // generam afisarea cu caractere diferite colorate
  const renderHashDiff = useCallback((hash1, hash2) => {
    if (!hash1 || !hash2) return null

    return hash1.split('').map((char, i) => {
      const isDiff = char !== hash2[i]
      return (
        <span key={i} className={isDiff ? 'hash-diff' : 'hash-same'}>
          {char}
        </span>
      )
    })
  }, [])

  return (
    <div className="crypto-card demo-card">
      <h3>🌊 demonstratie: efectul avalansa</h3>

      <div className="input-group">
        <label htmlFor="avalanche-text1">text 1</label>
        <input
          type="text"
          id="avalanche-text1"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="avalanche-text2">text 2 (schimba o litera)</label>
        <input
          type="text"
          id="avalanche-text2"
          value={text2}
          onChange={(e) => setText2(e.target.value)}
        />
      </div>

      {comparison && (
        <div className="avalanche-comparison">
          <div className="avalanche-hash">
            <span className="label">
              hash 1 ("{text1.substring(0, 20)}{text1.length > 20 ? '...' : ''}"):
            </span>
            <div className="hash">
              {renderHashDiff(comparison.hash1, comparison.hash2)}
            </div>
          </div>

          <div className="avalanche-hash">
            <span className="label">
              hash 2 ("{text2.substring(0, 20)}{text2.length > 20 ? '...' : ''}"):
            </span>
            <div className="hash">
              {renderHashDiff(comparison.hash2, comparison.hash1)}
            </div>
          </div>

          <div className="diff-stats">
            <div className="percentage">{comparison.diffPercentage}%</div>
            <p>din biti sunt diferiti ({comparison.diffBits} din {comparison.totalBits} biti)</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              caracterele rosii indica diferentele. ideal, ~50% din biti ar trebui sa difere (efectul avalansa).
            </p>
          </div>
        </div>
      )}
    </div>
  )
})

// lista cu proprietatile hash-urilor
const hashProperties = [
  { name: 'determinism', desc: 'acelasi input produce intotdeauna acelasi output' },
  { name: 'eficienta', desc: 'calculul hash-ului este rapid' },
  { name: 'rezistenta la preimage', desc: 'imposibil de gasit input-ul din hash' },
  { name: 'rezistenta la coliziuni', desc: 'imposibil de gasit doua inputuri diferite cu acelasi hash' },
  { name: 'efect avalansa', desc: 'o mica schimbare in input produce un hash complet diferit' }
]

function HashSection() {
  const [message, setMessage] = useState('')
  const { hash, calculateHash, isCalculating } = useLocalHash()

  // calculam hash-ul cand se schimba mesajul
  useEffect(() => {
    calculateHash(message)
  }, [message, calculateHash])

  return (
    <section id="hash" className="crypto-section">
      <div className="section-header">
        <h2>#️⃣ functii hash (sha-256)</h2>
        <span className="security-badge strong">one-way function</span>
      </div>

      <div className="section-description">
        <p>
          functiile hash transforma date de orice dimensiune intr-o amprenta de
          dimensiune fixa. sunt functii unidirectionale - este imposibil din punct
          de vedere computational sa obtii datele originale din hash. utilizari:
          verificarea integritatii, stocarea parolelor, semnaturi digitale.
        </p>
      </div>

      <div className="crypto-card">
        <div className="input-group">
          <label htmlFor="hash-message">text de hasurat</label>
          <textarea
            id="hash-message"
            placeholder="introdu textul..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <ResultBox
          label="sha-256 hash (64 caractere hex = 256 biti)"
          value={hash || 'introdu text pentru a vedea hash-ul...'}
          type="hash"
        />

        <div className="hash-properties" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            proprietatile functiilor hash criptografice:
          </h4>
          <ul style={{ listStyle: 'none' }}>
            {hashProperties.map((prop, i) => (
              <li key={i} style={{
                padding: '0.5rem 0',
                color: 'var(--text-secondary)',
                borderBottom: i < hashProperties.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <strong style={{ color: 'var(--primary-light)' }}>{prop.name}:</strong>{' '}
                {prop.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AvalancheDemo />
    </section>
  )
}

export default memo(HashSection)
