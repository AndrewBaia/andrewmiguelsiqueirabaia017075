/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          base: '#121212',      // Fundo principal (Main background)
          highlight: '#1a1a1a', // Sidebar e Cards (Secondary background)
          elevated: '#282828',  // Hover nos cards (Hover background)
          green: '#1DB954',     // Cor primária (Brand color)
          greenHover: '#1ed760', // Hover no botão verde
          text: '#FFFFFF',      // Texto principal
          subtext: '#b3b3b3',   // Texto secundário
          error: '#e91429'      // Erro
        }
      }
    },
  },
  plugins: [],
}
