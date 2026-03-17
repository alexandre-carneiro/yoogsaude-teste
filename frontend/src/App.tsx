import type { Theme } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';

type AppProps = {
  muiTheme: Theme;
};

export function App({ muiTheme }: AppProps) {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

