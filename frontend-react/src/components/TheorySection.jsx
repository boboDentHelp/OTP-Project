// sectiunea cu teoria din spatele algoritmilor
// aici avem formulele si comparatiile

import { memo, useMemo } from 'react'

// date pentru tabelul comparativ - memoizate ca nu se schimba
const comparisonData = [
  { algorithm: 'otp', type: 'simetric (stream)', security: 'perfecta (teoretic)', speed: 'foarte rapida', usage: 'comunicatii ultra-secrete' },
  { algorithm: 'caesar', type: 'substitutie', security: 'foarte slaba', speed: 'instantaneu', usage: 'educational' },
  { algorithm: 'vigenère', type: 'polialfabetic', security: 'slaba', speed: 'rapida', usage: 'istoric/educational' },
  { algorithm: 'aes-256', type: 'simetric (bloc)', security: 'foarte puternica', speed: 'rapida (hardware)', usage: 'standard industrie' },
  { algorithm: 'sha-256', type: 'hash', security: 'puternica', speed: 'rapida', usage: 'integritate, parole' }
]

// card pentru un algoritm - componenta memoizata
const TheoryCard = memo(function TheoryCard({ title, children }) {
  return (
    <div className="theory-card">
      <h3>{title}</h3>
      {children}
    </div>
  )
})

// tabelul comparativ - memoizat
const ComparisonTable = memo(function ComparisonTable() {
  return (
    <div className="theory-card full-width">
      <h3>📊 comparatie algoritmi</h3>
      <table className="comparison-table">
        <thead>
          <tr>
            <th>algoritm</th>
            <th>tip</th>
            <th>securitate</th>
            <th>viteza</th>
            <th>utilizare</th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((row) => (
            <tr key={row.algorithm}>
              <td>{row.algorithm}</td>
              <td>{row.type}</td>
              <td>{row.security}</td>
              <td>{row.speed}</td>
              <td>{row.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

function TheorySection() {
  return (
    <section id="theory" className="crypto-section">
      <div className="section-header">
        <h2>📚 fundamente teoretice</h2>
      </div>

      <div className="theory-grid">
        <TheoryCard title="🔐 one-time pad">
          <div className="formula">c = m ⊕ k</div>
          <div className="formula">m = c ⊕ k</div>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            unde c = text cifrat, m = mesaj, k = cheie, ⊕ = xor
          </p>
          <h4>conditii pentru securitate perfecta:</h4>
          <ul>
            <li>cheia trebuie sa fie complet aleatorie</li>
            <li>cheia trebuie sa aiba cel putin lungimea mesajului</li>
            <li>cheia nu trebuie refolosita niciodata</li>
            <li>cheia trebuie pastrata secreta</li>
          </ul>
        </TheoryCard>

        <TheoryCard title="📜 cifrul caesar">
          <div className="formula">e(x) = (x + k) mod 26</div>
          <div className="formula">d(x) = (x - k) mod 26</div>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            unde x = pozitia literei, k = deplasarea
          </p>
          <h4>vulnerabilitati:</h4>
          <ul>
            <li>doar 25 de chei posibile</li>
            <li>atacul de forta bruta trivial</li>
            <li>analiza de frecventa</li>
          </ul>
        </TheoryCard>

        <TheoryCard title="🔤 cifrul vigenère">
          <div className="formula">e(x,k) = (x + k) mod 26</div>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            unde k variaza conform cheii
          </p>
          <h4>caracteristici:</h4>
          <ul>
            <li>cifru polialfabetic</li>
            <li>mai rezistent decat caesar</li>
            <li>vulnerabil la atacul kasiski</li>
            <li>vulnerabil la testul friedman</li>
          </ul>
        </TheoryCard>

        <TheoryCard title="🛡️ aes (rijndael)">
          <div className="formula">128/192/256 biti cheie</div>
          <div className="formula">128 biti bloc</div>
          <h4>structura rundei:</h4>
          <ul>
            <li>subbytes - substitutie neliniara</li>
            <li>shiftrows - permutare</li>
            <li>mixcolumns - difuzie</li>
            <li>addroundkey - xor cu cheia rundei</li>
          </ul>
        </TheoryCard>

        <ComparisonTable />
      </div>
    </section>
  )
}

export default memo(TheorySection)
