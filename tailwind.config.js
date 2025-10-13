/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // GOV.UK inspired color palette with better contrast
        primary: "#1d70b8", // GOV.UK blue (better contrast than #3b82f6)
        "primary-hover": "#003078", // GOV.UK dark blue
        danger: "#d4351c", // GOV.UK red
        warning: "#f47738", // GOV.UK orange
        success: "#00703c", // GOV.UK green
        text: "#0b0c0c", // GOV.UK text
        "text-secondary": "#505a5f", // GOV.UK secondary text
        border: "#b1b4b6", // GOV.UK border
        background: "#f3f2f1", // GOV.UK background
      },
      fontSize: {
        // GOV.UK typography scale
        'body-s': ['16px', { lineHeight: '20px' }],
        'body': ['19px', { lineHeight: '25px' }],
        'body-l': ['24px', { lineHeight: '30px' }],
        'heading-s': ['19px', { lineHeight: '25px', fontWeight: '700' }],
        'heading-m': ['24px', { lineHeight: '30px', fontWeight: '700' }],
        'heading-l': ['36px', { lineHeight: '40px', fontWeight: '700' }],
        'heading-xl': ['48px', { lineHeight: '50px', fontWeight: '700' }],
      },
      spacing: {
        // GOV.UK spacing scale (based on 5px increments)
        '15': '15px',
        '20': '20px',
        '25': '25px',
        '30': '30px',
        '40': '40px',
        '50': '50px',
      },
      minHeight: {
        'touch-target': '44px', // Minimum touch target size
      },
      minWidth: {
        'touch-target': '44px',
      },
    },
  },
  plugins: [],
};
