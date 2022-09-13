module.exports = {
  prefix: "",
  content: ["./src/**/*.{html,ts,css,scss,sass,less,styl}", './src/**/*.{html,js}', './node_modules/tw-elements/dist/js/**/*.js'],
  theme: {
    extend: {
      borderRadius: {
        "4xl": "32px",
      },
      fontSize: {
        xxs: ".625rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require('tw-elements/dist/plugin')],
}
