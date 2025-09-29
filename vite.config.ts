import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "");
    const target = env.VITE_API_URL || "http://hyper.raumriss.de:3000";
    //const username = env.VITE_API_USERNAME || "hyper";
    //const password = env.VITE_API_PASSWORD || "$5GzB2yJ=<rBEehf";

    // Configure proxy options with auth
    const proxyOptions = {
        target,
        changeOrigin: true,
        //auth: username && password ? `${username}:${password}` : undefined,
    };

    return {
        plugins: [react()],
        server: {
            watch: {
                usePolling: true,
            },
            proxy: {
                "/dispense": proxyOptions,
                "/plants": proxyOptions,
                "/members": proxyOptions,
            },
        },
    };
});
