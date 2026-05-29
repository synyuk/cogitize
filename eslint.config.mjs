import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...nextCoreWebVitals, ...nextTypescript],

    plugins: {
        import: fixupPluginRules(_import),
    },

    rules: {
        "@typescript-eslint/no-explicit-any": "off",

        "import/no-internal-modules": ["error", {
            allow: [
                "**/index.ts",
                "next/server",
                "next/navigation",
                "@reduxjs/toolkit/query/react",
                "@reduxjs/toolkit/query",
                "next-intl/middleware",
                "next-intl/routing",
                "next-intl/server",
                "next-intl/navigation",
                "next/font/google",
                "/styles/globals.css",
                "next-intl/plugin",
                "next/constants.js",
            ],
        }],
    },
}, {
    files: ["**/index.ts", "**/index.tsx"],

    rules: {
        "import/no-internal-modules": "off",
    },
}]);