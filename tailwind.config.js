module.exports = {
  prefix: '',
  // set anything to NODE_ENV to trick tailwindcss plugin to
  // show autocompletion correctly.
  // Issue: https://youtrack.jetbrains.com/issue/WEB-50318
  mode: process.env.NODE_ENV ? 'jit' : undefined,
  purge: {
    content: [
      './src/**/*.{html,ts,css,scss,sass,less,styl}',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      borderRadius: {
        '4xl': '32px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
