module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('postcss-custom-properties'),
    require('autoprefixer'),
  ],
  // plugins: {
  //   'postcss-import': {},
  //   'tailwindcss/nesting': {},
  //   tailwindcss: {},
  //   autoprefixer: {},
  // }
};
