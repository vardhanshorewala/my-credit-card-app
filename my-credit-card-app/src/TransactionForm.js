import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  CssBaseline,
  Alert,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();

const TransactionForm = () => {
  const [creditLimit, setCreditLimit] = useState('');
  const [events, setEvents] = useState('');
  const [results, setResults] = useState({
    available_credit: 0,
    payable_balance: 0,
    pending_transactions: [],
    settled_transactions: [],
  });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const data = {
      creditLimit: parseInt(creditLimit),
      events: JSON.parse(events),
    };

    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resultData = await response.json();
      setResults(resultData);
    } catch (error) {
      console.error('There was an error!', error);
      setError('There was an error with the submission. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
        <Paper style={{ padding: '16px' }} elevation={3}>
          <Typography variant="h5" component="h1" gutterBottom>
            Credit Card Transaction Form
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Credit Limit"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              margin="normal"
              fullWidth
              variant="outlined"
              type="number"
            />
            <TextField
              label="Events (JSON)"
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              margin="normal"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Submit
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {results && (
          <Paper sx={{ mt: 2, p: 2 }} elevation={3}>
            <Typography variant="h6">Summary</Typography>
            <Typography variant="body1">Available Credit: ${results.available_credit}</Typography>
            <Typography variant="body1">Payable Balance: ${results.payable_balance}</Typography>
          </Paper>
        )}

        {results.pending_transactions.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }} elevation={3}>
            <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>
              Pending Transactions
            </Typography>
            <Table aria-label="pending transactions table">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Time</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.pending_transactions.map((txn) => (
                  <TableRow key={txn.txn_id}>
                    <TableCell component="th" scope="row">
                      {txn.txn_id}
                    </TableCell>
                    <TableCell align="right">{txn.amount}</TableCell>
                    <TableCell align="right">{txn.time}</TableCell>
                    <TableCell align="right">Pending</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {results.settled_transactions.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }} elevation={3}>
            <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>
              Settled Transactions
            </Typography>
            <Table aria-label="settled transactions table">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Time</TableCell>
                  <TableCell align="right">Finalized Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.settled_transactions.map((txn) => (
                  <TableRow key={txn.txn_id}>
                    <TableCell component="th" scope="row">
                      {txn.txn_id}
                    </TableCell>
                    <TableCell align="right">{txn.amount}</TableCell>
                    <TableCell align="right">{txn.time}</TableCell>
                    <TableCell align="right">{txn.finalized_time || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default TransactionForm;
