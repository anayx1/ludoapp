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
  Modal,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import axios from "axios";
import AdminSidebar from "@/components/admin/AdminSidebar";
import CloseIcon from "@mui/icons-material/Close";
import withAdminAuth from "@/components/withAdminAuth";
import { io } from "socket.io-client";

const WithdrawalsComponent = () => {
  const [tabValue, setTabValue] = useState(0);
  const [withdrawalData, setWithdrawalData] = useState({
    pending_withdrawals: [],
    successful_withdrawals: [],
    declined_withdrawals: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [resetData, setResetData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

    const [socket, setSocket] = useState(null);

    const setSocketIo = () => {
      const socketIo = io("https://socket.aoneludo.com");
      setSocket(socketIo);
      if (socketIo.connected) {
        onConnect();
      }

      function onConnect() {
        socketIo.emit("user-joined", "admin");
        socketIo.on("withdraw-request", (data) => {
          setResetData(true);
        });
      }

      function onDisconnect() {
        
      }

      socketIo.on("connect", onConnect);
      socketIo.on("disconnect", onDisconnect);
    };

    useEffect(() => {
      setSocketIo();
      return () => {
        if (socket) {
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
        }
      };
    }, []);

  const fetchWithdrawalData = async () => {
    try {
      const response = await axios.get(
        "https://admin.aoneludo.com/panel/get-withdrawals/"
      );
      setWithdrawalData({
        pending_withdrawals: response.data.pending_withdrawals || [],
        successful_withdrawals: response.data.successful_withdrawals || [],
        declined_withdrawals: response.data.declined_withdrawals || [],
      });
    } catch (error) {
      console.error("Error fetching withdrawal data:", error);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
    setResetData(false);
  }, [resetData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getTabData = useMemo(() => {
    let data;
    switch (tabValue) {
      case 0:
        data = withdrawalData.pending_withdrawals;
        break;
      case 1:
        data = withdrawalData.successful_withdrawals;
        break;
      case 2:
        data = withdrawalData.declined_withdrawals;
        break;
      default:
        data = [];
    }

    return data.filter(
      (withdrawal) =>
        withdrawal.wallet.user.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        withdrawal.wallet.user.phone_number.includes(searchTerm) ||
        withdrawal.withdrawal_amount.toString().includes(searchTerm)
    );
  }, [tabValue, withdrawalData, resetData, searchTerm]);

  const handleApprove = async (withdrawal) => {
    try {
      const response = await axios.put(
        `https://admin.aoneludo.com/panel/approve-withdrawal/${withdrawal.wallet.id}/${withdrawal.id}/`
      );
      if (response.data.error === false) {
        console.log("Withdrawal approved successfully");
        if (socket) {
          socket.emit("balance-update", withdrawal.wallet.user.id);
        }
        setResetData(true);
      } else {
        console.error("Error approving withdrawal:", response.data.detail);
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error);
    }
  };

  const handleDecline = async (withdrawal) => {
    try {
      const response = await axios.put(
        `https://admin.aoneludo.com/panel/decline-withdrawal/${withdrawal.wallet.id}/${withdrawal.id}/`
      );
      if (response.data.error === false) {
        console.log("Withdrawal declined successfully");
        setResetData(true);
      } else {
        console.error("Error declining withdrawal:", response.data.detail);
      }
    } catch (error) {
      console.error("Error declining withdrawal:", error);
    }
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setModalOpen(true);
  };

  const rows = useMemo(
    () =>
      getTabData.map((withdrawal, index) => (
        <TableRow key={withdrawal.id}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{withdrawal.wallet.user.username}</TableCell>
          <TableCell>{withdrawal.wallet.user.phone_number}</TableCell>
          <TableCell>{withdrawal.withdrawal_amount}</TableCell>
          <TableCell>
            {new Date(withdrawal.withdrawal_date).toLocaleString()}
          </TableCell>
          <TableCell>
            {withdrawal.status === "P"
              ? "Pending"
              : withdrawal.status === "S"
              ? "Successful"
              : "Declined"}
          </TableCell>
          {tabValue === 0 && (
            <TableCell>
              <Button
                variant="outlined"
                color="info"
                onClick={() => handleViewDetails(withdrawal)}
                sx={{ mr: 1 }}
              >
                View Details
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleApprove(withdrawal)}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDecline(withdrawal)}
              >
                Decline
              </Button>
            </TableCell>
          )}
        </TableRow>
      )),
    [getTabData, tabValue]
  );

  const renderDetailsModal = () => (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      aria-labelledby="withdrawal-details-modal"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            aria-label="close"
            onClick={() => setModalOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Withdrawal Details
          </Typography>
        </div>
        {selectedWithdrawal && (
          <List>
            <ListItem>
              <ListItemText
                primary="Username"
                secondary={selectedWithdrawal.wallet.user.username}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Mobile Number"
                secondary={selectedWithdrawal.wallet.user.phone_number}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Withdrawal Amount"
                secondary={selectedWithdrawal.withdrawal_amount}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Withdrawal Date"
                secondary={new Date(
                  selectedWithdrawal.withdrawal_date
                ).toLocaleString()}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="UPI ID"
                secondary={selectedWithdrawal.upi_id || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="IFSC Code"
                secondary={selectedWithdrawal.ifsc_code || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Account Number"
                secondary={selectedWithdrawal.account_number || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Account Holder Name"
                secondary={selectedWithdrawal.account_holder_name || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Mode"
                secondary={selectedWithdrawal.selected_tab}
              />
            </ListItem>
          </List>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            onClick={() => setModalOpen(false)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  return (
    <>
      <AdminSidebar />
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
            sx={{ mb: 2, mt: 2, justifyContent: "center", textAlign: "center" }}
          >
            Withdrawals
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Withdrawal tabs"
          >
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Declined" />
          </Tabs>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by username, phone number, or amount..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mt: 2, mb: 2 }}
          />

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr No.</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  {tabValue === 0 && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {getTabData.length > 0 ? (
                  rows
                ) : (
                  <TableRow>
                    <TableCell colSpan={tabValue === 0 ? 7 : 6} align="center">
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
      {renderDetailsModal()}
    </>
  );
};

export default withAdminAuth(WithdrawalsComponent);
