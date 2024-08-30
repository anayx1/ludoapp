'use client';
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Cookies from "js-cookie";

import axios from "axios";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Modal,
  Snackbar,
  CircularProgress,
  Avatar,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Router, { useRouter } from "next/router";
import { io } from "socket.io-client";

const CreateBattle = () => {
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState("");
  const [openBattles, setOpenBattles] = useState([]);
  const [runningBattles, setRunningBattles] = useState([]);
  const [pendingBattles, setPendingBattles] = useState([]);
  const [startedBattles, setStartedBattles] = useState([]);
  const [winningAmount, setWinningAmount] = useState([]);
  const [adminDetails, setAdminDetails] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentChallengeId, setCurrentChallengeId] = useState(null);
  const [gameOutcome, setGameOutcome] = useState("");
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  
  const [socket, setSocket] = useState(null);
  
  const setSocketIo = () => {
    const socketIo = io("https://socket.aoneludo.com");
    setSocket(socketIo);
    if (socketIo.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socketIo.io.engine.transport.name);

      socketIo.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      socketIo.emit("user-joined", userId);

      socketIo.on("battle-joined", (data) => {
        console.log("Battle joined--------", data);
        fetchBattles();
      });

      socketIo.on("battle-created", (data) => {
        console.log("Battle created", data);
        fetchBattles();
      });

      socketIo.on("battle-cancel", (data) => {
        console.log("Battle cancel", data);
        fetchBattles();
      });

      socketIo.on("battle-result", (data) => {
        console.log("Battle result", data);
        fetchBattles();
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socketIo.on("connect", onConnect);
    socketIo.on("disconnect", onDisconnect);

  }

  useEffect(() => {
    setSocketIo();
    return () => {
      if(socket){
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      }
    };
  }, []);

  useEffect(() => {
    fetchBattles();
    fetchWalletBalance();
    fetchUserId();
  }, []);

  const fetchBattles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://ludotest.pythonanywhere.com/api/get-challenges/"
      );
      const data = await response.json();
      if (data.error === false) {
        setOpenBattles(data.open_challenges);
        setRunningBattles(data.running_challenges);
        setPendingBattles(data.pending_challenges || []);
        setStartedBattles(data.started_challenges);
      }
    } catch (error) {
      console.error("Error fetching battles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutcomeChange = (event) => {
    setGameOutcome(event.target.value);
  };

  const fetchWalletBalance = () => {
    const userData = Cookies.get("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        if (
          parsedData &&
          parsedData.user_details &&
          parsedData.user_details.wallet
        ) {
          setWalletBalance(parsedData.user_details.wallet.balance);
        }
      } catch (error) {
        console.error("Error parsing user data from cookie:", error);
      }
    }
  };

  const fetchUserId = () => {
    const userData = Cookies.get("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        if (
          parsedData &&
          parsedData.user_details &&
          parsedData.user_details.id
        ) {
          setUserId(parsedData.user_details.id);
        }
      } catch (error) {
        console.error("Error parsing user data from cookie:", error);
      }
    }
  };

  const getUserIdFromCookie = () => {
    const userData = Cookies.get("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        if (
          parsedData &&
          parsedData.user_details &&
          parsedData.user_details.id
        ) {
          return parsedData.user_details.id;
        }
      } catch (error) {
        console.error("Error parsing user data from cookie:", error);
      }
    }
    return null;
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setError("");
  };

  const handleSetAmount = (value) => {
    setAmount(value.toString());
  };

  const handleCreateBattle = () => {
    if (!amount) {
      setErrorMessage("Please enter an amount.");
      setIsErrorModalOpen(true);
      return;
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please enter a valid amount.");
      setIsErrorModalOpen(true);
      return;
    }

    if (amountNum < 50) {
      setErrorMessage("Minimum room amount is 50 Rs.");
      setIsErrorModalOpen(true);
      return;
    }

    if (amountNum > 15000) {
      setErrorMessage("Maximum room amount is 15000 Rs.");
      setIsErrorModalOpen(true);
      return;
    }

    if (amountNum > walletBalance) {
      setErrorMessage("Amount exceeds wallet balance.");
      setIsErrorModalOpen(true);
      return;
    }

    // If all checks pass, proceed to create the room
    createRoom(amountNum);
  };

  const createRoom = async (amount) => {
    const currentUserId = getUserIdFromCookie();
    if (!currentUserId) {
      setErrorMessage("User details not found. Please try logging in again.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/create-room/${currentUserId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_amount: amount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      console.log("Room created successfully:", data);
      setCreatedRoomId(data.room_id);
      socket && socket.emit("battle-created", JSON.stringify(data));

      window.location.reload();
    } catch (error) {
      console.error("Error creating room:", error);
      setErrorMessage("Failed to create room. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoomIdInput("");
  };

  const handleRoomIdInputChange = (event) => {
    setRoomIdInput(event.target.value);
  };

  const handleSubmitRoomId = async () => {
    const currentUserId = getUserIdFromCookie();
    if (!currentUserId) {
      setError("User details not found. Please try logging in again.");
      return;
    }

    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/create-room/${currentUserId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_amount: amount,
            room_id: roomIdInput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      console.log("Room created successfully:", data);
      setCreatedRoomId(data.room_id);
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room. Please try again.");
    }
  };

  const handleJoinBattleClick = (battle) => {
    setSelectedBattle(battle);
    setJoinModalOpen(true);
    socket && socket.emit("battle-joined", JSON.stringify(battle));
  };

  const handleStartBattle = async (battle) => {
    const currentUserId = getUserIdFromCookie();
    if (!currentUserId) {
      setError("User details not found. Please try logging in again.");
      return;
    }

    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/make-challenge-running/${battle.challenge_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.error) {
        setError(data.detail);
      }
      window.location.reload();
    } catch (error) {
      console.error("Error starting room:", error);
      setError(error.message);
    }
  };

  const handleJoinBattleConfirm = async () => {
    if (!selectedBattle) return;

    const currentUserId = getUserIdFromCookie();
    if (!currentUserId) {
      setError("User ID not found. Please try logging in again.");
      return;
    }

    if (walletBalance < selectedBattle.room.room_amount) {
      setError("Insufficient wallet balance to join this battle.");
      return;
    }

    try {
      // First, join the challenge
      const joinResponse = await fetch(
        `https://ludotest.pythonanywhere.com/api/join-challenge/${currentUserId}/${selectedBattle.challenge_id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!joinResponse.ok) {
        throw new Error("Failed to join battle");
      }

      const joinData = await joinResponse.json();
      console.log("Joined battle successfully:", joinData);

      // Then, send the PUT request to make the challenge running
      const makeRunningResponse = await fetch(
        `https://ludotest.pythonanywhere.com/api/make-challenge-running/${selectedBattle.challenge_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!makeRunningResponse.ok) {
        throw new Error("Failed to make challenge running");
      }

      const makeRunningData = await makeRunningResponse.json();
      console.log("Challenge set to running:", makeRunningData);
      socket && socket.emit("battle-joined", JSON.stringify({userId: currentUserId}));
      setCreatedRoomId(joinData.room_id);
      setJoinModalOpen(false);
      fetchBattles();
      window.location.reload();
    } catch (error) {
      console.error("Error in battle process:", error);
      setError("Failed to complete the battle process. Please try again.");
    }
  };

  const handleCancelBattle = async (challengeId) => {
    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/cancel-challenge/${challengeId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel battle");
      }

      console.log(`Battle with ID: ${challengeId} cancelled successfully`);
      socket && socket.emit("battle-cancel", challengeId);
      fetchBattles();
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling battle:", error);
      setError("Failed to cancel battle. Please try again.");
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        console.log("Starting to fetch admin data...");
        const url =
          "https://ludotest.pythonanywhere.com/panel/get-admin-details/5/";
        const response = await axios.get(url);

        const dataArray = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setWinningAmount(dataArray);
      } catch (error) {
        // console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const OpenBattleCard = ({ battle }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="subtitle1">
          Challenge from {battle.created_by.username}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="body2">
            Entry Fee: 💰 {parseFloat(battle.room.room_amount).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Prize: 💰 {parseFloat(battle.room.winning_amount).toFixed(2)}
          </Typography>
        </Box>
      </Box>
      {getUserIdFromCookie() === battle.created_by.id ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleCancelBattle(battle.challenge_id)}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleJoinBattleClick(battle)}
          >
            Join
          </Button>
        </>
      )}
    </Paper>
  );

  const RunningBattleCard = ({ battle }) => {
    const id = getUserIdFromCookie();
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">
            Playing for 💰 {battle.room.room_amount}
          </Typography>
          <Typography variant="body2">
            Prize: 💰 {parseFloat(battle.room.winning_amount).toFixed(2)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Avatar>{battle.created_by.username[0]}</Avatar>
            <Typography variant="body2" className="text-wrapper-battle">
              {battle.created_by.username}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <FlashOnIcon color="error" />
            <Typography variant="body2">V/S</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar>
              {battle.opponent ? battle.opponent.username[0] : "?"}
            </Avatar>
            <Typography variant="body2" className="text-wrapper-battle">
              {battle.opponent ? battle.opponent.username : "Waiting..."}
            </Typography>
          </Box>
        </Box>
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          {(id == battle.created_by.id || id == battle.opponent.id) && (
            <Button
              onClick={() => {
                Router.push(
                  `/runningBattle?id=${battle.challenge_id}&status=running`
                );
              }}
              variant="contained"
            >
              view
            </Button>
          )}
        </div>
      </Paper>
    );
  };

  const PendingBattleCard = ({ battle }) => {
    const id = getUserIdFromCookie();
    if (id != battle.created_by.id && id != battle.opponent.id) {
      return null;
    }

    return (
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">
            Amount: 💰 {parseFloat(battle.room.room_amount).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Prize: 💰 {parseFloat(battle.room.winning_amount).toFixed(2)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Avatar>{battle.created_by.username[0]}</Avatar>
            <Typography variant="body2" className="text-wrapper-battle">
              {battle.created_by.username}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FlashOnIcon color="error" />
            <Typography variant="body2">V/S</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Avatar>{battle.opponent.username[0]}</Avatar>
            <Typography variant="body2" className="text-wrapper-battle">
              {battle.opponent.username}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Status: Pending Result
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "5px",
          }}
        >
          {(id == battle.created_by.id || id == battle.opponent.id) && (
            <Button
              variant="contained"
              onClick={() => {
                Router.push(
                  `/runningBattle?id=${battle.challenge_id}&status=pending`
                );
              }}
            >
              view
            </Button>
          )}
        </div>
      </Paper>
    );
  };

  const handleSubmitResult = (challengeId) => {
    setCurrentChallengeId(challengeId);
    setIsResultModalOpen(true);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadScreenshot = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    const currentUserId = getUserIdFromCookie();
    if (!currentUserId) {
      setError("User ID not found. Please try logging in again.");
      return;
    }

    const formData = new FormData();
    formData.append("screenshot", selectedFile);
    formData.append("status", gameOutcome);

    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/create-room-result/${currentUserId}/${currentChallengeId}/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit result");
      }

      const data = await response.json();
      setIsResultModalOpen(false);
      setSelectedFile(null);
      setGameOutcome("");
      fetchBattles();
    } catch (error) {
      console.error("Error submitting result:", error);
      setError("Failed to submit result. Please try again.");
    }
  };

  return (
    <>
      <Sidebar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            backgroundColor: "#b00000",
            color: "#fff",
            height: "auto",
            textAlign: "center",
            borderRadius: "20px",
            marginTop: "10px",
            padding:"10px"
          }}
        >
          चेतावनी: सभी उपयोगकर्ता खेल समाप्त होने के बाद win/loss का परिणाम
          अवश्य सबमिट करें। परिणाम सबमिट न करने या गलत परिणाम सबमिट करने पर 50
          रुपये की पेनल्टी लगा दी जाएगी।
        </div>
      </div>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "90%",
          margin: "auto",
          mt: 4,
          padding: "10px",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Create a battle
        </Typography>
        <Box>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", mb: 3 }}
          >
            <TextField
              fullWidth
              label="Amount"
              variant="outlined"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              sx={{
                mr: 1,
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                  {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreateBattle}
              sx={{
                bgcolor: "black",
                color: "white",
                "&:hover": { bgcolor: "grey.800" },
              }}
            >
              SET
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {[50, 100, 200, 500, 2000].map((value) => (
              <Button
                key={value}
                variant="outlined"
                onClick={() => handleSetAmount(value)}
              >
                {value}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper
            elevation={3}
            sx={{ p: 3, width: "90%", margin: "auto", mt: 4, padding: "10px" }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", fontSize: "18px" }}
            >
              <FlashOnIcon sx={{ mr: 1 }} /> <b> Open Battles</b>
            </Typography>
            {openBattles.map((battle) => (
              <OpenBattleCard key={battle.challenge_id} battle={battle} />
            ))}
          </Paper>

          <Paper
            elevation={3}
            sx={{ p: 3, width: "90%", margin: "auto", mt: 4, padding: "10px" }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", fontSize: "18px" }}
            >
              <FlashOnIcon sx={{ mr: 1 }} />
              <b> Running Battles</b>
            </Typography>
            {runningBattles.map((battle) => (
              <RunningBattleCard key={battle.challenge_id} battle={battle} />
            ))}
          </Paper>

          <Paper
            elevation={3}
            sx={{ p: 3, width: "90%", margin: "auto", mt: 4, padding: "10px" }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", fontSize: "18px" }}
            >
              <FlashOnIcon sx={{ mr: 1 }} />
              <b>Pending Results </b>
            </Typography>
            {pendingBattles.map((battle) => (
              <PendingBattleCard key={battle.challenge_id} battle={battle} />
            ))}
          </Paper>
        </>
      )}

      <Modal
        open={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        aria-labelledby="result-modal"
        aria-describedby="upload-screenshot"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "300px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="result-modal"
            variant="h6"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            Submit Result
          </Typography>

          <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
            <RadioGroup
              aria-label="game-outcome"
              name="game-outcome"
              value={gameOutcome}
              onChange={handleOutcomeChange}
              row
              sx={{ justifyContent: "center" }}
            >
              <FormControlLabel value="W" control={<Radio />} label="Won" />
              <FormControlLabel value="L" control={<Radio />} label="Lost" />
            </RadioGroup>
          </FormControl>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="screenshot-upload"
          />
          <label htmlFor="screenshot-upload">
            <Button
              variant="contained"
              component="span"
              fullWidth
              sx={{ mt: 2 }}
            >
              Choose Screenshot
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={handleUploadScreenshot}
            sx={{ mt: 2 }}
            disabled={!selectedFile || !gameOutcome}
          >
            Upload Screenshot
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setIsResultModalOpen(false)}
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="room-id-modal"
        aria-describedby="enter-room-id"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "300px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="room-id-modal" variant="h6" component="h2">
            Create Room
          </Typography>
          <TextField
            fullWidth
            label="Room ID"
            variant="outlined"
            value={roomIdInput}
            onChange={handleRoomIdInputChange}
            sx={{ mt: 2 }}
            required
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmitRoomId}
            sx={{ mt: 2 }}
            disabled={!roomIdInput.trim()}
          >
            Create Room
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCloseModal}
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>

      <Modal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        aria-labelledby="join-battle-modal"
        aria-describedby="join-battle-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "300px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography id="join-battle-modal" variant="h6" component="h2">
            Join Battle
          </Typography>

          <Typography sx={{ mt: 1 }}>
            Amount: 💰 {selectedBattle?.room.room_amount}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={handleJoinBattleConfirm}
            sx={{ mt: 2 }}
          >
            Confirm Join
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setJoinModalOpen(false)}
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>

      <Modal
        open={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        aria-labelledby="error-modal"
        aria-describedby="error-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "300px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="error-modal"
            variant="h6"
            component="h2"
            style={{ justifyContent: "center", textAlign: "center" }}
          >
            <ErrorOutlineIcon style={{ fontSize: "80px" }} />
          </Typography>
          <Typography
            id="error-description"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {errorMessage}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setIsErrorModalOpen(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </>
  );
};

export default withAuth(CreateBattle);
