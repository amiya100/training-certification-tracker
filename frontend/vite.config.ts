import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/", // <--- important for correct asset paths on Netlify
    build: {
        outDir: "dist",
        sourcemap: true,
    },
    server: {
        port: 3000, // only for local dev
    },
});
