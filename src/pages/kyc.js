import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import dynamic from "next/dynamic";
import Router from "next/router";

// Dynamically import the Loader component, disabling SSR
const Loader = dynamic(() => import("@/components/Loader"), {
  ssr: false,
});

const KycForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    document_number: "",
    front_side: null,
    back_side: null,
  });
  const [userId, setUserId] = useState(null);
  const [userKycStatus, setUserKycStatus] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [frontFileName, setFrontFileName] = useState("");
  const [backFileName, setBackFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData && userData.user_details) {
      setUserId(userData.user_details.id);
      setUserKycStatus(userData.user_details.kyc_status);
    }
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({
        ...formData,
        [event.target.name]: file,
      });
      if (event.target.name === "front_side") {
        setFrontFileName(file.name);
      } else if (event.target.name === "back_side") {
        setBackFileName(file.name);
      }
    } else {
      setSnackbar({ open: true, message: "Please select a valid image file." });
    }
  };
  const homepage = () => {
    Router.push("/");
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      setSnackbar({
        open: true,
        message: "User ID not found. Please log in again.",
      });
      return;
    }

    if (
      !formData.full_name ||
      !formData.document_number ||
      !formData.front_side ||
      !formData.back_side
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all fields and upload both images.",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("full_name", formData.full_name);
    formDataToSend.append("document_number", formData.document_number);
    formDataToSend.append("front_side", formData.front_side);
    formDataToSend.append("back_side", formData.back_side);

    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/kyc/upload/${userId}/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Add any necessary authorization headers here
          },
        }
      );
      setSnackbar({ open: true, message: "KYC submitted successfully!" });

      // Reset form and file names after successful submission
      setFormData({
        full_name: "",
        document_number: "",
        front_side: null,
        back_side: null,
      });
      setFrontFileName("");
      setBackFileName("");
      setTimeout(() => {
        homepage();
      }, 2000);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      setSnackbar({
        open: true,
        message: "Failed to submit KYC. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Sidebar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "20px",
        }}
      >
        {userKycStatus !== "P" && (
          <Paper elevation={3} sx={{ p: 3, width: "80%", mx: "auto" }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Complete KYC
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="full_name"
                label="Full Name"
                name="full_name"
                placeholder="Name on document"
                value={formData.full_name}
                onChange={handleChange}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="document_number"
                label="Document Number"
                name="document_number"
                placeholder="ID proof number"
                value={formData.document_number}
                onChange={handleChange}
              />
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Document Image (Front Side)
                <input
                  type="file"
                  hidden
                  name="front_side"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Button>
              {frontFileName && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Front side file: {frontFileName}
                </Typography>
              )}
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Document Image (Back Side)
                <input
                  type="file"
                  hidden
                  name="back_side"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Button>
              {backFileName && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Back side file: {backFileName}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <Loader size={24} /> : "Submit"}
              </Button>
            </Box>
          </Paper>
        )}{" "}
        :
        <Paper elevation={3} sx={{ p: 3, width: "80%", mx: "auto" }}>
          <Typography textAlign="center">
            You have already submitted your KYC. We are currently awaiting admin
            approval. Please be patient.<br></br>
            <br></br> आपने अपना KYC पहले ही सबमिट कर दिया है। अभी प्रशासक की
            मंजूरी का इंतजार हो रहा है। कृपया प्रतीक्षा करें।
          </Typography>
        </Paper>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
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
    </>
  );
};

export default KycForm;
