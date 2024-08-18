import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper, TextField, Button, Alert } from "@mui/material";
import { useRouter } from 'next/router';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    router.push('/login');
  };

  const handleKycRedirect = () => {
    router.push('/kyc');
  };

  if (!userData) {
    return <Typography>Loading...</Typography>;
  }

  const { user_details } = userData;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom style={{ textAlign: "center" }}>
        Profile
      </Typography>
      
      {!user_details.kyc && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleKycRedirect}>
              Complete
            </Button>
          }
        >
          Complete Your KYC !
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3}}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom:"10px" }}>
          <img src="a1.svg" width={80} height={80} alt="Profile" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap:"wrap", gap:"20px"}}>
          <TextField
            disabled
            label="Username"
            variant="outlined"
            value={user_details.username}
          />
          <TextField
            disabled
            label="Mobile Number"
            variant="outlined"
            value={user_details.phone_number}
          />
        </div>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom style={{ textAlign: "center", marginBottom: "15px" }}>
          Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">Played</Typography>
              <Typography variant="h6">{user_details.metric.played}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">Win</Typography>
              <Typography variant="h6">{user_details.metric.win}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">Refer Earning</Typography>
              <Typography variant="h6">₹{user_details.metric.referal_winnings}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">Total Referrals</Typography>
              <Typography variant="h6">{user_details.metric.referals}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1">Penalty</Typography>
              <Typography variant="h6">₹{user_details.metric.penalty}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "20px" }}>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </Box>
  );
};

export default Profile;