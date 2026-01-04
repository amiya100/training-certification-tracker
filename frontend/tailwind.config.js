/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "dark-bg": "#1a1a1a",
                "dark-card": "#2a2a2a",
                "dark-sidebar": "#1f1f1f",
                "orange-primary": "#ff6b35",
                "blue-primary": "#4a90e2",
            },
        },
    },
    plugins: [],
};
