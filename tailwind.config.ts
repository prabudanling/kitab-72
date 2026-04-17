import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                fontFamily: {
                        heading: ['var(--font-heading)', 'Outfit', 'Georgia', 'serif'],
                        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
                        serif: ['var(--font-serif)', 'Lora', 'Georgia', 'serif'],
                        body: ['var(--font-ui)', 'DM Sans', 'system-ui', 'sans-serif'],
                        ui: ['var(--font-ui)', 'DM Sans', 'system-ui', 'sans-serif'],
                        elegant: ['var(--font-elegant)', 'Crimson Pro', 'Georgia', 'serif'],
                        mono: ['var(--font-mono)', 'JetBrains Mono', 'Courier New', 'monospace'],
                        'code-mono': ['var(--font-code-mono)', 'DM Mono', 'monospace'],
                },
                fontSize: {
                        hero: ['clamp(2.8rem, 7vw, 5.5rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '900' }],
                        section: ['clamp(2rem, 3.8vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
                        cover: ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
                        subtitle: ['clamp(1rem, 2vw, 1.4rem)', { lineHeight: '1.5', fontWeight: '500' }],
                        nav: ['1.4rem', { lineHeight: '1.3', fontWeight: '600' }],
                        body: ['0.88rem', { lineHeight: '1.7' }],
                        label: ['0.75rem', { lineHeight: '1.4', fontWeight: '600' }],
                        value: ['clamp(1.8rem, 2.5vw, 2rem)', { lineHeight: '1.2', fontWeight: '700' }],
                },
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
