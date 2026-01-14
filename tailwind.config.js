/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                neural: {
                    dark: '#080b14',
                    accent: '#3b82f6'
                }
            },
            animation: {
                'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'spin-slow': 'spin 12s linear infinite',
                'spin-reverse': 'spin-reverse 8s linear infinite',
                'terminal-scroll': 'terminal-scroll 20s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                glow: {
                    'from': { 'box-shadow': '0 0 5px #3b82f6, 0 0 10px #3b82f6' },
                    'to': { 'box-shadow': '0 0 20px #3b82f6, 0 0 30px #2563eb' },
                },
                'spin-reverse': {
                    'from': { transform: 'rotate(360deg)' },
                    'to': { transform: 'rotate(0deg)' },
                },
                'terminal-scroll': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100%)' },
                }
            }
        },
    },
    plugins: [],
}