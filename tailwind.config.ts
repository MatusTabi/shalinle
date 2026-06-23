import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./component/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "Arial", "sans-serif"],
            },
            colors: {
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
                    container: "var(--primary-container)",
                    fixed: "var(--primary-fixed)",
                    "fixed-dim": "var(--primary-fixed-dim)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    container: "var(--secondary-container)",
                    fixed: "var(--secondary-fixed)",
                    "fixed-dim": "var(--secondary-fixed-dim)",
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
