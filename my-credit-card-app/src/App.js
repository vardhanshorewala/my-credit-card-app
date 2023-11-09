import React from 'react';
import TransactionForm from './TransactionForm';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TransactionForm />
    </ThemeProvider>
  );
}

export default App;
