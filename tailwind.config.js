module.exports = {
  prefix: '',
  content: [
    './src/**/*.{html,ts,css,scss,sass,less,styl}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '32px'
      },
      fontSize: {
        'xxs': '.625rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
