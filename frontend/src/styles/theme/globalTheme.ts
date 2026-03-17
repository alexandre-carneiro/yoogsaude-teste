export const globalTheme = {
  colors: {
    primary: '#1976d2',
    secondary: '#00897b',
    background: '#f5f5f5',
    text: '#1f2933'
  },
  spacing: (factor: number) => `${factor * 8}px`,
  borderRadius: '8px'
} as const;

