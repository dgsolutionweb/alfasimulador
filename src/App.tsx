import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { Simulator } from './components/Simulator';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Simulator />
    </ThemeProvider>
  );
}

export default App;
