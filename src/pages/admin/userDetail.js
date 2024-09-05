import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Modal,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import axios from "axios";
import dayjs from "dayjs";
import Sidebar from "@/components/admin/AdminSidebar";

const DetailLine = ({ label, value }) => (
  <Typography variant="body2">
    <span style={{ marginRight: "8px", fontWeight: "bold" }}>{label}:</span>
    {value}
  </Typography>
);

const UserDetail = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [walletHistory, setWalletHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" or "deduct"
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  }); // Snackbar state
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [userResponse, historyResponse] = await Promise.all([
          axios.get(
            `https://ludotest.pythonanywhere.com/auth/get-detailed-user-details/${id}/`
          ),
          axios.get(
            `https://ludotest.pythonanywhere.com/api/user-history/${id}/`
          ),
        ]);

        setUserDetails(userResponse.data.user_details);
        setWalletHistory(historyResponse.data.wallet_history || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch user details and history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAmount("");
    setReason("");
  };

  const handleBlock = async (userId) => {
    try {
      const response = await axios.post(
        `https://ludotest.pythonanywhere.com/panel/block/${userId}/`
      );
      console.log("Block Response:", response.data); // Log response for debugging
      if (response.status === 200 && response.data.error === false) {
        setSnackbar({
          open: true,
          message: response.data.detail || "User blocked successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.detail || "Error blocking user",
          severity: "error",
        });
      }
      // Set a timeout to reload the page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error blocking user:", error);
      setSnackbar({
        open: true,
        message: "Error blocking user",
        severity: "error",
      });
      // Set a timeout to reload the page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const response = await axios.post(
        `https://ludotest.pythonanywhere.com/panel/unblock/${userId}/`
      );
      console.log("Unblock Response:", response.data); // Log response for debugging
      if (response.status === 200 && response.data.error === false) {
        setSnackbar({
          open: true,
          message: response.data.detail || "User unblocked successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.detail || "Error unblocking user",
          severity: "error",
        });
      }
      // Set a timeout to reload the page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error unblocking user:", error);
      setSnackbar({
        open: true,
        message: "Error unblocking user",
        severity: "error",
      });
      // Set a timeout to reload the page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleAddMoney = async () => {
    if (!id || !amount) return;

    try {
      const response = await axios.post(
        `https://ludotest.pythonanywhere.com/panel/deposit/${id}/`,
        { deposit_amount: amount }
      );

      if (response.status === 200 && response.data.error === false) {
        setSnackbar({
          open: true,
          message: response.data.detail || "Operation successful",
          severity: "success",
        });
        setModalOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: response.data.detail || "Operation failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding money:", error);
      setSnackbar({
        open: true,
        message: "Error adding money",
        severity: "error",
      });
    }
  };

  const handleDeductMoney = async () => {
    if (!id || !amount || !reason) return;

    try {
      const response = await axios.post(
        `https://ludotest.pythonanywhere.com/penalty/deduct/${id}/`,
        { amount, reason }
      );

      if (response.status === 200 && response.data.error === false) {
        setSnackbar({
          open: true,
          message: response.data.detail || "Operation successful",
          severity: "success",
        });
        setModalOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: response.data.detail || "Operation failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deducting money:", error);
      setSnackbar({
        open: true,
        message: "Error deducting money",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!userDetails) return <Typography>No user details found</Typography>;

  return (
    <>
      <Sidebar />
      <Box sx={{ maxWidth: 800, margin: "auto", p: 2 }}>
        <Card elevation={3}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">{userDetails.username}</Typography>
              <Typography variant="body2" sx={{ color: "green" }}>
                active
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <DetailLine label="Id" value={userDetails.id} />
              <DetailLine label="Name" value={userDetails.name || "-"} />
              <DetailLine label="Mobile" value={userDetails.phone_number} />
              <DetailLine label="Win" value={userDetails.metric.win} />
              <DetailLine
                label="Cash"
                value={
                  userDetails.wallet.balance -
                  userDetails.wallet.withdrawable_balance
                }
              />
              <DetailLine
                label="Total Balance"
                value={userDetails.wallet.balance}
              />
              <DetailLine
                label="DOJ"
                value={dayjs(userDetails.date_joined).format("MM/DD/YYYY")}
              />
              <TextField
                label="ReferBy"
                variant="outlined"
                fullWidth
                size="small"
                value={userDetails.referrer_details || "-"}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Stack>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Actions
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
                mt: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleOpenModal("add")}
              >
                TopUp
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleOpenModal("deduct")}
              >
                Deduct Balance
              </Button>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                {userDetails.is_blocked ? (
                  // Show Unblock button if is_blocked is true
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => handleUnblock(userDetails.id)}
                  >
                    Unblock
                  </Button>
                ) : (
                  // Show Block button if is_blocked is false
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleBlock(userDetails.id)}
                  >
                    Block
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kyc Details
            </Typography>
            <Stack spacing={1}>
              <DetailLine
                label="Name"
                value={userDetails.kyc_details?.full_name || "-"}
              />
              <DetailLine
                label="Document Number"
                value={userDetails.kyc_details?.document_number || "-"}
              />
            </Stack>
            <Box
              component="img"
              sx={{
                width: "auto",
                maxWidth: "250px",
                height: "auto",
                objectFit: "cover",
                mt: 2,
                borderRadius: 1,
              }}
              alt="KYC Document"
              src={userDetails.kyc_details?.front_side}
            />
            <Typography style={{ textAlign: "center" }}>Front Side</Typography>
            <Box
              component="img"
              sx={{
                width: "auto",
                maxWidth: "250px",
                height: "auto",
                objectFit: "cover",
                mt: 2,
                borderRadius: 1,
              }}
              alt="KYC Document"
              src={userDetails.kyc_details?.back_side}
            />
            <Typography style={{ textAlign: "center" }}>Back Side</Typography>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Wallet History
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 400, overflow: "auto" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sno.</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Txn Id</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {walletHistory.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.tag}</TableCell>
                      <TableCell>{item.txn_id}</TableCell>
                      <TableCell>{item.deposit_amount}</TableCell>
                      <TableCell>
                        {dayjs(item.deposit_date).format("MM/DD/YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

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
            {modalType === "deduct" ? "Deduct Money from" : "Add Money to"}{" "}
            {userDetails?.username}
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
          {modalType === "deduct" && (
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
            onClick={
              modalType === "deduct" ? handleDeductMoney : handleAddMoney
            }
            disabled={!amount || (modalType === "deduct" && !reason)}
          >
            {modalType === "deduct" ? "Deduct Money" : "Add Money"}
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserDetail;
