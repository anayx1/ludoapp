import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";

import { useRouter } from "next/router";

import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
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
  Avatar,
  Grid,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";

// Dynamically import the Loader component, disabling SSR
const Loader = dynamic(() => import("@/components/Loader"), {
  ssr: false,
});

const BattleModal = ({
  isOpen,
  onClose,
  selectedChallenge,
  selectedWinner,
  setSelectedWinner,
  refreshChallenges,
}) => {
  const handleWinnerChange = (event) => {
    setSelectedWinner(event.target.value);
  };

  const handleSubmitResult = async () => {
    if (!selectedChallenge || !selectedWinner) return;

    try {
      await axios.put(
        `https://admin.aoneludo.com/panel/approve-room-results/${selectedChallenge.room.room_id}/${selectedWinner}/`
      );
      onClose();
      refreshChallenges();
    } catch (error) {
      console.error("Error submitting result:", error);
    }
  };

  const handleCancelBattle = async () => {
    if (!selectedChallenge) return;

    try {
      await axios.post(
        `https://admin.aoneludo.com/api/cancel-challenge/${selectedChallenge.challenge_id}/`
      );
      onClose();
      refreshChallenges();
    } catch (error) {
      console.error("Error cancelling battle:", error);
    }
  };

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
        <Box sx={{ mb: 2 }}>
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
        </Box>
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

const BattlesComponent = ({ initialTab = 0 }) => {
  const [tabValue, setTabValue] = useState(initialTab);
  const router = useRouter();
  // const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [challenges, setChallenges] = useState({
    open_challenges: [],
    running_challenges: [],
    closed_challenges: [],
    pending_challenges: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [socket, setSocket] = useState(null);
  const showActionColumn = tabValue === 3 || tabValue === 1 || tabValue === 0; // Show for Pending, Running, and Open tabs
  const fetchChallenges = async (loading = true) => {
    if (loading) {
      setIsLoading(true);
    }
    try {
      const response = await axios.get(
        "https://admin.aoneludo.com/api/get-challenges/"
      );
      setChallenges(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
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
        fetchChallenges(false);
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
  useEffect(() => {
    // Update the tab value if it's passed in the URL
    const { tab } = router.query;
    if (tab !== undefined) {
      setTabValue(Number(tab));
    }
  }, [router.query]);
  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update the URL when tab changes
    router.push(`/admin/battles?tab=${newValue}`, undefined, { shallow: true });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleActionClick = (challenge) => {
    setSelectedChallenge(challenge);
    setSelectedWinner("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedChallenge(null);
    setSelectedWinner("");
    fetchChallenges();
  };
  const filteredData = useMemo(() => {
    const statuses = [
      "open_challenges",
      "running_challenges",
      "closed_challenges",
      "pending_challenges",
    ];
    const currentChallenges = challenges[statuses[tabValue]] || [];

    return currentChallenges.filter((item) => {
      const searchTermLower = searchTerm.toLowerCase();
      const creatorPhoneNumber = item.room.user.phone_number;
      const opponentPhoneNumber = item.opponent?.phone_number;

      return (
        item.challenge_id.toLowerCase().includes(searchTermLower) ||
        item.created_by.username.toLowerCase().includes(searchTermLower) ||
        item.room.room_amount.toString().includes(searchTerm) ||
        (item.opponent &&
          item.opponent.username.toLowerCase().includes(searchTermLower)) ||
        (creatorPhoneNumber && creatorPhoneNumber.includes(searchTerm)) ||
        (opponentPhoneNumber && opponentPhoneNumber.includes(searchTerm))
      );
    });
  }, [tabValue, searchTerm, challenges]);

  if (isLoading) return <Loader />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "95%" }}>
          <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
            Battles
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by ID, username, or phone number..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="battle tabs"
          >
            <Tab label="Open" />
            <Tab label="Running" />
            <Tab label="Closed" />
            <Tab label="Pending" />
          </Tabs>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Challenge ID</TableCell>
                  <TableCell>Creator</TableCell>
                  <TableCell>Creator Phone</TableCell>
                  <TableCell>Opponent</TableCell>
                  <TableCell>Opponent Phone</TableCell>
                  <TableCell>Amount</TableCell>
                  {tabValue === 0 && (
                    <TableCell>Created at</TableCell>
                  )
                  }
                  {showActionColumn && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.challenge_id}>
                      <TableCell>{row.challenge_id}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() =>
                            router.push(
                              `/admin/userDetail?id=${row.created_by.id}`
                            )
                          }
                          style={{ textTransform: "none", padding: 0 }}
                        >
                          {row.created_by.username}
                        </Button>
                      </TableCell>{" "}
                      <TableCell>{row.room.user.phone_number}</TableCell>
                      <TableCell>
                        {row.opponent ? row.opponent.username : "N/A"}
                      </TableCell>
                      <TableCell>
                        {row.opponent && row.opponent.phone_number
                          ? row.opponent.phone_number
                          : "N/A"}
                      </TableCell>
                      <TableCell>{row.room.room_amount}</TableCell>
                      {tabValue === 0 && (
                    <TableCell> - </TableCell>
                  )
                  }
                      {showActionColumn && (
                        <TableCell>
                          {tabValue === 0 && ( // Only show for open battles
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleCancelOpenBattle(row.challenge_id)
                              }
                            >
                              Cancel Battle
                            </Button>
                          )}
                          {showActionColumn && tabValue !== 0 && (
                            <Button
                              variant="contained"
                              onClick={() => handleActionClick(row)}
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={showActionColumn ? 7 : 6}
                      align="center"
                    >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <BattleModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            selectedChallenge={selectedChallenge}
            selectedWinner={selectedWinner}
            setSelectedWinner={setSelectedWinner}
            refreshChallenges={fetchChallenges}
          />
        </Box>
      </div>
    </>
  );
};

export default BattlesComponent;
