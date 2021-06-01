const {guessProductionMode} = require("@ngneat/tailwind");

process.env.TAILWIND_MODE = guessProductionMode() ? 'build' : 'watch';

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
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
