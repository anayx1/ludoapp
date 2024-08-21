import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Modal,
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { styled } from "@mui/system";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const NoticeBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#f8d7da",
  color: "#721c24",
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  margin: theme.spacing(2, 0),
  textAlign: "center",
}));

const VersusContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  marginTop: "20px",
  marginBottom: "20px",
});

const RoomCodeContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  marginTop: "20px",
});

const RunningBattle = () => {
  const router = useRouter();
  const { id, status } = router.query;
  const [battleDetails, setBattleDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [gameOutcome, setGameOutcome] = useState("");

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
        setBattleDetails(
          data[`${status}_challenges`].filter((c) => c.challenge_id == id)[0]
        );
      }
    } catch (error) {
      console.error("Error fetching battles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

  var status1 = useMemo(() => {
    const id = getUserIdFromSessionStorage();
    if (id == battleDetails?.created_by?.id) {
      if (!!battleDetails?.room_result?.creator_screenshot) return false;
      else {
        return true;
      }
    } else if (id == battleDetails?.opponent.id) {
      if (!!battleDetails?.room_result?.opponent_screenshot) return false;
      else {
        return true;
      }
    }
  }, [battleDetails]);

  const handleUploadScreenshot = async () => {
    if (!selectedFile || !gameOutcome) {
      setError("Please select a file and game outcome");
      return;
    }

    const formData = new FormData();
    formData.append("screenshot", selectedFile);
    formData.append("status", gameOutcome);

    try {
      const userId = getUserIdFromSessionStorage();
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
      setIsModalOpen(false);
      router.push("/battles");
      fetchBattleDetails(); // Refresh battle details
    } catch (error) {
      setError("Failed to submit result. Please try again.");
      console.error(error);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!battleDetails) return <Typography>No battle details found</Typography>;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(battleDetails?.room?.room_id);
    alert("Room Code Copied to Clipboard");
  };

  return (
    <>
      <Sidebar />
      <Box sx={{ padding: "20px", margin: "0 auto" }}>
        <NoticeBox>
          Notice:- पॉपुलर का रूम कोड डालने पर यूज़र का बैलेंस जीरो कर दिया जाएगा
          🙏 (User's balance will be reduced to zero on entering Popular's room
          code)
        </NoticeBox>

        <VersusContainer sx={{ justifyContent: "space-between" }}>
          <Box sx={{ textAlign: "center" }}>
            <Avatar sx={{ width: 80, height: 80, margin: "0 auto" }}>
              {battleDetails?.created_by?.username}
            </Avatar>
            <Typography className="text-wrapper-battle">
              {battleDetails?.created_by?.username}
            </Typography>
          </Box>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">V/S</Typography>
            <Typography variant="h6" color="green">
              ₹{battleDetails?.room?.room_amount}
            </Typography>
          </div>
          <Box sx={{ textAlign: "center" }}>
            <Avatar sx={{ width: 80, height: 80, margin: "0 auto" }}>
              {battleDetails?.opponent
                ? battleDetails?.opponent?.username
                : "?"}
            </Avatar>
            <Typography className="text-wrapper-battle">
              {battleDetails?.opponent
                ? battleDetails?.opponent?.username
                : "Waiting..."}
            </Typography>
          </Box>
        </VersusContainer>

        <RoomCodeContainer sx={{ flexDirection: "row", gap: "10px" }}>
          <Typography variant="h6">
            Room Code: {battleDetails?.room?.room_id}
          </Typography>
          <ContentCopyIcon onClick={copyRoomCode} />
        </RoomCodeContainer>
        <NoticeBox>
          Notice:- सभी पॉपुलर गेम समाप्त होने के बाद रिजल्ट सबमिट/फिक्स जरूर
          सबमिट करें रिजल्ट सबमिट न करें या। गलत रिजल्ट सबमिट करने पर 25 की
          पेनल्टी लगा दी जाएगी
        </NoticeBox>

        <NoticeBox>
          Notice:- यदि आपका कंफर्मेंट गलत होता है या रिजल्ट गलत होता है तो गेम
          सीधा कैंसिल कर दिया जाएगा।
        </NoticeBox>

        <section>
          <FormControl component="fieldset" fullWidth margin="normal">
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ textAlign: "center" }}
            >
              Game Outcome
            </Typography>
            <RadioGroup
              aria-label="game-outcome"
              name="game-outcome"
              value={gameOutcome}
              sx={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
              onChange={(e) => setGameOutcome(e.target.value)}
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
              fullWidth
              variant="contained"
              component="span"
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
        </section>

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="upload-screenshot-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              id="upload-screenshot-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Upload Screenshot
            </Typography>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default withAuth(RunningBattle);
