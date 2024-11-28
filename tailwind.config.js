/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4169E1',
        secondary: '#87CEEB',
        accent: '#FFD700',
        background: '#FFFFFF',
        text: '#333333',
      },
    },
  },
  plugins: [],
}


