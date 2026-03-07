// postcss.config.js
// Tailwind is handled by @tailwindcss/vite plugin — no need for the postcss plugin here
module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
  ]
}