module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'covered': ['"Covered By Your Grace"', 'cursive'],
      },
      height: {
        'bodyFull': '91%',
      },
      colors: {
        transparentGrey: 'rgba(217, 217, 217, 0.15)',
        nodeIDBlue: 'rgb(25, 111, 250)',
        lightblack: 'rgb(30, 30, 30)',
        bluegrey: 'rgb(106, 117, 134)',
        slateBlue: 'rgb(20, 69, 131)',
        darkSlateBlue: 'rgb(16, 54, 105)',
      }
    }
  },
  plugins: [],
}
