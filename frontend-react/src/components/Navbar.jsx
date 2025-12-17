// componenta pentru navbar
// afiseaza logo-ul si linkurile de navigare

import { memo, useCallback } from 'react'
import { useApp } from '../context/AppContext'

// componenta pentru un singur link - memoizata
const NavLink = memo(function NavLink({ section, isActive, onClick }) {
  // handler pentru click
  const handleClick = useCallback(() => {
    onClick(section.id)
  }, [onClick, section.id])

  return (
    <button
      className={`nav-link ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {section.label}
    </button>
  )
})

// componenta principala navbar
function Navbar() {
  const { activeSection, navigateTo, sections } = useApp()

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="lock-icon">🔐</span>
        <span>CryptoLab</span>
      </div>
      <div className="nav-links">
        {sections.map(section => (
          <NavLink
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={navigateTo}
          />
        ))}
      </div>
    </nav>
  )
}

// exportam memoizat pentru performanta
export default memo(Navbar)
