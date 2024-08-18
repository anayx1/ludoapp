import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";

const ReferAndEarn = () => {
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    // Fetch user data from session storage
    const sessionData = sessionStorage.getItem("userData");
    if (sessionData) {
      const userData = JSON.parse(sessionData);
      setReferralCode(userData.user_details.referral_code);
    }
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    // You might want to add a snackbar or toast notification here
  };

  const copyLink = () => {
    const link = `https://aoneludo.com/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    // You might want to add a snackbar or toast notification here
  };

  const shareWhatsApp = () => {
    const link = `https://aoneludo.com/signup?ref=${referralCode}`;
    const message = encodeURIComponent(
      `Join me on this awesome app! Use my referral code: ${referralCode}\n${link}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <>
    <Sidebar/>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Refer & Earn
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <img
            src="/refer.jpg"
            style={{ width: "250px" }}
            alt="Refer & Earn illustration"
          />
        </Box>

        <Typography variant="body1" gutterBottom>
          Referral Code:
        </Typography>
        <TextField
          fullWidth
          value={referralCode}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
          margin="normal"
        />

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button variant="outlined" onClick={copyCode} fullWidth>
            Copy Code
          </Button>
          <Button variant="contained" onClick={copyLink} fullWidth>
            Copy Link
          </Button>
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={shareWhatsApp}
            fullWidth
            sx={{ bgcolor: "#25D366", "&:hover": { bgcolor: "#128C7E" } }}
          >
            Share
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Refer & Earn Rules
        </Typography>
        <Typography variant="body2">
          When your friend signs up on Aoneludo from your referral link, you get
          2% Commission on your referral's winnings.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Suppose your referral plays a battle for ₹10000 Cash, you get ₹200
          Cash
        </Typography>
      </Paper>
    </>
  );
};

export default withAuth(ReferAndEarn);
