import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./component/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "Arial", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
            },
            colors: {
                border: "var(--outline-variant)",
                input: "var(--outline-variant)",
                ring: "var(--primary)",
                foreground: "var(--on-background)",
                surface: {
                    DEFAULT: "var(--surface)",
                    dim: "var(--surface-dim)",
                    bright: "var(--surface-bright)",
                    variant: "var(--surface-variant)",
                    container: "var(--surface-container)",
                    "container-lowest": "var(--surface-container-lowest)",
                    "container-low": "var(--surface-container-low)",
                    "container-high": "var(--surface-container-high)",
                    "container-highest": "var(--surface-container-highest)",
                },
                background: "var(--background)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--on-primary)",
                    container: "var(--primary-container)",
                    fixed: "var(--primary-fixed)",
                    "fixed-dim": "var(--primary-fixed-dim)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--on-secondary)",
                    container: "var(--secondary-container)",
                    fixed: "var(--secondary-fixed)",
                    "fixed-dim": "var(--secondary-fixed-dim)",
                },
                destructive: {
                    DEFAULT: "var(--error-container)",
                    foreground: "var(--on-error-container)",
                },
                muted: {
                    DEFAULT: "var(--surface-container-high)",
                    foreground: "var(--on-surface-variant)",
                },
                accent: {
                    DEFAULT: "var(--surface-container-high)",
                    foreground: "var(--on-surface)",
                },
                tertiary: {
                    DEFAULT: "var(--tertiary)",
                    container: "var(--tertiary-container)",
                    fixed: "var(--tertiary-fixed)",
                    "fixed-dim": "var(--tertiary-fixed-dim)",
                },
                outline: {
                    DEFAULT: "var(--outline)",
                    variant: "var(--outline-variant)",
                },
                "on-surface": {
                    DEFAULT: "var(--on-surface)",
                    variant: "var(--on-surface-variant)",
                },
                "on-primary": "var(--on-primary)",
                "on-secondary": "var(--on-secondary)",
                "on-tertiary": "var(--on-tertiary)",
                "on-background": "var(--on-background)",
            },
        },
    },
    plugins: [],
};

export default config;
