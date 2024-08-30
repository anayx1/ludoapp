import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Container,
  Grid,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";
import { io } from "socket.io-client";

const RunningBattle = () => {
  const router = useRouter();
  const { id, status } = router.query;
  const [battleDetails, setBattleDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameOutcome, setGameOutcome] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancellationReasons, setShowCancellationReasons] = useState(false);

  const userId = useMemo(() => getUserIdFromSessionStorage(), []);

  const getRandomAvatar = () => {
    const avatars = ["a1", "a2", "a3", "a4"];
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return `/${avatars[randomIndex]}.svg`;
  };

  useEffect(() => {
    if (id) {
      fetchBattleDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!isLoading && !battleDetails) {
      router.push("/battles");
    }
  }, [isLoading, battleDetails, router]);

  const fetchBattleDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://ludotest.pythonanywhere.com/api/get-challenges/"
      );
      const data = await response.json();
      if (data.error === false) {
        let battleDetail;
        if (status === "running") {
          battleDetail = data.running_challenges.find(
            (c) => c.challenge_id == id
          );
        } else if (status === "pending") {
          battleDetail = data.pending_challenges.find(
            (c) => c.challenge_id == id
          );
        }
        setBattleDetails(battleDetail);
      }
    } catch (error) {
      console.error("Error fetching battle details:", error);
      setError("Failed to fetch battle details. Please try again.");
    } finally {
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
      setIsConnected(true);
      setTransport(socketIo.io.engine.transport.name);

      socketIo.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      socketIo.emit("user-joined", userId);

      socketIo.on("room-id-created", (data) => {
        if (id === data) {
          fetchBattleDetails();
        }
      });

      socketIo.on("battle-cancel", (data) => {
        if (id === data) {
          router.push("/battles");
        }
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
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

  useEffect(() => {
    if (id) {
      fetchBattleDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!isLoading && !battleDetails) {
      router.push("/battles");
    }
  }, [isLoading, battleDetails, router]);

  const handleRoomIdInputChange = (event) => {
    setRoomIdInput(event.target.value);
  };

  const handleSubmitRoomId = async () => {
    if (!roomIdInput.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/update-room-id/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ room_id: roomIdInput }),
        }
      );

      if (!response.ok) throw new Error("Failed to update room ID");
      if(socket){
        socket.emit("room-id-created", id);
      }
      await fetchBattleDetails(); // Refresh battle details
    } catch (error) {
      console.error("Error updating room ID:", error);
      setError("Failed to update room ID. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(battleDetails?.room?.room_id);
    alert("Room Code Copied to Clipboard");
  };

  const handleOutcomeChange = (event) => {
    setGameOutcome(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadScreenshot = async () => {
    if (gameOutcome === "W" && !selectedFile) {
      setError("Please select a file for the winning screenshot");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (gameOutcome === "W") {
      formData.append("screenshot", selectedFile);
    }
    formData.append("status", gameOutcome);

    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/create-room-result/${userId}/${id}/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit result");

      const data = await response.json();
      console.log("Result submitted successfully:", data);
      setSelectedFile(null);
      setGameOutcome("");
      if(socket){
        socket.emit("battle-result", id);
      }
      await fetchBattleDetails(); // Refresh battle details
    } catch (error) {
      console.error("Error submitting result:", error);
      setError("Failed to submit result. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelButtonClick = () => {
    if (!showCancellationReasons) {
      setShowCancellationReasons(true);
    } else {
      handleCancelBattle();
    }
  };

  const handleCancelBattle = async () => {
    if (!cancellationReason) {
      setError("Please select a cancellation reason.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/api/cancel-battle/${id}/${userId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cancellation_reason: cancellationReason }),
        }
      );

      if (!response.ok) throw new Error("Failed to cancel battle");
      if (socket) {
        socket.emit("battle-cancel", id);
      }
      router.push("/battles");
    } catch (error) {
      console.error("Error cancelling battle:", error);
      setError("Failed to cancel battle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const isCreator = userId === battleDetails?.created_by.id;
  const isOpponent = userId === battleDetails?.opponent?.id;
  const creatorHasCancelled = !!battleDetails?.creator_cancellation_reason;
  const opponentHasCancelled = !!battleDetails?.opponent_cancellation_reason;
  const userHasCancelled = isCreator
    ? creatorHasCancelled
    : opponentHasCancelled;
  const otherUserHasCancelled = isCreator
    ? opponentHasCancelled
    : creatorHasCancelled;

  const userResult = isCreator
    ? battleDetails?.room_result?.creator_status
    : battleDetails?.room_result?.opponent_status;
  const opponentResult = isCreator
    ? battleDetails?.room_result?.opponent_status
    : battleDetails?.room_result?.creator_status;

  const shouldShowCancelButton = !userHasCancelled && !userResult;
  const shouldShowRoomIdInput =
    isCreator &&
    !battleDetails?.room.update_status &&
    !userHasCancelled &&
    !otherUserHasCancelled;
  const shouldShowWaitingMessage =
    !isCreator &&
    !battleDetails?.room.update_status &&
    !userHasCancelled &&
    !otherUserHasCancelled;

  return (
    <>
      <Sidebar />
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Battle Details
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12} sm={5}>
              <Box sx={{ textAlign: "center" }}>
                <img
                  src={getRandomAvatar()}
                  alt="Avatar"
                  width="50"
                  height="50"
                />
                <Typography variant="h6">
                  {battleDetails?.created_by.username}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="h5" align="center">
                VS
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Box sx={{ textAlign: "center" }}>
                <img
                  src={getRandomAvatar()}
                  alt="Avatar"
                  width="60"
                  height="60"
                />
                <Typography variant="h6">
                  {battleDetails?.opponent?.username}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="h6">
              Room Amount: ₹{battleDetails?.room.room_amount}
            </Typography>
            <Typography variant="h6">
              Winning Amount: ₹{battleDetails?.room.winning_amount}
            </Typography>
          </Box>

          {!userHasCancelled && !otherUserHasCancelled && (
            <>
              {battleDetails?.room.update_status && status !== "pending" && (
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    Room Code: {battleDetails?.room.room_id}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={copyRoomCode}
                  >
                    Copy
                  </Button>
                </Box>
              )}

              {shouldShowRoomIdInput && (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Enter Room ID"
                    variant="outlined"
                    value={roomIdInput}
                    onChange={handleRoomIdInputChange}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmitRoomId}
                    disabled={isSubmitting || !roomIdInput.trim()}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Submit Room ID"
                    )}
                  </Button>
                </Box>
              )}

              {shouldShowWaitingMessage && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <CircularProgress />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Waiting for creator to enter room code...
                  </Typography>
                </Box>
              )}

              {battleDetails?.room.update_status && !userResult && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Submit Your Game Result
                  </Typography>
                  <FormControl component="fieldset" sx={{ width: "100%" }}>
                    <RadioGroup
                      aria-label="game-outcome"
                      name="game-outcome"
                      value={gameOutcome}
                      onChange={handleOutcomeChange}
                      row
                      sx={{ justifyContent: "center" }}
                    >
                      <FormControlLabel
                        value="W"
                        control={<Radio />}
                        label="Won"
                      />
                      <FormControlLabel
                        value="L"
                        control={<Radio />}
                        label="Lost"
                      />
                    </RadioGroup>
                  </FormControl>

                  {gameOutcome === "W" && (
                    <>
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
                    </>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUploadScreenshot}
                    sx={{ mt: 2 }}
                    disabled={
                      isSubmitting ||
                      !gameOutcome ||
                      (gameOutcome === "W" && !selectedFile)
                    }
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Submit Result"
                    )}
                  </Button>
                </Box>
              )}

              {userResult && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography variant="h6" gutterBottom>
                    Contact Admin for Result
                  </Typography>
                  {!opponentResult && (
                    <Typography variant="body1">
                      Waiting for opponent to submit their result...
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}

          {userHasCancelled && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="h6">
                You have cancelled this battle. Reason:{" "}
                {isCreator
                  ? battleDetails?.creator_cancellation_reason
                  : battleDetails?.opponent_cancellation_reason}
              </Typography>
              <Typography variant="body1">
                Waiting for the other player to cancel the battle.
              </Typography>
            </Box>
          )}

          {otherUserHasCancelled && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="h6">
                The other player has cancelled this battle. Reason:{" "}
                {isCreator
                  ? battleDetails?.opponent_cancellation_reason
                  : battleDetails?.creator_cancellation_reason}
              </Typography>
              <Typography variant="body1">
                Please cancel the battle to complete the cancellation process.
              </Typography>
            </Box>
          )}

          {shouldShowCancelButton && (
            <Box sx={{ mt: 3 }}>
              {showCancellationReasons && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    displayEmpty
                    inputProps={{ "aria-label": "Cancel reason" }}
                  >
                    <MenuItem value="" disabled>
                      Select cancellation reason
                    </MenuItem>
                    <MenuItem value="No room code">No room code</MenuItem>
                    <MenuItem value="Game not Started">
                      Game not Started
                    </MenuItem>
                    <MenuItem value="Not Joined">Not Joined</MenuItem>
                    <MenuItem value="Not Playing">Not Playing</MenuItem>
                    <MenuItem value="Dont want to play">
                      Don't want to play
                    </MenuItem>
                    <MenuItem value="Opponent abusing">
                      Opponent abusing
                    </MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              )}
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleCancelButtonClick}
                disabled={
                  isSubmitting ||
                  (showCancellationReasons && !cancellationReason)
                }
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : showCancellationReasons ? (
                  "Confirm Cancellation"
                ) : (
                  "Cancel Battle"
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

function getUserIdFromSessionStorage() {
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
}

export default withAuth(RunningBattle);
