/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(222, 47%, 6%)',
                foreground: 'hsl(210, 40%, 98%)',
                card: 'hsl(222, 47%, 8%)',
                'card-foreground': 'hsl(210, 40%, 98%)',
                border: 'hsl(217, 33%, 17%)',
                input: 'hsl(217, 33%, 17%)',
                primary: {
                    DEFAULT: 'hsl(262, 83%, 58%)',
                    foreground: 'hsl(210, 40%, 98%)',
                },
                secondary: {
                    DEFAULT: 'hsl(217, 33%, 17%)',
                    foreground: 'hsl(210, 40%, 98%)',
                },
                accent: {
                    DEFAULT: 'hsl(172, 66%, 50%)',
                    foreground: 'hsl(222, 47%, 6%)',
                },
                muted: {
                    DEFAULT: 'hsl(217, 33%, 17%)',
                    foreground: 'hsl(215, 20%, 65%)',
                },
                destructive: {
                    DEFAULT: 'hsl(0, 84%, 60%)',
                    foreground: 'hsl(210, 40%, 98%)',
                },
                success: 'hsl(142, 71%, 45%)',
                warning: 'hsl(38, 92%, 50%)',
            },
            borderRadius: {
                lg: '0.75rem',
                md: '0.5rem',
                sm: '0.25rem',
            },
            boxShadow: {
                glow: '0 0 20px rgba(139, 92, 246, 0.3)',
                'glow-accent': '0 0 20px rgba(45, 212, 191, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
