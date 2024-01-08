/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        colors: {
            black: '#333',
            white: '#fff',
            gray: '#999',
        },
        extend: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
                serif: ['Lora', 'serif'],
            },
        },
    },
    plugins: [],
}
