import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import packageJson from "./package.json" with { type: "json" };

// https://vite.dev/config/
export default defineConfig({
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
});
