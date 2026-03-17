import type { Theme } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { HomePage } from './pages/HomePage';

type AppProps = {
  muiTheme: Theme;
};

export function App({ muiTheme }: AppProps) {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <HomePage />
    </MuiThemeProvider>
  );
}

