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
  Grid,
} from "@mui/material";
import { useRouter } from "next/router";
import axios from "axios";
import dayjs from "dayjs";
import Sidebar from "@/components/admin/AdminSidebar";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";
import { useSocketContext } from "@/context/SocketProvider";

// Dynamically import the Loader component, disabling SSR
const Loader = dynamic(() => import("@/components/Loader"), {
  ssr: false,
});

const BattleModal = ({ isOpen, onClose, selectedChallenge }) => {
  // const handleWinnerChange = (event) => {
  //   setSelectedWinner(event.target.value);
  // };

  // const handleSubmitResult = async () => {
  //   if (!selectedChallenge || !selectedWinner) return;

  //   try {
  //     await axios.put(
  //       `https://admin.aoneludo.com/panel/approve-room-results/${selectedChallenge.room.room_id}/${selectedWinner}/`
  //     );
  //     onClose();
  //     refreshChallenges();
  //   } catch (error) {
  //     console.error("Error submitting result:", error);
  //   }
  // };

  // const handleCancelBattle = async () => {
  //   if (!selectedChallenge) return;

  //   try {
  //     await axios.post(
  //       `https://admin.aoneludo.com/api/cancel-challenge/${selectedChallenge.challenge_id}/`
  //     );
  //     onClose();
  //     refreshChallenges();
  //   } catch (error) {
  //     console.error("Error cancelling battle:", error);
  //   }
  // };

  if (!selectedChallenge) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="challenge-details-modal"
      aria-describedby="challenge-details-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Id: {selectedChallenge.challenge_id}
        </Typography>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <Grid item xs={5} container direction="column" alignItems="center">
            <img src={"/a1.svg"} alt="Avatar" width="50" height="50" />
            <Typography variant="subtitle2">
              {selectedChallenge.created_by.username}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h6" align="center">
              V/S
            </Typography>
          </Grid>
          <Grid item xs={5} container direction="column" alignItems="center">
            <img src={"/a2.svg"} alt="Avatar" width="50" height="50" />
            <Typography variant="subtitle2">
              {selectedChallenge.opponent
                ? selectedChallenge.opponent.username
                : "Waiting"}
            </Typography>
          </Grid>
        </Grid>
        {/* <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Actions
          </Typography>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid item xs={6}>
              <Select
                fullWidth
                value={selectedWinner}
                onChange={handleWinnerChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return "Select Winner";
                  }
                  const winner =
                    selected === selectedChallenge.created_by.id
                      ? selectedChallenge.created_by
                      : selectedChallenge.opponent;
                  return winner ? winner.username : "";
                }}
              >
                <MenuItem value={selectedChallenge.created_by.id}>
                  {selectedChallenge.created_by.username}
                </MenuItem>
                {selectedChallenge.opponent && (
                  <MenuItem value={selectedChallenge.opponent.id}>
                    {selectedChallenge.opponent.username}
                  </MenuItem>
                )}
              </Select>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmitResult}
                disabled={!selectedWinner}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleCancelBattle}
          >
            Cancel Battle
          </Button>
        </Box> */}
        <Typography variant="h6" gutterBottom>
          Battle Info
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography>Status</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {selectedChallenge.status === "O"
                ? "Open"
                : selectedChallenge.status === "R"
                ? "Running"
                : selectedChallenge.status === "C"
                ? "Closed"
                : "Pending"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Room Code</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{selectedChallenge?.room?.room_id}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Amount</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{selectedChallenge.room.room_amount}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Prize</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {Number(selectedChallenge.room.room_amount) * 1.95}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Admin Commission</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>5</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Refer Commission</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>-</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Date & Time</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {selectedChallenge.room_result?.timestamp
                ? dayjs(selectedChallenge.room_result.timestamp).format(
                    "MM/DD/YYYY hh:mm:ss A"
                  )
                : "-"}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mt: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">Creator</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  window.open(
                    selectedChallenge.room_result?.creator_screenshot,
                    "_blank"
                  )
                }
                disabled={!selectedChallenge.room_result?.creator_screenshot}
              >
                View
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography>Id</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{selectedChallenge.created_by.id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Name</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{selectedChallenge.created_by.username}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Mobile</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.created_by.phone_number}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Cash</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>0.0</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Win</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>0.5</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Status</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.room_result?.creator_status || "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Cancellation Reason</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.creator_cancellation_reason || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ mt: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">Joiner</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  window.open(
                    selectedChallenge.room_result?.opponent_screenshot,
                    "_blank"
                  )
                }
                disabled={!selectedChallenge.room_result?.opponent_screenshot}
              >
                View
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography>Id</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.opponent
                  ? selectedChallenge.opponent.id
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Name</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.opponent
                  ? selectedChallenge.opponent.username
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Mobile</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.opponent
                  ? selectedChallenge.opponent.phone_number
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Cash</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>0.0</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Win</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>-</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Status</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.room_result?.opponent_status || "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Cancellation Reason</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {selectedChallenge.opponent_cancellation_reason || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ mt: 4, width: "100%" }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};
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
  const [modalType, setModalType] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [detailsModalOpen, setdetailsModalOpen] = useState(false);
  const [winningChallange, setWinningChallange] = useState();
  const [winningChallangeData, setWinningChallangeData] = useState();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const {socket} = useSocketContext();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "succezss",
  });
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [userResponse, historyResponse, battleResponse] =
          await Promise.all([
            axios.get(
              `https://admin.aoneludo.com/auth/get-detailed-user-details/${id}/`
            ),
            axios.get(`https://admin.aoneludo.com/api/user-history/${id}/`),
            axios.get(`https://admin.aoneludo.com/api/battle-history/${id}/`),
          ]);

        setUserDetails(userResponse.data.user_details);

        // Merge and process wallet history
        const mergedHistory = processWalletHistory(
          historyResponse.data,
          battleResponse.data,
          historyResponse.data.penalty_history,
          historyResponse.data.withdrawal_history
        );
        setWalletHistory(mergedHistory);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch user details and history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);
  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!selectedChallenge) return;

      try {
        const response = await axios.get(
          `https://admin.aoneludo.com/panel/get-challenge-details/${selectedChallenge}/`
        );

        setWinningChallangeData(response?.data.challenge);
      } catch (error) {
        console.error("Error fetching challenge data:", error);
        setError("Failed to fetch challenge details. Please try again.");
      }
    };

    fetchChallengeData();
  }, [selectedChallenge]);

  const processWalletHistory = (
    walletData,
    battleData,
    penaltyData,
    withdrawalData
  ) => {
    let history = [...walletData.wallet_history];

    // Add lost battles to history
    battleData.lost_history?.forEach((lost) => {
      history.push({
        deposit_amount: lost.lost_amount,
        deposit_date: lost.timestamp,
        status: "Successful",
        tag: "Lost",
        challenge_id: lost.challenge_id,
        closing_balance: lost.closing_balance,
      });
    });

    // Add penalty history to wallet history
    penaltyData.forEach((penalty) => {
      history.push({
        deposit_amount: penalty.amount,
        deposit_date: penalty.created_at,
        status: "Successful",
        tag: "Penalty",
        challenge_id: null,
        reason: penalty.reason,
        closing_balance: penalty.closing_balance,
      });
    });

    // Add withdrawal history to wallet history
    withdrawalData.forEach((withdrawal) => {
      history.push({
        deposit_amount: withdrawal.withdrawal_amount,
        deposit_date: withdrawal.withdrawal_date,
        status: withdrawal.status,
        tag: "Withdrawal",
        challenge_id: null,
        closing_balance: parseFloat(withdrawal.closing_balance),
      });
    });

    // Sort history by date
    history.sort((a, b) => new Date(b.deposit_date) - new Date(a.deposit_date));

    // Calculate running balance if closing_balance is not available
    let balance = history[0]?.closing_balance || 0;
    return history.map((item) => {
      const operator = [
        "Admin Deposit",
        "Winning",
        "Refunds",
        "Deposit",
      ].includes(item.tag)
        ? "+"
        : "-";
      const amount = parseFloat(item.deposit_amount);

      // Update balance based on operator if closing_balance is not available
      if (item.closing_balance === undefined || item.closing_balance === null) {
        if (operator === "+") {
          balance += amount;
        } else {
          balance -= amount;
        }
        item.closing_balance = balance;
      } else {
        balance = item.closing_balance;
      }

      return {
        ...item,
        cash: item.tag === "Winning" ? 0 : amount,
        amount: amount,
        win: item.tag === "Winning" ? amount : 0,
        operator: operator,
        closing: item.closing_balance.toFixed(2),
      };
    });
  };

  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!id || !winningChallange) return;

      try {
        const response = await axios.get(
          `https://admin.aoneludo.com/panel/get-challenge-details/${winningChallange}/`
        );

        setWinningChallangeData(response?.data.challenge);
      } catch (error) {
        console.error("Error fetching challenge data:", error);
        setError("Failed to fetch challenge details. Please try again.");
      }
    };

    fetchChallengeData();
  }, [winningChallange]);

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
        `https://admin.aoneludo.com/panel/block/${userId}/`
      );
      if (response.status === 200 && response.data.error === false) {
        setSnackbar({
          open: true,
          message: response.data.detail || "User blocked successfully",
          severity: "success",
        });
        if (socket) {
          socket.emit("user-block", userId);
        }
      } else {
        setSnackbar({
          open: true,
          message: response.data.detail || "Error blocking user",
          severity: "error",
        });
      }
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/panel/unblock/${userId}/`
      );
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleAddMoney = async () => {
    if (!id || !amount) return;

    try {
      const response = await axios.post(
        `https://admin.aoneludo.com/panel/deposit/${id}/`,
        { deposit_amount: amount }
      );

      if (response.status === 200 && response.data.error === false) {
        if (socket) {
          socket.emit("balance-update", id);
        }
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
        `https://admin.aoneludo.com/penalty/deduct/${id}/`,
        { amount, reason }
      );

      if (response.status === 200 && response.data.error === false) {
        if (socket) {
          socket.emit("balance-update", id);
        }
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

  if (isLoading) return <Loader />;
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
              <DetailLine
                label="Name"
                value={userDetails.kyc_details?.full_name || "-"}
              />
              <DetailLine label="Mobile" value={userDetails.phone_number} />
              <DetailLine
                label="Win"
                value={userDetails.withdrawable_balance}
              />
              {console.log(userDetails)}
              <DetailLine label="Cash" value={userDetails.deposit_balance} />
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
                value={userDetails.referrer_details?.referral_code || "-"}
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
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => handleUnblock(userDetails.id)}
                  >
                    Unblock
                  </Button>
                ) : (
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
            <Box sx={{ display: "flex", justifyContent: "center" }}>
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
            </Box>
            <Typography style={{ textAlign: "center" }}>Front Side</Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
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
            </Box>
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
                    <TableCell>Cash</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Win</TableCell>
                    <TableCell>Operator</TableCell>
                    <TableCell>Closing</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {walletHistory.reverse().map((item, index) => (
                    <TableRow
                      key={`${item.challenge_id}-${index}`}
                      style={{
                        cursor: ["Winning", "Lost"].includes(item.tag)
                          ? "pointer"
                          : "auto",
                        backgroundColor:
                          item.tag === "Winning"
                            ? "rgba(0, 255, 0, 0.1)"
                            : item.tag === "Lost"
                            ? "rgba(255, 0, 0, 0.1)"
                            : "inherit",
                      }}
                      onClick={() => {
                        if (!["Winning", "Lost"].includes(item.tag)) return;
                        setdetailsModalOpen(true);
                        setSelectedChallenge(item.challenge_id);
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell
                        style={{
                          color:
                            item.tag === "Winning"
                              ? "green"
                              : item.tag === "Lost"
                              ? "red"
                              : "black",
                        }}
                      >
                        {item.tag}
                      </TableCell>
                      <TableCell>{item.txn_id || item.challenge_id}</TableCell>
                      <TableCell>{item.cash.toFixed(2)}</TableCell>
                      <TableCell>{item.amount.toFixed(2)}</TableCell>
                      <TableCell>{item.win.toFixed(2)}</TableCell>
                      <TableCell>{item.operator}</TableCell>
                      <TableCell>{item.closing}</TableCell>
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

      <BattleModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setdetailsModalOpen(false);
        }}
        selectedChallenge={winningChallangeData}
      />

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
