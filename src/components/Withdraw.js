import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  AppBar,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";
import { io } from "socket.io-client";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

const Withdraw = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    account_holder_name: "",
    upi_id: "",
    withdrawal_amount: "",
    account_number: "",
    ifsc_code: "",
    selected_tab: "upi",
  });
  const [walletId, setWalletId] = useState(null);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isKycCompleted, setIsKycCompleted] = useState(true);
  const [minWithdraw, setMinWithdraw] = useState(0);
  const [maxWithdraw, setMaxWithdraw] = useState(Infinity);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

    const [userId, setUserId] = useState(null);
    const [socket, setSocket] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const sessionUserData = JSON.parse(sessionStorage.getItem("userData"));

      if (sessionUserData) {
        setUserId(sessionUserData.user_details.id);
        setIsKycCompleted(sessionUserData.user_details.kyc);
        setWalletId(sessionUserData.user_details.wallet?.wallet_id);
        setWithdrawableBalance(
          parseFloat(
            sessionUserData.user_details.wallet?.withdrawable_balance
          ) || 0
        );
      }
      const response = await axios.get(
        "https://ludotest.pythonanywhere.com/panel/get-admin-details/5/"
      );
      // const { user_details } = response.data;

      // setIsKycCompleted(res.kyc);
      // setWalletId(user_details.wallet?.wallet_id);
      // setWithdrawableBalance(
      //   parseFloat(user_details.wallet?.withdrawable_balance) || 0
      // );
      console.log(response, "response");
      setMinWithdraw(parseFloat(response?.data?.min_withdraw) || 0);
      setMaxWithdraw(parseFloat(response?.data?.max_withdraw) || Infinity);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setModalContent({
        title: "Error",
        message: "Failed to fetch user details. Please try again.",
      });
      setOpen(true);
    }
  };

    const setSocketIo = () => {
      const socketIo = io("https://socket.aoneludo.com");
      setSocket(socketIo);
      if (socketIo.connected) {
        onConnect();
      }

      function onConnect() {
        socketIo.emit("user-joined", userId);
        socketIo.on("balance-update", (data) => {
          if (data === userId) {
            fetchUserDetails();
          }
        });
      }

      function onDisconnect() {

      }

      socketIo.on("connect", onConnect);
      socketIo.on("disconnect", onDisconnect);
    };

    useEffect(() => {
      setSocketIo();
      fetchUserDetails();
      return () => {
        if (socket) {
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
        }
      };
    }, []);
  const router = useRouter();

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    setFormData((prevData) => ({
      ...prevData,
      selected_tab: newIndex === 0 ? "upi" : "bank",
    }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
    router.push("/"); // Redirect after successful submission
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateWithdrawalAmount = (amount) => {
    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount)) {
      return "Please enter a valid withdrawal amount.";
    }

    if (withdrawalAmount < minWithdraw) {
      return `Minimum withdrawal amount is ₹${minWithdraw.toFixed(2)}.`;
    }

    const effectiveMaxWithdraw = Math.min(maxWithdraw, withdrawableBalance);

    if (withdrawalAmount > effectiveMaxWithdraw) {
      return `Maximum withdrawal amount is ₹${effectiveMaxWithdraw.toFixed(
        2
      )}.`;
    }

    return null; // No error
  };

  const handleSubmit = async () => {
    if (!walletId) {
      setModalContent({
        title: "Error",
        message: "Wallet ID not found. Please log in again.",
      });
      setOpen(true);
      return;
    }

    const validationError = validateWithdrawalAmount(
      formData.withdrawal_amount
    );
    if (validationError) {
      setModalContent({
        title: "Error",
        message: validationError,
      });
      setOpen(true);
      return;
    }

    const payload = {
      withdrawal_amount: formData.withdrawal_amount,
      selected_tab: formData.selected_tab,
      account_holder_name: formData.account_holder_name,
      account_number:
        formData.selected_tab === "bank" ? formData.account_number : null,
      ifsc_code: formData.selected_tab === "bank" ? formData.ifsc_code : null,
      upi_id: formData.selected_tab === "upi" ? formData.upi_id : null,
    };

    setIsLoading(true);

    try {
      const response = await axios.post(
        `https://ludotest.pythonanywhere.com/api/create-withdrawal/${walletId}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            // Add any necessary authorization headers here
          },
        }
      );

      console.log("Withdrawal request successful:", response.data);
      setSnackbarOpen(true); // Show success message
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      setModalContent({
        title: "Error",
        message:
          error.response?.data?.detail ||
          "Failed to submit withdrawal request. Please try again.",
      });
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleKycRedirect = () => {
    router.push("/kyc");
  };

  if (!isKycCompleted) {
    return (
      <Container>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="medium"
              variant="outlined"
              onClick={handleKycRedirect}
              style={{ background: "#cb3232", color: "white" }}
            >
              Complete KYC
            </Button>
          }
        >
          Please complete your KYC to proceed with withdrawals.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <AppBar position="static" sx={{ bgcolor: "default" }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="withdrawal tabs"
          indicatorColor="primary"
          textColor="inherit"
          centered
        >
          <Tab
            label="UPI"
            {...a11yProps(0)}
            sx={{
              color: tabIndex === 0 ? "white" : "inherit",
              bgcolor: tabIndex === 0 ? "primary.main" : "inherit",
            }}
          />
          <Tab
            label="Bank"
            {...a11yProps(1)}
            sx={{
              color: tabIndex === 1 ? "white" : "inherit",
              bgcolor: tabIndex === 1 ? "primary.main" : "inherit",
            }}
          />
        </Tabs>
      </AppBar>
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        Note: Maximum 3 withdraw requests per day allowed
      </Alert>
      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h5" gutterBottom>
          Withdraw via UPI
        </Typography>
        <TextField
          name="account_holder_name"
          label="Account Holder Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.account_holder_name}
          onChange={handleChange}
        />
        <TextField
          name="upi_id"
          label="UPI ID"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.upi_id}
          onChange={handleChange}
        />
        <TextField
          name="withdrawal_amount"
          label="Amount"
          variant="outlined"
          fullWidth
          type="number"
          margin="normal"
          value={formData.withdrawal_amount}
          onChange={handleChange}
          sx={{
            mr: 1,
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                margin: 0,
              },
          }}
        />
        <Typography variant="body2" color="textSecondary">
          Min: ₹{minWithdraw.toFixed(2)}, Max: ₹{maxWithdraw.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Available Balance: ₹{withdrawableBalance.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "16px" }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Withdraw"
          )}
        </Button>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <Typography variant="h5" gutterBottom>
          Withdraw via Bank
        </Typography>
        <TextField
          name="account_holder_name"
          label="Account Holder Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.account_holder_name}
          onChange={handleChange}
        />
        <TextField
          name="account_number"
          label="Account Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.account_number}
          onChange={handleChange}
        />
        <TextField
          name="ifsc_code"
          label="IFSC Code"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.ifsc_code}
          onChange={handleChange}
        />
        <TextField
          name="withdrawal_amount"
          label="Amount"
          variant="outlined"
          fullWidth
          type="number"
          margin="normal"
          value={formData.withdrawal_amount}
          onChange={handleChange}
          sx={{
            mr: 1,
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                margin: 0,
              },
          }}
        />
        <Typography variant="body2" color="textSecondary">
          Min: ₹{minWithdraw.toFixed(2)}, Max: ₹
          {Math.min(maxWithdraw, withdrawableBalance).toFixed(2)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Available Balance: ₹{withdrawableBalance.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "16px" }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Withdraw"
          )}
        </Button>
      </TabPanel>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{modalContent.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{modalContent.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Withdrawal request submitted successfully!
        </Alert>
      </Snackbar>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Container>
  );
};

export default Withdraw;
