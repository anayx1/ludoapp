import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Container,
  Paper,
  Grid,
  Button,
  Snackbar,
  Input,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Sidebar from "@/components/admin/AdminSidebar";
import withAdminAuth from "@/components/withAdminAuth";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    admin_percentage: "",
    referral_commission: "",
    min_withdraw: "",
    max_withdraw: "",
    min_deposit: "",
    max_deposit: "",
    upi_name: "",
    upi_id: "",
    whatsapp_number: "",
  });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [upiQrFile, setUpiQrFile] = useState(null);

  useEffect(() => {
    fetchAdminDetails();
    fetchMaintenanceStatus();
  }, []);

  const toDecimal = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) {
      return value;
    }
    if (Number.isInteger(num) || !num.toString().includes(".")) {
      return num.toFixed(1);
    }
    return num.toString();
  };

  const fetchAdminDetails = async () => {
    try {
      const response = await fetch(
        "https://admin.aoneludo.com/panel/get-admin-details/5/"
      );
      if (response.ok) {
        const data = await response.json();
        setSettings({
          admin_percentage: toDecimal(data.admin_percentage),
          referral_commission: toDecimal(data.referral_commission),
          min_withdraw: toDecimal(data.min_withdraw),
          max_withdraw: toDecimal(data.max_withdraw),
          min_deposit: toDecimal(data.min_deposit),
          max_deposit: toDecimal(data.max_deposit),
          upi_name: data.upi_name,
          upi_id: data.upi_id,
          whatsapp_number: data.whatsapp_number,
        });
      } else {
        console.error("Failed to fetch admin details");
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  };

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch(
        "https://admin.aoneludo.com/maintainance/check/"
      );
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.maintenance);
      } else {
        console.error("Failed to fetch maintenance status");
      }
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
    }
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings({ ...settings, [setting]: event.target.value });
  };

  const handleFileChange = (event) => {
    setUpiQrFile(event.target.files[0]);
  };

  const updateSettings = async () => {
    try {
      const response = await fetch(
        "https://admin.aoneludo.com/panel/update-settings/5/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_percentage: settings.admin_percentage,
            referral_commission: settings.referral_commission,
            max_deposit: settings.max_deposit,
            min_deposit: settings.min_deposit,
            max_withdraw: settings.max_withdraw,
            min_withdraw: settings.min_withdraw,
            upi_id: settings.upi_id,
            upi_name: settings.upi_name,
            upi_qr: "",
          }),
        }
      );
      if (response.ok) {
        setSnackbar({ open: true, message: "Settings updated successfully" });
        fetchAdminDetails();
      } else {
        setSnackbar({ open: true, message: "Failed to update settings" });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setSnackbar({ open: true, message: "Error updating settings" });
    }
  };

  const handleUpdateUpi = async () => {
    try {
      const formData = new FormData();
      formData.append("upi_id", settings.upi_id);
      formData.append("upi_name", settings.upi_name);
      if (upiQrFile) {
        formData.append("upi_qr", upiQrFile);
      }

      const response = await fetch(
        `https://admin.aoneludo.com/panel/update-upi/5/`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "UPI details updated successfully",
        });
        fetchAdminDetails();
      } else {
        setSnackbar({ open: true, message: "Failed to update UPI details" });
      }
    } catch (error) {
      console.error("Error updating UPI details:", error);
      setSnackbar({ open: true, message: "Error updating UPI details" });
    }
  };

  const handleUpdateWhatsapp = async () => {
    try {
      const response = await fetch(
        `https://admin.aoneludo.com/panel/update-whatsapp-number/5/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            whatsapp_number: settings.whatsapp_number,
          }),
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "WhatsApp number updated successfully",
        });
        fetchAdminDetails();
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update WhatsApp number",
        });
      }
    } catch (error) {
      console.error("Error updating WhatsApp number:", error);
      setSnackbar({ open: true, message: "Error updating WhatsApp number" });
    }
  };

  const handleMaintenanceToggle = async () => {
    const newMaintenanceState = !maintenanceMode;
    const url = newMaintenanceState
      ? "https://admin.aoneludo.com/maintainance/turn-on/"
      : "https://admin.aoneludo.com/maintainance/turn-off/";

    try {
      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        setMaintenanceMode(newMaintenanceState);
        setSnackbar({
          open: true,
          message: `Maintenance mode ${
            newMaintenanceState ? "activated" : "deactivated"
          }`,
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update maintenance mode",
        });
      }
    } catch (error) {
      console.error("Error updating maintenance mode:", error);
      setSnackbar({ open: true, message: "Error updating maintenance mode" });
    }
  };

  return (
    <>
      <Sidebar />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Admin Commission (%)"
              value={settings.admin_percentage}
              onChange={handleSettingChange("admin_percentage")}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Refer Commission (%)"
              value={settings.referral_commission}
              onChange={handleSettingChange("referral_commission")}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Min Withdraw"
              value={settings.min_withdraw}
              onChange={handleSettingChange("min_withdraw")}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Max Withdraw"
              value={settings.max_withdraw}
              onChange={handleSettingChange("max_withdraw")}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Min Deposit"
              value={settings.min_deposit}
              onChange={handleSettingChange("min_deposit")}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Max Deposit"
              value={settings.max_deposit}
              onChange={handleSettingChange("max_deposit")}
              margin="normal"
              type="number"
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={updateSettings}
            >
              Update Settings
            </Button>

            <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="UPI Name"
                    value={settings.upi_name}
                    onChange={handleSettingChange("upi_name")}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="UPI ID"
                    value={settings.upi_id}
                    onChange={handleSettingChange("upi_id")}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    fullWidth
                    inputProps={{ accept: "image/*" }}
                  />
                  <Typography variant="caption" display="block" gutterBottom>
                    Upload UPI QR Code Image
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleUpdateUpi}
                  >
                    Update UPI Details
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <TextField
              fullWidth
              label="WhatsApp Number"
              value={settings.whatsapp_number}
              onChange={handleSettingChange("whatsapp_number")}
              margin="normal"
            />
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
              onClick={handleUpdateWhatsapp}
            >
              Update WhatsApp
            </Button>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={maintenanceMode}
                onChange={handleMaintenanceToggle}
                color="primary"
              />
            }
            label="Maintenance Mode"
            sx={{ mt: 2,mb:10 }}
          />
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default withAdminAuth(SettingsPage);
