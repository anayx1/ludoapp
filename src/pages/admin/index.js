import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";

const LoginFormAdmin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.username)
      tempErrors.username = "Phone number or username is required";
    if (!formData.password) tempErrors.password = "Password is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios({
          method: "post",
          url: "https://admin.aoneludo.com/auth/login",
          data: formData,
          headers: { "Content-Type": "application/json" },
        });

        if (
          response.status === 200 ||
          response.data.message === "Valid login"
        ) {
          // Successful login
          console.log("Login successful");

          // Store response in cookies
          const userData = JSON.stringify(response.data);
          Cookies.set("userData", userData, { expires: 7 }); // Expires in 7 days

          // Log cookie data
          const cookieData = Cookies.get("userData");
          const decodedCookieData = cookieData
            ? JSON.parse(decodeURIComponent(cookieData))
            : null;
          console.log("Stored and decoded cookie data:", decodedCookieData);

          // Redirect to admin dashboard
          router.push("/admin/dashboard");
        } else {
          // Handle unsuccessful login
          console.log("Login failed");
          setErrors({ general: "Invalid credentials. Please try again." });
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({ general: "An error occurred. Please try again later." });
      }
    } else {
      console.log("Form validation failed");
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
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
            Admin Login
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            {errors.general && (
              <Typography color="error" align="center">
                {errors.general}
              </Typography>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="tel username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Log In
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default LoginFormAdmin;