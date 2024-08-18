import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid 
} from '@mui/material';

const CreateBattle = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const walletBalance = 5000; // Replace with actual wallet balance

  const handleAmountChange = (event) => {
    const value = event.target.value;
    setAmount(value);
    setError('');

    if (value && (value < 50 || value > 10000)) {
      setError('Amount must be between 50 and 10000');
    }
  };

  const handleCreateBattle = async () => {
    if (!amount || amount < 50 || amount > 10000) {
      setError('Please enter a valid amount between 50 and 10000');
      return;
    }

    if (walletBalance >= Number(amount)) {
      try {
        // Replace with your actual API call
        const response = await fetch('/api/create-battle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(amount) })
        });

        if (response.ok) {
          alert('Battle created successfully!');
          setAmount('');
        } else {
          throw new Error('Failed to create battle');
        }
      } catch (error) {
        console.error('Error creating battle:', error);
        alert('Failed to create battle. Please try again.');
      }
    } else {
      setError('Insufficient wallet balance');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create a battle!
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Enter amount (50-10000)"
          variant="outlined"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateBattle}
          fullWidth
        >
          Create Battle
        </Button>
      </Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2">Playing for</Typography>
          <Typography variant="h6">{amount || 0}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Prize</Typography>
          <Typography variant="h6">{amount ? Number(amount) * 1.95 : 0}</Typography>
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Wallet Balance: {walletBalance}
      </Typography>
    </Paper>
  );
};

export default CreateBattle;