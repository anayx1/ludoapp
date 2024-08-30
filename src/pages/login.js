import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Step,
  Stepper,
  StepLabel,
} from "@mui/material";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import Cookies from "js-cookie";

const LoginForm = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [verified, setVerified] = useState(false);

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value.replace(/^(\+91|0)/, "").slice(0, 10));
  };

  const handleOtpChange = (e) => {
    const { value } = e.target;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const generateOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError("Invalid phone number (10 digits starting with 6-9)");
      return;
    }

    try {
      const response = await axios.post(
        "https://auth.otpless.app/auth/otp/v1/send",
        {
          phoneNumber: "91" + phoneNumber,
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
        setOrderId(response.data.orderId);
        setActiveStep(1);
        setError("");
      } else {
        setOtpMessage("Failed to send OTP");
        setError("Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP generation error:", error);
      setError("Failed to generate OTP. Please try again.");
      setOtpMessage("Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 4 || !orderId) {
      setError("Invalid OTP or Order ID");
      setOtpMessage("OTP verification failed");
      return;
    }

    try {
      const response = await axios.post(
        "https://auth.otpless.app/auth/otp/v1/verify",
        {
          orderId: orderId,
          otp: otp,
          phoneNumber: "91" + phoneNumber,
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
        setError("");
        setOtpMessage("OTP verified successfully");
        // Send POST request to backend
        try {
          const backendResponse = await axios.post(
            `https://ludotest.pythonanywhere.com/auth/verify-otp/`,
            {
              phone_number: phoneNumber,
              verify_status: true,
            }
          );

          // Store the backend response in session storage
          const userData = JSON.stringify(backendResponse.data);
          sessionStorage.setItem("userData", userData);

          // Store the backend response in cookies
          Cookies.set("userData", userData, { expires: 7 }); // Expires in 7 days

          console.log(
            "Stored session data:",
            sessionStorage.getItem("userData")
          );

          // Retrieve and decode cookie data
          const cookieData = Cookies.get("userData");
          const decodedCookieData = cookieData
            ? JSON.parse(decodeURIComponent(cookieData))
            : null;
          console.log("Stored and decoded cookie data:", decodedCookieData);

          // Redirect to home page or dashboard
          router.push("/");
        } catch (backendError) {
          console.error("Backend verification error:", backendError);
          setError("Please register first.");
        }
      } else {
        // Handle the case of incorrect OTP
        setError("Incorrect OTP. Please try again.");
        setOtpMessage("OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response && error.response.data) {
        // Check if the error response matches the specific case
        if (
          error.response.data.isOTPVerified === false &&
          error.response.data.reason === "Invalid Request"
        ) {
          setError("Incorrect OTP. Please try again.");
        } else {
          setError(
            error.response.data.reason ||
              "Failed to verify OTP. Please try again."
          );
        }
      } else {
        setError("Failed to verify OTP. Please try again.");
      }
      setOtpMessage("Error verifying OTP");
    }
  };

  // Function to retrieve and decode cookie data
  const getDecodedCookieData = () => {
    const cookieData = Cookies.get("userData");
    return cookieData ? JSON.parse(decodeURIComponent(cookieData)) : null;
  };

  const steps = ["Enter Phone Number", "Enter OTP"];

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
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Login to Aoneludo
          </Typography>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ mt: 3, mb: 3, width: "100%" }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 1, width: "100%" }}>
            {error && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {activeStep === 0 ? (
              <>
                <Typography sx={{ mb: 2 }}>
                  Aoneludo will send a One time SMS to verify your phone number
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phoneNumber"
                  label="Mobile no."
                  name="phoneNumber"
                  autoComplete="tel"
                  autoFocus
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  inputProps={{ maxLength: 10 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, background: "black" }}
                  onClick={generateOtp}
                  disabled={otpSent}
                >
                  {otpSent ? "OTP Sent" : "CONTINUE"}
                </Button>
              </>
            ) : (
              <>
                <Typography sx={{ mb: 2 }}>
                  Please enter the verification code sent to +91 ******
                  {phoneNumber.slice(-2)}
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="otp"
                  label="Enter Verification code"
                  name="otp"
                  autoComplete="one-time-code"
                  autoFocus
                  value={otp}
                  onChange={handleOtpChange}
                  inputProps={{ maxLength: 4 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, background: "black" }}
                  onClick={verifyOtp}
                  disabled={otp.length !== 4 || verified}
                >
                  {verified ? "Verified" : "VERIFY"}
                </Button>
              </>
            )}
            {otpMessage && (
              <Typography
                color={otpSent ? "primary" : "error"}
                variant="body2"
                sx={{ mt: 1 }}
              >
                {otpMessage}
              </Typography>
            )}
          </Box>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{ mt: 2, fontSize: "18px" }}
            >
              New user?{" "}
              <Link href="/register" color="primary">
                Register
              </Link>
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <Link href="/admin/" color="primary">
                Admin Login
              </Link>
            </Typography>
          </div>
        </Box>
      </Container>
    </>
  );
};

export default LoginForm;
