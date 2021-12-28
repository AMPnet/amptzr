module.exports = {
  prefix: '',
  content: [
    './src/**/*.{html,ts,css,scss,sass,less,styl}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '32px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
