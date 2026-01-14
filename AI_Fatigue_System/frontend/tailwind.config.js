/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // Professional blue for your medical/tech dashboard
        danger: "#e11d48",  // Red for high fatigue alerts (Roadmap Phase 4)
      }
    },
  },
  plugins: [],
}