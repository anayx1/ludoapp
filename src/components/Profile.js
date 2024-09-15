import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Alert,
  Modal,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/router";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";
import { useSocketContext } from "@/context/SocketProvider";

const Profile = () => {
  const [openModal, setOpenModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const router = useRouter();
  const {userData} = useSocketContext();

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setNewUsername(parsedData.user_details.username);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    Cookies.remove("userData");
    window.location.href = "/login";
  };

  const handleKycRedirect = () => {
    router.push("/kyc");
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewUsername(userData.user_details.username);
  };

  const handleUpdateUsername = async () => {
    try {
      const response = await fetch(
        `https://admin.aoneludo.com/auth/update-username/${userData.user_details.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Add any necessary authentication headers here
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );

      if (response.ok) {
        const updatedUserData = {
          ...userData,
          user_details: { ...userData.user_details, username: newUsername },
        };
        setUserData(updatedUserData);
        sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
        setOpenModal(false);
      } else {
        // Handle error
        console.error("Failed to update username");
      }
    } catch (error) {
      console.error("Error updating username:", error);
    }
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

      {!user_details.kyc &&
        user_details.kyc_status !== "P" &&
        user_details.kyc_status !== "D" && (
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
      {user_details.kyc_status === "P" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have already submitted your KYC. We are currently awaiting admin
          approval. Please be patient.<br></br>
          <br></br> आपने अपना KYC पहले ही सबमिट कर दिया है। अभी प्रशासक की
          मंजूरी का इंतजार हो रहा है। कृपया प्रतीक्षा करें।
        </Alert>
      )}
      {user_details.kyc_status === "D" && (
        <Alert
          severity="alert"
          sx={{ mb: 2 }}
          style={{ background: "#cb3232", color: "white" }}

          action={
            <Button color="inherit" size="small" onClick={handleKycRedirect}>
              Complete
            </Button>
          }
        >
          Your KYC has been declined. Please upload your KYC document again,
          ensuring that the name you enter matches the one on the document and
          that the document photo is clear.!
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <img src="a1.svg" width={80} height={80} alt="Profile" />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <TextField
              // disabled
              label="Username"
              variant="outlined"
              value={user_details.username}
            />
            <IconButton onClick={handleOpenModal} size="small" sx={{ ml: 1 }}>
              <EditIcon style={{ color: "black" }} />
            </IconButton>
          </div>
          <TextField
            disabled
            label="Mobile Number"
            variant="outlined"
            value={user_details.phone_number}
          />
        </div>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          style={{ textAlign: "center", marginBottom: "15px" }}
        >
          Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">Played</Typography>
              <Typography variant="h6">{user_details.metric.played}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">Win</Typography>
              <Typography variant="h6">{user_details.metric.win}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">Refer Earning</Typography>
              <Typography variant="h6">
                ₹{user_details.metric.referal_winnings}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">Total Referrals</Typography>
              <Typography variant="h6">
                {user_details.metric.referals}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">Penalty</Typography>
              <Typography variant="h6">
                ₹{user_details.metric.penalty}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "20px",
        }}
      >
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="edit-username-modal"
        aria-describedby="modal-to-edit-username"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "black",
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            id="edit-username-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Edit Username
          </Typography>
          <TextField
            fullWidth
            label="New Username"
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleUpdateUsername}>
            Update
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;
