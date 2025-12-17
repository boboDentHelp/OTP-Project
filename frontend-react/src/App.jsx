// aplicatia principala - demo one-time pad
import Header from './components/Header'
import OTPDemo from './components/OTPDemo'
import Theory from './components/Theory'
import Limitations from './components/Limitations'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <OTPDemo />
        <Theory />
        <Limitations />
      </main>
      <footer className="text-center py-6 text-gray-500 border-t border-gray-800">
        <p>proiect criptografie - one-time pad demo</p>
      </footer>
    </div>
  )
}

export default App
