export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blinq': {
          'bg': '#0a0a0f',
          'card': '#12121a',
          'border': '#1e1e2e',
          'accent': '#6366f1',
          'accent-hover': '#818cf8',
          'text': '#e2e8f0',
          'text-muted': '#64748b',
          'success': '#22c55e',
          'danger': '#ef4444',
          'warning': '#f59e0b',
          'ct': '#5b9bd5',
          'tt': '#d4a84b'
        }
      }
    },
  },
  plugins: [],
}
