/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        gradient: 'linear-gradient(to bottom, #3a1f1b, #191414)',
      },
    },
  },

  plugins: [],
};
