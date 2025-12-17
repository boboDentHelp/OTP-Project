// context pentru starea globala a aplicatiei
// il folosim ca sa nu pasam props prin multe nivele de componente

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// cream contextul
const AppContext = createContext(null)

// lista cu sectiunile disponibile
const SECTIONS = [
  { id: 'otp', label: 'OTP', icon: '🔑' },
  { id: 'caesar', label: 'Caesar', icon: '📜' },
  { id: 'vigenere', label: 'Vigenère', icon: '🔤' },
  { id: 'aes', label: 'AES', icon: '🛡️' },
  { id: 'hash', label: 'Hash', icon: '#️⃣' },
  { id: 'theory', label: 'Teorie', icon: '📚' }
]

// provider-ul care wrap-uieste aplicatia
export function AppProvider({ children }) {
  // sectiunea activa curenta
  const [activeSection, setActiveSection] = useState('otp')

  // functie pentru schimbarea sectiunii
  // folosim useCallback ca sa nu se recreeze la fiecare render
  const navigateTo = useCallback((sectionId) => {
    setActiveSection(sectionId)
    // scroll smooth la sectiune
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // memoizam valoarea contextului ca sa nu cauzeze rerenderari inutile
  const value = useMemo(() => ({
    activeSection,
    setActiveSection,
    navigateTo,
    sections: SECTIONS
  }), [activeSection, navigateTo])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// hook pentru a folosi contextul
// aruncam eroare daca e folosit in afara provider-ului
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp trebuie folosit in interiorul AppProvider')
  }
  return context
}
