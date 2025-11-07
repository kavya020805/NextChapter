/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#FDF6EB',
        'peach': '#F5E6D3',
        'coral': '#D47249',
        'dark-coral': '#BF5F3B',
      },
      fontFamily: {
        'merriweather': ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}

