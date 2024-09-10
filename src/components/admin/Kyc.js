import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Snackbar,
  Chip,
  TextField,
} from "@mui/material";
import axios from "axios";
import { io } from "socket.io-client";
import { Router, useRouter } from "next/router";

const KYCComponent = () => {
  const [tabValue, setTabValue] = useState(0);
  const [kycData, setKycData] = useState({
    pending_kyc: [],
    approved_kyc: [],
    declined_kyc: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState(null);
  const router = useRouter(); // Add this line

  const handleNameClick = (userId) => {
    if (typeof window !== "undefined") {
      router.push({
        pathname: "/admin/userDetail",
        query: { id: userId },
      });
    }
  };
  const fetchKycData = async () => {
    try {
      const response = await axios.get(
        "https://admin.aoneludo.com/kyc/get-kyc/"
      );
      if (!response.data.error) {
        console.log("KYC Data:", response.data);
        setKycData(response.data);
      } else {
        console.error("Error fetching KYC data:", response.data.detail);
        setSnackbar({ open: true, message: "Error fetching KYC data" });
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      setSnackbar({ open: true, message: "Error fetching KYC data" });
    }
  };

  const setSocketIo = () => {
    const socketIo = io("https://socket.aoneludo.com");
    setSocket(socketIo);
    if (socketIo.connected) {
      onConnect();
    }

    function onConnect() {
      socketIo.emit("user-joined", "admin");

      socketIo.on("update-stats", () => {
        fetchKycData();
      });
    }

    function onDisconnect() {}

    socketIo.on("connect", onConnect);
    socketIo.on("disconnect", onDisconnect);
  };

  useEffect(() => {
    setSocketIo();
    fetchKycData();
    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      }
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getTabData = useMemo(() => {
    const filterData = (data) =>
      data.filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    switch (tabValue) {
      case 0:
        return filterData(kycData.pending_kyc || []);
      case 1:
        return filterData(kycData.approved_kyc || []);
      case 2:
        return filterData(kycData.declined_kyc || []);
      default:
        return [];
    }
  }, [tabValue, kycData, searchTerm]);

  const handleApprove = async (kycItem) => {
    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/kyc/approve/${kycItem.user}/${kycItem.id}/`
      );
      if (!response.data.error) {
        setSnackbar({ open: true, message: "KYC approved successfully" });
        fetchKycData();
      } else {
        console.error("Error approving KYC:", response.data.detail);
        setSnackbar({ open: true, message: "Error approving KYC" });
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      setSnackbar({ open: true, message: "Error approving KYC" });
    }
  };

  const handleDecline = async (kycItem) => {
    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/kyc/decline/${kycItem.user}/${kycItem.id}/`
      );
      if (!response.data.error) {
        setSnackbar({ open: true, message: "KYC declined successfully" });
        fetchKycData();
      } else {
        console.error("Error declining KYC:", response.data.detail);
        setSnackbar({ open: true, message: "Error declining KYC" });
      }
    } catch (error) {
      console.error("Error declining KYC:", error);
      setSnackbar({ open: true, message: "Error declining KYC" });
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "P":
        return <Chip label="Pending" color="warning" />;
      case "A":
        return <Chip label="Approved" color="success" />;
      case "D":
        return <Chip label="Declined" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  const renderImageButton = (url) => {
    console.log("Image URL:", url);
    if (url) {
      return (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        >
          View Image
        </Button>
      );
    }
    return "No image uploaded";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "95%" }}>
        <Typography
          variant="h4"
          sx={{ mb: 2, justifyContent: "center", textAlign: "center", mt: 2 }}
        >
          KYC Management
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="KYC tabs">
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Declined" />
        </Tabs>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search KYC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 2, mb: 2 }}
        />

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Document Number</TableCell>
                <TableCell>Front Side</TableCell>
                <TableCell>Back Side</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getTabData.length > 0 ? (
                getTabData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Button
                        color="primary"
                        onClick={() => handleNameClick(row.user)}
                        style={{ textTransform: "none" }}
                      >
                        {row.full_name}
                      </Button>
                    </TableCell>{" "}
                    <TableCell>{row.document_number}</TableCell>
                    <TableCell>{renderImageButton(row.front_side)}</TableCell>
                    <TableCell>{renderImageButton(row.back_side)}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell>
                      {row.status === "P" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleApprove(row)}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDecline(row)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </div>
  );
};

export default KYCComponent;
