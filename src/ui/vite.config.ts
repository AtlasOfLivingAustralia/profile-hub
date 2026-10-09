import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import packageJson from "./package.json" with { type: "json" };

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, "./config", "");
	return {
		plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
		define: {
			__APP_VERSION__: JSON.stringify(packageJson.version),
		},
		resolve: {
			alias: {
				"#": "/src",
			},
		},
		envDir: "./config",
		server: {
			proxy: {
				"/lists-ws": {
					target: env.VITE_LISTS_BASE,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/lists-ws/, ""),
				},
			},
		},
	};
});
