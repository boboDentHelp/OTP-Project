// header simplu pentru aplicatie
function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-center">
          🔐 one-time pad (otp)
        </h1>
        <p className="text-gray-400 text-center mt-2">
          singura metoda de criptare considerata "perfect securizata"
        </p>
      </div>
    </header>
  )
}

export default Header
