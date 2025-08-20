/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Project Tempora gradient palette
        'tempora': {
          purple: '#8B5CF6',
          pink: '#EC4899',
          blue: '#3B82F6',
          lightBlue: '#06B6D4',
          turquoise: '#14B8A6',
          yellow: '#F59E0B',
          green: '#10B981',
        }
      },
      backgroundImage: {
        'tempora-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 16%, #3B82F6 32%, #06B6D4 48%, #14B8A6 64%, #F59E0B 80%, #10B981 100%)',
      }
    },
  },
  plugins: [],
}