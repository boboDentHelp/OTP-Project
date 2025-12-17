// componenta principala a aplicatiei
// aici punem layout-ul general si rutele/sectiunile

import { memo } from 'react'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import OTPSection from './components/OTPSection'
import CaesarSection from './components/CaesarSection'
import VigenereSection from './components/VigenereSection'
import AESSection from './components/AESSection'
import HashSection from './components/HashSection'
import TheorySection from './components/TheorySection'
import Footer from './components/Footer'

// componenta pentru continut - memoizata ca sa nu se rerandeze degeaba
const MainContent = memo(function MainContent() {
  return (
    <main className="container">
      <Hero />
      <OTPSection />
      <CaesarSection />
      <VigenereSection />
      <AESSection />
      <HashSection />
      <TheorySection />
    </main>
  )
})

// componenta principala
function App() {
  return (
    <AppProvider>
      <div className="app">
        <Navbar />
        <MainContent />
        <Footer />
      </div>
    </AppProvider>
  )
}

export default App
