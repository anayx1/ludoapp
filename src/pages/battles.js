import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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

const CreateBattle = () => {
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState("");
  const [openBattles, setOpenBattles] = useState([]);
  const [runningBattles, setRunningBattles] = useState([]);
  const [pendingBattles, setPendingBattles] = useState([]);
  const [winningAmount, setWinningAmount] = useState([]);
  const [adminDetails, setAdminDetails] = useState(null);

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
    let foundWalletBalance = null;

    for (let key in sessionStorage) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key));
        if (data && data.user_details && data.user_details.wallet) {
          foundWalletBalance = data.user_details.wallet.balance;
          break;
        } else if (data && data.wallet) {
          foundWalletBalance = data.wallet.balance;
          break;
        }
      } catch (error) {
        console.log(`Error parsing data from ${key}:`, error);
      }
    }

    if (foundWalletBalance !== null) {
      setWalletBalance(foundWalletBalance);
    } else {
      console.log("Wallet balance not found in any expected location");
    }
  };

  const fetchUserId = () => {
    const id = getUserIdFromSessionStorage();
    if (id) {
      setUserId(id);
    }
  };

  const getUserIdFromSessionStorage = () => {
    for (let key in sessionStorage) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key));
        if (data && data.user_details && data.user_details.id) {
          return data.user_details.id;
        } else if (data && data.id) {
          return data.id;
        }
      } catch (error) {
        console.log(`Error parsing data from ${key}:`, error);
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
      setError("Please enter an amount.");
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (amountNum < 50) {
      setError("Minimum room amount is 50 Rs.");
      return;
    }

    if (amountNum > walletBalance) {
      setError("Amount exceeds wallet balance.");
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoomIdInput("");
  };

  const handleRoomIdInputChange = (event) => {
    setRoomIdInput(event.target.value);
  };

  const handleCopyRoomCode = () => {
    if (selectedBattle?.room.room_id) {
      const textArea = document.createElement("textarea");
      textArea.value = selectedBattle.room.room_id;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        setCopySuccess(true);
        setCopyError(false);
        setTimeout(() => setCopySuccess(false), 2000); // Reset success message after 2 seconds
      } catch (err) {
        console.error("Failed to copy room code: ", err);
        setCopyError(true);
        setCopySuccess(false);
        setTimeout(() => setCopyError(false), 2000); // Reset error message after 2 seconds
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleSubmitRoomId = async () => {
    const currentUserId = getUserIdFromSessionStorage();
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
  };

  const handleJoinBattleConfirm = async () => {
    if (!selectedBattle) return;

    const currentUserId = getUserIdFromSessionStorage();
    if (!currentUserId) {
      setError("User ID not found. Please try logging in again.");
      return;
    }

    if (walletBalance < selectedBattle.room.room_amount) {
      setError("Insufficient wallet balance to join this battle.");
      return;
    }

    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/join-challenge/${currentUserId}/${selectedBattle.challenge_id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to join battle");
      }

      const data = await response.json();
      console.log("Joined battle successfully:", data);
      window.location.reload();
      setCreatedRoomId(data.room_id);
      setJoinModalOpen(false);
      fetchBattles();
    } catch (error) {
      console.error("Error joining battle:", error);
      setError("Failed to join battle. Please try again.");
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
        // console.log("WinningAmount state set:", dataArray);
      } catch (error) {
        // console.error("Error fetching admin data:", error);
      } finally {
      }
    };

    fetchAdminData();
  }, []);

  const calculateWinningAmount = (roomAmount) => {
    if (!winningAmount || winningAmount.length === 0) {
      console.error("Admin details not loaded yet");
      return "0.00";
    }

    const adminDetails = winningAmount[0];

    const adminPercentage = parseFloat(adminDetails.admin_percentage) || 0;
    const referralCommission =
      parseFloat(adminDetails.referral_commission) || 0;

    const totalDeduction = (adminPercentage + referralCommission) / 100;
    const winningAmountValue = roomAmount * 2 * (1 - totalDeduction);
    return winningAmountValue.toFixed(2);
  };

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
      {/* {console.log(response, "admin")} */}

      <Box>
        <Typography variant="subtitle1">
          Challenge from {battle.created_by.username}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="body2">
            Entry Fee: 💰 {parseFloat(battle.room.room_amount).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Prize: 💰{" "}
            {calculateWinningAmount(
              parseFloat(battle.room.room_amount),
              adminDetails
            )}
          </Typography>
        </Box>
      </Box>
      {getUserIdFromSessionStorage() === battle.created_by.id ? (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleCancelBattle(battle.challenge_id)}
        >
          Cancel
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleJoinBattleClick(battle)}
        >
          Join
        </Button>
      )}
    </Paper>
  );

  const RunningBattleCard = ({ battle }) => {
    const id = getUserIdFromSessionStorage();
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
            Prize: 💰{" "}
            {calculateWinningAmount(
              parseFloat(battle.room.room_amount),
              adminDetails
            )}
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
          style={{ display: "flex", justifyContent: "center", width: "95%" }}
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
        {/* <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={() => handleSubmitResult(battle.challenge_id)}
        sx={{ mt: 2 }}
      >
        Upload Screenshot
      </Button> */}
      </Paper>
    );
  };

  const PendingBattleCard = ({ battle }) => {
    const id = getUserIdFromSessionStorage();
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
            Prize: 💰{" "}
            {calculateWinningAmount(
              parseFloat(battle.room.room_amount),
              adminDetails
            )}
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
        {(id == battle.created_by.id || id == battle.opponent.id) && (
          <Button
            onClick={() => {
              Router.push(
                `/runningBattle?id=${battle.challenge_id}&status=pending`
              );
            }}
          >
            view
          </Button>
        )}
        {/* <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={() => handleSubmitResult(battle.challenge_id)}
        sx={{ mt: 2 }}
      >
        Upload Screenshot
      </Button> */}
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

    const currentUserId = getUserIdFromSessionStorage();
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
      // console.log("Result submitted successfully:", data);
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

      <Paper
        elevation={3}
        sx={{ p: 3, width: "90%", margin: "auto", mt: 4, padding: "10px" }}
      >
        {/* <div style={{display:"flex", justifyContent:"center",margin:"10px 0 10px 0"}}>
          <img src="/bg.jpg" width={300} height={200} style={{borderRadius:"5px"}} />
        </div> */}
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
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FlashOnIcon sx={{ mr: 1 }} /> Open Battles
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
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FlashOnIcon sx={{ mr: 1 }} /> Running Battles
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
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FlashOnIcon sx={{ mr: 1 }} /> Pending Results
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Typography id="join-battle-description">
              Room ID: {selectedBattle?.room.room_id}
            </Typography>
            <Tooltip title="Copy Room ID">
              <ContentCopyIcon
                onClick={handleCopyRoomCode}
                sx={{
                  marginLeft: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Box>
          {copySuccess && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ mt: 1, display: "block" }}
            >
              Copied to clipboard!
            </Typography>
          )}
          {copyError && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ mt: 1, display: "block" }}
            >
              Failed to copy. Please try manually selecting and copying the Room
              ID.
            </Typography>
          )}
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
