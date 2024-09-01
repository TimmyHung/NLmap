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
      boxShadow: {
        'custom-inner': 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(0, 0, 0, 0.1), inset 2px -2px 5px rgba(0, 0, 0, 0.1), inset -2px 2px 5px rgba(0, 0, 0, 0.1)',
      },
      colors: {
        transparentGrey: 'rgba(217, 217, 217, 0.15)',
        nodeIDBlue: 'rgb(25, 111, 250)',
        lightblack: 'rgb(30, 30, 30)',
        bluegrey: 'rgb(106, 117, 134)',
        slateBlue: 'rgb(20, 69, 131)',
        darkSlateBlue: 'rgb(16, 54, 105)',
        darkBlueGrey: 'rgb(52, 72, 81)'
      }
    }
  },
  plugins: [],
}
