import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { App } from './App';
import { muiTheme } from './styles/theme/muiTheme';
import { globalTheme } from './styles/theme/globalTheme';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <StyledThemeProvider theme={globalTheme}>
      <CssBaseline />
      <App muiTheme={muiTheme} />
    </StyledThemeProvider>
  </React.StrictMode>
);

