/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50:  '#fdf2f1',
          100: '#fbe0dd',
          200: '#f6bcb5',
          300: '#ee8e83',
          400: '#e36256',
          500: '#d44132',
          600: '#c0392b', // BRAVE crimson
          700: '#a02e22',
          800: '#83271e',
          900: '#6b231d',
          950: '#3a0f0a',
        },

        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          ring: 'hsl(var(--sidebar-ring))',
          'muted-foreground': 'hsl(var(--sidebar-muted-foreground))',
        },

        /* BRAVE raw brand palette */
        brave: {
          red:     '#C0392B',
          amber:   '#EF9F27',
          cream:   '#fcfaf8',
          ink:     '#19191b',
          'ink-soft': '#1e0d01',
          coral:   '#fa8484',
          magenta: '#fe83f2',
          accent:  '#db4750',
          footer:  '#070a11',
          maroon:  '#5C1A1A',
          'maroon-deep': '#3F1010',
        },

        /* Back-compat shim: any legacy `brandRed-*` and `bg-[#FF4800]`
           callers will keep working — they now map to BRAVE crimson. */
        brandRed: {
          50:  '#fdf2f1',
          100: '#fbe0dd',
          200: '#f6bcb5',
          600: '#c0392b',
          700: '#a02e22',
          800: '#83271e',
          900: '#6b231d',
          950: '#3a0f0a',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Supreme', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif:   ['Supreme', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'], // legacy alias
        marketing: ['Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.25s ease-out',
      },

      boxShadow: {
        'brave-card': '0 1px 2px rgba(124, 45, 18, 0.04), 0 1px 1px rgba(124, 45, 18, 0.02)',
        'brave-soft': '0 2px 8px -2px rgba(124, 45, 18, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
