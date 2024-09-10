import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dynamic from "next/dynamic";

// Dynamically import the Loader component, disabling SSR
const Loader = dynamic(() => import("@/components/Loader"), {
  ssr: false,
});

const AddCash = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [utrId, setUtrId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [walletId, setWalletId] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [minDeposit, setMinDeposit] = useState("50.00"); // Default value
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  const setSocketIo = (socketIo) => {
    setSocket(socketIo);
  };

  const socketIo = typeof window !== "undefined" && window.socket;
  useEffect(() => {
    if (socketIo) {
      setSocketIo(socketIo);
    }
  }, [socketIo]);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (userData && userData.user_details && userData.user_details.wallet) {
      setWalletId(userData.user_details.wallet.wallet_id);
    }

    setUserId(
      userData && userData.user_details ? userData.user_details.id : ""
    );

    const fetchAdminDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://admin.aoneludo.com/panel/get-admin-details/5/"
        );
        const { upi_id, upi_qr_url, min_deposit } = response.data;
        setUpiId(upi_id);
        setQrUrl(upi_qr_url);
        setMinDeposit(min_deposit);
      } catch (error) {
        console.error("Error fetching admin details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
      if (parseFloat(value) < parseFloat(minDeposit)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          amount: `Minimum deposit amount is ₹${minDeposit}`,
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, amount: null }));
      }
    }
  };

  const handleUtrChange = (event) => {
    setUtrId(event.target.value);
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setScreenshot(file);
      setErrors((prevErrors) => ({ ...prevErrors, screenshot: null }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        screenshot: "File must be a PNG or JPEG",
      }));
      setScreenshot(null);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!amount || !screenshot || !walletId || !utrId) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        amount: !amount ? "Amount is required" : null,
        utrId: !utrId ? "UTR ID is required" : null,
        screenshot: !screenshot ? "Screenshot is required" : null,
        general: !walletId ? "Wallet ID not found" : null,
      }));
      return;
    }

    if (parseFloat(amount) < parseFloat(minDeposit)) {
      setModalContent({
        title: "Error",
        message: `Minimum deposit amount is ₹${minDeposit}. Please enter a higher amount.`,
      });
      setOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("deposit_amount", amount);
    formData.append("proof_screenshot", screenshot);
    formData.append("utr_id", utrId);

    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/api/create-deposit/${walletId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.error === false) {
        if (socket) {
          socket.emit("deposit-request", userId);
        }
        setModalContent({
          title: "Success",
          message: "Deposit request is submitted successfully.",
        });
        setOpen(true);
      } else {
        setModalContent({
          title: "Error",
          message:
            response.data.message || "Error submitting form. Please try again.",
        });
        setOpen(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setModalContent({
        title: "Error",
        message: "Error submitting form. Please try again.",
      });
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    if (modalContent.title === "Success") {
      router.push("/");
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied to clipboard!");
  };

  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        marginTop: "5%",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          boxShadow:
            "0 6.4px 14.4px 0 rgb(0 0 0 / 13%), 0 1.2px 3.6px 0 rgb(0 0 0 / 11%)",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            maxWidth: "400px",
            margin: "auto",
          }}
        >
          {step === 1 && (
            <>
              <Typography variant="h5" component="h1" gutterBottom>
                Add Money
              </Typography>
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <img src={qrUrl} height={200} width={200} alt="qr" />
                  <Typography variant="h6" component="h4" gutterBottom>
                    OR
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h4"
                      gutterBottom
                      style={{ cursor: "pointer" }}
                      onClick={handleCopyUPI}
                    >
                      {upiId || "Loading..."}
                    </Typography>
                    <ContentCopyIcon
                      onClick={handleCopyUPI}
                      style={{
                        marginLeft: "8px",
                        fontSize: "1rem",
                        marginTop: "-3px",
                      }}
                    />
                  </div>
                </>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                fullWidth
                style={{ marginTop: "16px", background: "black" }}
                disabled={isLoading}
              >
                Next
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                sx={{ textAlign: "center" }}
              >
                Enter Amount and Upload Screenshot
              </Typography>
              <TextField
                variant="outlined"
                placeholder="Enter amount"
                value={amount}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.amount}
                helperText={errors.amount}
              />
              <Typography variant="body2" color="textSecondary">
                Minimum amount ₹{minDeposit}
              </Typography>
              <TextField
                variant="outlined"
                placeholder="Enter UTR ID"
                value={utrId}
                onChange={handleUtrChange}
                fullWidth
                margin="normal"
                error={!!errors.utrId}
                helperText={errors.utrId}
              />
              <input
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                id="raised-button-file"
                type="file"
                onChange={handleScreenshotChange}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  fullWidth
                  style={{ marginTop: "16px", background: "black" }}
                >
                  Upload Screenshot
                </Button>
              </label>
              {errors.screenshot && (
                <Typography color="error" align="center">
                  {errors.screenshot}
                </Typography>
              )}
              {errors.general && (
                <Typography color="error" align="center">
                  {errors.general}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                fullWidth
                style={{ marginTop: "50px", background: "black" }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                fullWidth
                style={{
                  marginTop: "16px",
                  background: "black",
                  color: "white",
                }}
                disabled={!amount || !screenshot || !utrId || isLoading}
              >
                {isLoading ? (
                  <Loader size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </>
          )}
        </Box>
      </div>

      {/* Modal for both success and error messages */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{modalContent.title}</DialogTitle>
        <DialogContent>
          <Typography>{modalContent.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

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
          <Loader size={60} />
        </Box>
      )}
    </section>
  );
};

export default AddCash;
