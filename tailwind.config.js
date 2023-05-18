const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./src/ui/**/*.{ts,tsx,html}'],
  theme: {
    colors: {
      ...colors,
      orange: '#FFA877',
      input: 'rgba(228, 234, 243, 0.25)',
    },
    fontSize: {
      11: [
        '11px',
        {
          lineHeight: '13px',
        },
      ],
      12: [
        '12px',
        {
          lineHeight: '14px',
        },
      ],
      13: '13px',
      14: [
        '14px',
        {
          lineHeight: '18px',
        },
      ],
      15: [
        '15px',
        {
          lineHeight: '18px',
        },
      ],
      16: [
        '16px',
        {
          lineHeight: '20px',
        },
      ],
      18: [
        '18px',
        {
          lineHeight: '22px',
        },
      ],
      20: '20px',
      22: '22px',
      24: [
        '24px',
        {
          lineHeight: '28px',
        },
      ],
    },
    backdropBlur: {
      10: '10px',
    },
    fontFamily: {
      Gilroy: 'Gilroy',
      GilroyLight: 'GilroyLight',
      GilroyExtraBold: 'GilroyExtraBold',
      Arimo: 'Arimo',
    },
  },
  // use media-query prefers-color-scheme
  darkMode: 'media',
  important: true,
};
