// componenta cu teoria din spatele otp
function Theory() {
  return (
    <section className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">📚 cum functioneaza otp</h2>

      <div className="space-y-6">
        {/* formula */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-2">formula matematica</h3>
          <div className="font-mono text-lg space-y-1">
            <p><span className="text-blue-400">criptare:</span> C = M ⊕ K</p>
            <p><span className="text-green-400">decriptare:</span> M = C ⊕ K</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            unde C = ciphertext, M = mesaj, K = cheie, ⊕ = XOR
          </p>
        </div>

        {/* etape */}
        <div>
          <h3 className="font-medium mb-3">etapele procesului:</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
              <div>
                <p className="font-medium">generare cheie aleatoare</p>
                <p className="text-sm text-gray-400">
                  cheia trebuie sa fie complet aleatoare si de aceeasi lungime cu mesajul
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
              <div>
                <p className="font-medium">criptare prin xor</p>
                <p className="text-sm text-gray-400">
                  fiecare byte din mesaj e combinat cu byte-ul corespunzator din cheie folosind operatia xor
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
              <div>
                <p className="font-medium">decriptare prin xor</p>
                <p className="text-sm text-gray-400">
                  acelasi proces - aplicam xor intre mesajul criptat si cheie pentru a obtine mesajul original
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* tabel xor */}
        <div>
          <h3 className="font-medium mb-3">tabelul xor:</h3>
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="px-4 py-2 border border-gray-700">A</th>
                  <th className="px-4 py-2 border border-gray-700">B</th>
                  <th className="px-4 py-2 border border-gray-700">A ⊕ B</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="px-4 py-2 border border-gray-700 text-center">0</td>
                  <td className="px-4 py-2 border border-gray-700 text-center">0</td>
                  <td className="px-4 py-2 border border-gray-700 text-center text-green-400">0</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700 text-center">0</td>
                  <td className="px-4 py-2 border border-gray-700 text-center">1</td>
                  <td className="px-4 py-2 border border-gray-700 text-center text-green-400">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700 text-center">1</td>
                  <td className="px-4 py-2 border border-gray-700 text-center">0</td>
                  <td className="px-4 py-2 border border-gray-700 text-center text-green-400">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700 text-center">1</td>
                  <td className="px-4 py-2 border border-gray-700 text-center">1</td>
                  <td className="px-4 py-2 border border-gray-700 text-center text-green-400">0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            proprietate cheie: (A ⊕ B) ⊕ B = A (de asta merge decriptarea)
          </p>
        </div>

        {/* de ce e securitate perfecta */}
        <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg">
          <h3 className="font-medium text-green-400 mb-2">de ce e "securitate perfecta"?</h3>
          <p className="text-sm text-gray-300">
            claude shannon a demonstrat in 1949 ca daca cheia e complet aleatoare,
            de aceeasi lungime cu mesajul, si folosita o singura data, atunci
            ciphertext-ul nu dezvaluie absolut nicio informatie despre mesaj.
            fiecare mesaj posibil e la fel de probabil.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Theory
