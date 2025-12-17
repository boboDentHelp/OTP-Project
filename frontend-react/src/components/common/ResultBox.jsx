// componenta pentru afisarea rezultatelor
// suporta diferite tipuri: normal, error, key, hash

import { memo, useCallback } from 'react'

function ResultBox({
  label,
  value,
  type = 'normal', // normal, error, key, hash
  showCopy = false,
  className = ''
}) {
  // functie pentru copiere in clipboard
  const handleCopy = useCallback(async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      // ar fi fain sa avem un toast aici dar e prea complicat pentru proiect
      alert('copiat in clipboard!')
    } catch (err) {
      console.error('nu am putut copia:', err)
    }
  }, [value])

  // determinam clasa pentru tip
  const typeClass = type === 'normal' ? '' : type

  return (
    <div className={`result-group ${className}`}>
      {label && <label>{label}</label>}
      <div className={`result-box ${typeClass}`}>
        {value || 'niciun rezultat inca...'}
      </div>
      {showCopy && value && (
        <button
          className="btn btn-small btn-secondary"
          onClick={handleCopy}
          style={{ marginTop: '0.5rem' }}
        >
          copiaza
        </button>
      )}
    </div>
  )
}

export default memo(ResultBox)
