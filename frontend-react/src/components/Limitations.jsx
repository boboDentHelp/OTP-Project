// componenta cu limitarile otp
function Limitations() {
  return (
    <section className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">⚠️ limitari practice</h2>

      <div className="space-y-4">
        {/* problema distributiei cheii */}
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
          <h3 className="font-medium text-red-400 mb-2">
            1. problema distributiei cheii
          </h3>
          <p className="text-sm text-gray-300">
            pentru a trimite un mesaj de 1mb, ai nevoie de o cheie de 1mb.
            dar cum trimiti cheia in siguranta? daca ai un canal securizat pentru cheie,
            de ce nu trimiti direct mesajul pe acel canal?
          </p>
        </div>

        {/* reutilizarea cheii */}
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
          <h3 className="font-medium text-red-400 mb-2">
            2. cheia nu trebuie refolosita niciodata
          </h3>
          <p className="text-sm text-gray-300 mb-2">
            daca folosesti aceeasi cheie K pentru doua mesaje M1 si M2:
          </p>
          <div className="font-mono text-sm bg-gray-900 p-2 rounded">
            C1 ⊕ C2 = (M1 ⊕ K) ⊕ (M2 ⊕ K) = M1 ⊕ M2
          </div>
          <p className="text-sm text-gray-300 mt-2">
            atacatorul obtine xor-ul plaintexturilor si poate ghici mesajele!
            (proiectul venona - nsa a spart mesaje sovietice asa)
          </p>
        </div>

        {/* stocarea cheilor */}
        <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-400 mb-2">
            3. stocarea si managementul cheilor
          </h3>
          <p className="text-sm text-gray-300">
            cheile trebuie stocate in siguranta si distruse dupa utilizare.
            pentru comunicare continua, ai nevoie de cantitati uriase de chei pre-generate.
          </p>
        </div>

        {/* utilizari practice */}
        <div className="bg-gray-900 p-4 rounded-lg mt-6">
          <h3 className="font-medium mb-2">unde se foloseste totusi?</h3>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>comunicatii diplomatice de top-secret (linia rosie moscova-washington)</li>
            <li>comunicatii militare ultra-secrete</li>
            <li>distributie chei cuantice (qkd) - rezolva problema distributiei</li>
          </ul>
        </div>

        {/* concluzie */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-sm text-gray-400">
            <strong className="text-white">concluzie:</strong> otp e teoretic perfect,
            dar practic limitat. pentru uzul zilnic, algoritmii moderni ca aes sunt
            mult mai practici, chiar daca nu ofera "securitate perfecta" in sens matematic.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Limitations
