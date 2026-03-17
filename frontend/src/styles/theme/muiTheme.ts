import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#00897b'
    },
    background: {
      default: '#f5f5f5'
    }
  },
  shape: {
    borderRadius: 8
  }
});

