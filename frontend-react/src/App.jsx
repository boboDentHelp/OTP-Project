// aplicatia principala - simulare otp
import OTPSimulator from './components/OTPSimulator'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            one-time pad simulator
          </h1>
          <p className="text-slate-400 mt-2">
            criptare si decriptare cu cheie otp
          </p>
        </header>

        <OTPSimulator />

        <footer className="text-center mt-12 pt-6 border-t border-slate-800 text-slate-500 text-sm">
          proiect criptografie - simulare otp cu crypto/rand
        </footer>
      </div>
    </div>
  )
}

export default App
