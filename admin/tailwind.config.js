module.exports = {
    // mode: 'jit',
    purge: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        fontFamily: {
            sans: ['Open Sans', 'sans-serif']
        },
        extend: {},
    },
    variants: {
        extend: {
            textColor: ['disabled'],
            cursor: ['disabled']
        },
    },
    plugins: [],
}
