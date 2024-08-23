import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Avatar,
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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";

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

  const userId = useMemo(() => getUserIdFromSessionStorage(), []);

  useEffect(() => {
    if (id) {
      fetchBattleDetails();
    }
  }, [id]);

  const fetchBattleDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://ludotest.pythonanywhere.com/api/get-challenges/"
      );
      const data = await response.json();
      if (data.error === false) {
        const battleDetail = data[`${status}_challenges`].find(
          (c) => c.challenge_id == id
        );
        setBattleDetails(battleDetail);
      }
    } catch (error) {
      console.error("Error fetching battle details:", error);
      setError("Failed to fetch battle details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!selectedFile || !gameOutcome) {
      setError("Please select a file and game outcome");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("screenshot", selectedFile);
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
      await fetchBattleDetails(); // Refresh battle details
    } catch (error) {
      console.error("Error submitting result:", error);
      setError("Failed to submit result. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!battleDetails) return <Typography>No battle details found</Typography>;

  const isCreator = userId === battleDetails.created_by.id;
  const shouldShowRoomIdInput = isCreator && !battleDetails.room.update_status;
  const shouldShowWaitingMessage =
    !isCreator && !battleDetails.room.update_status;

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
                <Avatar sx={{ width: 80, height: 80, margin: "0 auto" }}>
                  {battleDetails.created_by.username[0]}
                </Avatar>
                <Typography variant="h6">
                  {battleDetails.created_by.username}
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
                <Avatar sx={{ width: 80, height: 80, margin: "0 auto" }}>
                  {battleDetails.opponent.username[0]}
                </Avatar>
                <Typography variant="h6">
                  {battleDetails.opponent.username}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="h6">
              Room Amount: ₹{battleDetails.room.room_amount}
            </Typography>
            <Typography variant="h6">
              Winning Amount: ₹{battleDetails.room.winning_amount}
            </Typography>
          </Box>

          {battleDetails.room.update_status && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ mr: 2 }}>
                Room Code: {battleDetails.room.room_id}
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

          {battleDetails.room.update_status && !battleDetails.room_result && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Submit Game Result
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
                  <FormControlLabel value="W" control={<Radio />} label="Won" />
                  <FormControlLabel
                    value="L"
                    control={<Radio />}
                    label="Lost"
                  />
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
                disabled={isSubmitting || !selectedFile || !gameOutcome}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Upload Screenshot"
                )}
              </Button>
            </Box>
          )}

          {battleDetails.room_result && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="h6">
                Game Result:{" "}
                {battleDetails.room_result.status === "W" ? "Won" : "Lost"}
              </Typography>
              {/* You can add more details about the result here if needed */}
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
