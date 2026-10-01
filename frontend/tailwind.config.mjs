const config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        arimo: ['var(--font-arimo)'],
      },
    },
  },
  plugins: [],
  safelist: [
    'row-span-1',
    'row-span-2',
    'row-span-3',
    'row-span-4',
    'row-span-5',
    'row-span-6',
  ],
}

export default config