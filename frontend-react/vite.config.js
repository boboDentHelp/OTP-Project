// configuratie vite pentru proiectul de criptografie
// folosim react compiler pentru optimizari automate
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// react compiler e o chestie noua din react 19 care face memoizare automata
// practic nu mai trebuie sa punem useMemo si useCallback manual peste tot
const ReactCompilerConfig = {
  // activam compilatorul pentru toate fisierele
  target: '19'
}

export default defineConfig({
  plugins: [
    react({
      // aici configuram babel sa foloseasca react compiler
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', ReactCompilerConfig]
        ]
      }
    })
  ],
  // serverul de development
  server: {
    port: 3000,
    // proxy pentru api ca sa nu avem probleme cu cors
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  // configurari pentru build
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
