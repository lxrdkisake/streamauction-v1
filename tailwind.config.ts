/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx,js,jsx}','./components/**/*.{ts,tsx,js,jsx}','./pages/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:{ DEFAULT:'hsl(var(--secondary))', foreground:'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT:'hsl(var(--muted))', foreground:'hsl(var(--muted-foreground))' },
        accent:{ DEFAULT:'hsl(var(--accent))', foreground:'hsl(var(--accent-foreground))' },
        card:{ DEFAULT:'hsl(var(--card))', foreground:'hsl(var(--card-foreground))' },
        base:'#0E0E10', surface:'#141419', surface2:'#1A1A20', text:'#F5F6F8'
      },
      backgroundImage: {
        'dots': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
      },
      backgroundSize: {
        'dots': '30px 30px',
      },
      borderRadius:{ lg:'var(--radius)', xl:'12px', '2xl':'16px' },
    },
  },
  plugins:[require('tailwindcss-animate')],
}