import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "");
    const target = env.VITE_API_URL || "http://192.168.178.108:3000";
    return {
        plugins: [react()],
        server: {
            watch: {
                usePolling: true,
            },
            proxy: {
                "/dispense": { target, changeOrigin: true },
                "/plants": { target, changeOrigin: true },
                "/members": { target, changeOrigin: true },
            },
        },
    };
});
