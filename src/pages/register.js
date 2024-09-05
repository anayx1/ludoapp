import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    referral_code: "",
  });

  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [sentOtp, setSentOtp] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    validateForm();
  }, [formData, verified, touched]);

  useEffect(() => {
    if (router.isReady && router.query.ref) {
      setFormData((prev) => ({ ...prev, referral_code: router.query.ref }));
    }
  }, [router.isReady, router.query]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const handleOtpChange = (e) => {
    const { value } = e.target;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (touched.username && !formData.username)
      tempErrors.username = "Username is required";
    if (touched.email) {
      if (!formData.email) {
        tempErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = "Invalid email address";
      }
    }
    if (touched.phone_number) {
      if (!formData.phone_number) {
        tempErrors.phone_number = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
        tempErrors.phone_number =
          "Invalid phone number (10 digits starting with 6-9)";
      }
    }
    if (touched.otp && !verified) {
      tempErrors.otp = "Phone number not verified";
    }
    setErrors(tempErrors);
    setIsFormValid(Object.keys(tempErrors).length === 0 && verified);
  };

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone_number: "Invalid phone number",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://auth.otpless.app/auth/otp/v1/send",
        {
          phoneNumber: "91" + formData.phone_number,
          otpLength: 4,
          channel: "SMS",
          expiry: 600,
        },
        {
          headers: {
            clientId: "Y4D9B1YUZYDCPKGOMTPZDQ0HG2G3B2O4",
            clientSecret: "t4ao18a5e5srd3n1737daujd4ldrh3rx",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setOtpSent(true);
        setOtpMessage("OTP sent successfully");
        setSentOtp(response.data.orderId);
      } else {
        setOtpMessage("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpMessage("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setTouched((prevTouched) => ({ ...prevTouched, otp: true }));

    if (otp.length !== 4 || !sentOtp) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        otp: "Invalid OTP or Order ID",
      }));
      setOtpMessage("OTP verification failed");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://auth.otpless.app/auth/otp/v1/verify",
        {
          orderId: sentOtp,
          otp: otp,
          phoneNumber: "91" + formData.phone_number,
        },
        {
          headers: {
            clientId: "Y4D9B1YUZYDCPKGOMTPZDQ0HG2G3B2O4",
            clientSecret: "t4ao18a5e5srd3n1737daujd4ldrh3rx",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.isOTPVerified) {
        setVerified(true);
        setErrors((prevErrors) => ({ ...prevErrors, otp: "" }));
        setOtpMessage("OTP verified successfully");
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          otp: response.data.reason || "Invalid OTP",
        }));
        setOtpMessage("OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        otp: "Error verifying OTP",
      }));
      setOtpMessage("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      phone_number: true,
      otp: true,
      referral_code: true,
    });

    validateForm();

    if (isFormValid) {
      setIsLoading(true);
      setSnackbarMessage(""); // Clear any previous error messages
      const submissionData = {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        verified: verified,
        referral_code: formData.referral_code,
      };

      try {
        const registrationResponse = await axios.post(
          "https://admin.aoneludo.com/user/sign-up/",
          submissionData
        );
        console.log("Registration response:", registrationResponse.data);

        if (registrationResponse.data.error === false) {
          console.log("Registration successful");
          const userId = registrationResponse.data.user.id;

          try {
            const walletResponse = await axios.post(
              `https://admin.aoneludo.com/api/create-wallet/${userId}/`,
              { balance: "0.00" }
            );

            if (walletResponse.status === 201) {
              console.log("Wallet created successfully", walletResponse.data);
              router.push("/login");
            } else {
              console.error(
                "Unexpected response from wallet creation",
                walletResponse
              );
              setSnackbarMessage(
                "An unexpected error occurred. Please try again."
              );
              setSnackbarOpen(true);
            }
          } catch (walletError) {
            console.error(
              "Error during wallet creation:",
              walletError.response?.data || walletError.message
            );
            setSnackbarMessage("Failed to create wallet. Please try again.");
            setSnackbarOpen(true);
          }
        } else {
          console.error("Registration failed", registrationResponse.data);
          setSnackbarMessage("Registration failed. Please try again.");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error(
          "Error during registration:",
          error.response?.data || error.message
        );
        if (
          error.response?.data?.error === true &&
          error.response?.data?.detail?.phone_number
        ) {
          setSnackbarMessage(
            "An account with this phone number already exists. Please login."
          );
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage(
            "An error occurred during registration. Please try again."
          );
          setSnackbarOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Form validation failed");
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          backgroundColor: "black",
          color: "white",
          height: "80px",
        }}
      >
        <div>
          <img
            src={"logo_ludo.webp"}
            style={{ width: "100px", height: "auto" }}
            alt="logo"
          />
        </div>
      </div>
      <Container
        component="main"
        maxWidth="xs"
        style={{ marginBottom: "50px" }}
      >
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 3 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={touched.username && !!errors.username}
              helperText={touched.username && errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              id="referral_code"
              label="Referral Code (Optional)"
              name="referral_code"
              value={formData.referral_code}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone_number"
              label="Phone Number"
              name="phone_number"
              autoComplete="tel"
              value={formData.phone_number}
              onChange={handleChange}
              error={touched.phone_number && !!errors.phone_number}
              helperText={touched.phone_number && errors.phone_number}
            />
            <Button
              onClick={handleSendOtp}
              variant="outlined"
              disabled={!formData.phone_number || otpSent || isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : otpSent ? (
                "OTP Sent"
              ) : (
                "Send OTP"
              )}
            </Button>
            {otpMessage && (
              <Typography
                color={otpSent ? "primary" : "error"}
                variant="body2"
                sx={{ mt: 1 }}
              >
                {otpMessage}
              </Typography>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              error={touched.otp && !!errors.otp}
              helperText={touched.otp && errors.otp}
              inputProps={{ maxLength: 4 }}
              sx={{ mt: 2 }}
            />
            <Button
              onClick={handleVerifyOtp}
              variant="outlined"
              disabled={otp.length !== 4 || verified || isLoading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : verified ? (
                "Verified"
              ) : (
                "Verify OTP"
              )}
            </Button>
            {verified && (
              <Typography color="success" variant="body2" sx={{ mt: 1 }}>
                Phone number verified successfully
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{" "}
                <Link href="/login" color="primary">
                  Login
                </Link>
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                <Link href="/admin/" color="primary">
                  Admin Login
                </Link>
              </Typography>
            </div>
            {/* <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Link href="/login" color="primary">
                Login
              </Link>
            </Typography> */}
          </Box>
        </Box>
      </Container>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
};

export default Register;
