import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  TextField,
  Modal,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import AdminSidebar from "@/components/admin/AdminSidebar";
import withAdminAuth from "@/components/withAdminAuth";
import { io } from "socket.io-client";
import { useRouter } from "next/router";


const DepositComponent = () => {
  const [tabValue, setTabValue] = useState(0);
  const [depositData, setDepositData] = useState({
    pending_deposits: [],
    successful_deposits: [],
    failed_deposits: [],
    admin_deposits: [],
  });
  const [userData, setUserData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [modalType, setModalType] = useState("credit");

  const [socket, setSocket] = useState(null);
  const router = useRouter();

  const handleViewDetails = (userId) => {
    router.push({
      pathname: "/admin/userDetail",
      query: { id: userId },
    });
  };
  const setSocketIo = () => {
    const socketIo = io("https://socket.aoneludo.com");
    setSocket(socketIo);
    if (socketIo.connected) {
      onConnect();
    }

    function onConnect() {
      socketIo.emit("user-joined", "admin");
      socketIo.on("deposit-request", (data) => {
        fetchDepositData();
      });
    }

    function onDisconnect() {}

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

  const fetchDepositData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://admin.aoneludo.com/panel/get-deposits/"
      );
      setDepositData({
        pending_deposits: response.data.pending_deposits || [],
        successful_deposits: response.data.successful_deposits || [],
        failed_deposits: [],
        admin_deposits: [],
      });
    } catch (error) {
      console.error("Error fetching deposit data:", error);
      setSnackbar({ open: true, message: "Error fetching deposit data" });
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://admin.aoneludo.com/panel/get-users/"
      );
      setUserData(response.data.users || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setSnackbar({ open: true, message: "Error fetching user data" });
    }
  }, []);

  useEffect(() => {
    fetchDepositData();
    fetchUserData();
  }, [fetchDepositData, fetchUserData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm("");
  };

  const getTabData = useMemo(() => {
    const filterData = (data) =>
      data.filter((item) => {
        const userString = item.wallet.user.username;
        const phoneNumber = item.wallet.user.phone_number;
        return (
          userString.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toString().includes(searchTerm) ||
          phoneNumber.includes(searchTerm)
        );
      });

    switch (tabValue) {
      case 0:
        return filterData(depositData.pending_deposits);
      case 1:
        return filterData(depositData.successful_deposits);
      case 2:
        return filterData(depositData.failed_deposits);
      case 3:
      case 4:
        return userData.filter(
          (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone_number.includes(searchTerm) ||
            user.id.toString().includes(searchTerm)
        );
      default:
        return [];
    }
  }, [tabValue, depositData, userData, searchTerm]);

  const handleApprove = async (deposit) => {
    try {
      const response = await axios.put(
        `https://admin.aoneludo.com/panel/approve-deposits/${deposit.wallet.id}/${deposit.id}/`
      );

      if (response.data.error === false) {
        setDepositData((prevData) => ({
          ...prevData,
          pending_deposits: prevData.pending_deposits.filter(
            (d) => d.id !== deposit.id
          ),
          successful_deposits: [
            ...prevData.successful_deposits,
            { ...deposit, status: "S" },
          ],
        }));
        if (socket) {
          socket.emit("balance-update", deposit.wallet.user.id);
        }
        setSnackbar({ open: true, message: "Deposit approved successfully" });
      } else if (
        response.data.message === "Deposit is already done to the wallet"
      ) {
        setDepositData((prevData) => ({
          ...prevData,
          pending_deposits: prevData.pending_deposits.filter(
            (d) => d.id !== deposit.id
          ),
          successful_deposits: prevData.successful_deposits.some(
            (d) => d.id === deposit.id
          )
            ? prevData.successful_deposits
            : [...prevData.successful_deposits, { ...deposit, status: "S" }],
        }));
        setSnackbar({ open: true, message: response.data.message });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Error approving deposit",
        });
      }
    } catch (error) {
      console.error("Error approving deposit:", error);
      setSnackbar({ open: true, message: "Error approving deposit" });
    }
  };

  const handleDecline = async (deposit) => {
    try {
      const response = await axios.put(
        `https://admin.aoneludo.com/panel/decline-deposits/${deposit.wallet.id}/${deposit.id}/`
      );

      if (response.data.error === false) {
        setDepositData((prevData) => ({
          ...prevData,
          pending_deposits: prevData.pending_deposits.filter(
            (d) => d.id !== deposit.id
          ),
          failed_deposits: [
            ...prevData.failed_deposits,
            { ...deposit, status: "F" },
          ],
        }));
        setSnackbar({ open: true, message: "Deposit declined successfully" });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Error declining deposit",
        });
      }
    } catch (error) {
      console.error("Error declining deposit:", error);
      setSnackbar({ open: true, message: "Error declining deposit" });
    }
  };

  const handleOpenModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setModalOpen(true);
    setAmount("");
    setReason("");
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setAmount("");
    setReason("");
  };

  const handleAddMoney = async () => {
    if (!selectedUser || !amount) return;

    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/panel/deposit/${selectedUser.id}/`,
        { deposit_amount: amount }
      );

      if (response.data.error === false) {
        setSnackbar({ open: true, message: "Money added successfully" });
        handleCloseModal();
        fetchUserData();
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Error adding money",
        });
      }
    } catch (error) {
      console.error("Error adding money:", error);
      setSnackbar({ open: true, message: "Error adding money" });
    }
  };

  const handleDeductMoney = async () => {
    if (!selectedUser || !amount || !reason) return;

    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/penalty/deduct/${selectedUser.id}/`,
        { amount, reason }
      );

      if (response.data.error === false) {
        setSnackbar({ open: true, message: "Money deducted successfully" });
        handleCloseModal();
        fetchUserData();
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Error deducting money",
        });
      }
    } catch (error) {
      console.error("Error deducting money:", error);
      setSnackbar({ open: true, message: "Error deducting money" });
    }
  };

  const renderTableRow = (item, index) => {
    if (tabValue === 3 || tabValue === 4) {
      // Admin and Credit tabs
      return (
        <TableRow key={item.id}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>
          <span
            onClick={() => handleViewDetails(item.id)}
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
          >
            {item.username}
          </span>
        </TableCell>          <TableCell>{item.phone_number}</TableCell>
          <TableCell>{item.email}</TableCell>
          <TableCell>
            <Button
              variant="contained"
              color={tabValue === 3 ? "secondary" : "primary"}
              onClick={() =>
                handleOpenModal(item, tabValue === 3 ? "admin" : "credit")
              }
            >
              {tabValue === 3 ? "Deduct Money" : "Add Money"}
            </Button>
          </TableCell>
        </TableRow>
      );
    } else {
      // Other tabs (deposits)
      return (
        <TableRow key={item.id}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>
          <span
            onClick={() => handleViewDetails(item.id)}
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
          >
            {item.wallet.user.username}
          </span>
        </TableCell>
          <TableCell>{item.wallet.user.phone_number}</TableCell>
          <TableCell>{item.deposit_amount}</TableCell>
          <TableCell>{new Date(item.deposit_date).toLocaleString()}</TableCell>
          <TableCell>
            {item.status === "P" ? "Pending" : "Successful"}
          </TableCell>
          <TableCell>
            {item.proof_screenshot_url && (
              <a
                href={item.proof_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Proof
              </a>
            )}
          </TableCell>
          <TableCell>{item.utr_id || "N/A"}</TableCell>
          {tabValue === 0 && (
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleApprove(item)}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDecline(item)}
              >
                Decline
              </Button>
            </TableCell>
          )}
        </TableRow>
      );
    }
  };

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
            sx={{ mb: 2, justifyContent: "center", textAlign: "center", mt: 2 }}
          >
            Deposits
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Deposit tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Pending" />
            <Tab label="Successful" />
            <Tab label="Failed" />
            <Tab label="Penalty" />
            <Tab label="Credit" />
          </Tabs>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by username, phone number, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {tabValue === 3 || tabValue === 4 ? (
                    <>
                      <TableCell>S.No</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Action</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>S.No</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Proof</TableCell>
                      <TableCell>UTR</TableCell>
                      {tabValue === 0 && <TableCell>Action</TableCell>}
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {getTabData.length > 0 ? (
                  getTabData.map((item, index) => renderTableRow(item, index))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        tabValue === 3 || tabValue === 4
                          ? 5
                          : tabValue === 0
                          ? 9
                          : 8
                      }
                      align="center"
                    >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="money-modal"
        aria-describedby="modal-to-add-or-deduct-money-from-user"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 280,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {modalType === "admin" ? "Deduct Money from" : "Add Money to"}{" "}
            {selectedUser?.username}
          </Typography>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
            sx={{ mt: 2, mb: 2 }}
          />
          {modalType === "admin" && (
            <TextField
              fullWidth
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={modalType === "admin" ? handleDeductMoney : handleAddMoney}
            disabled={!amount || (modalType === "admin" && !reason)}
          >
            {modalType === "admin" ? "Deduct Money" : "Add Money"}
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default withAdminAuth(DepositComponent);
