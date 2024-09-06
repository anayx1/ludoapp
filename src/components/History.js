import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import Loader from "./Loader";

const History = () => {
  const [value, setValue] = useState(0);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userDataString = sessionStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserId(userData.user_details.id);
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `https://admin.aoneludo.com/api/user-history/${userId}/`
        );
        setHistory(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderWalletHistory = () => {
    const combinedHistory = [
      ...history.wallet_history,
      ...history.penalty_history.map((penalty) => ({
        ...penalty,
        deposit_amount: penalty.amount,
        deposit_date: penalty.created_at,
        status: "Successful",
        tag: "Penalty",
      })),
    ].sort((a, b) => new Date(b.deposit_date) - new Date(a.deposit_date));

    return (
      <List>
        {combinedHistory.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    {item.tag} {item.status === "Successful" ? "✅" : "❌"}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDate(item.deposit_date)}
                    </Typography>
                    {item.tag === "Penalty" && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        style={{ display: "block" }}
                      >
                        Reason: {item.reason}
                      </Typography>
                    )}
                  </>
                }
              />
              <Typography variant="body1" style={{ marginLeft: "auto" }}>
                {item.tag === "Withdraw" || item.tag === "Penalty" ? "-" : "+"}{" "}
                ₹{item.deposit_amount}
              </Typography>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderWithdrawalsHistory = () => (
    <List>
      {history.withdrawal_history
        .sort(
          (a, b) => new Date(b.withdrawal_date) - new Date(a.withdrawal_date)
        )
        .map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Withdrawal{" "}
                    {item.status === "Successful"
                      ? "✅"
                      : item.status === "Pending"
                      ? "⏳"
                      : "❌"}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {item.selected_tab === "bank"
                        ? `Bank: ${item.account_number}`
                        : `UPI: ${item.upi_id}`}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDate(item.withdrawal_date)}
                    </Typography>
                  </>
                }
              />
              <Typography variant="body1" style={{ marginLeft: "auto" }}>
                - ₹{item.withdrawal_amount}
              </Typography>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
    </List>
  );

  const renderChallengeHistory = () => (
    <List>
      {history.challenge_history
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Challenge {item.status === "Running" ? "🏃" : "🔓"}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      ID: {item.challenge_id} | Room: {item.room}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      Created by: {item.created_by} | Opponent: {item.opponent}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDate(item.created_at)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
    </List>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <Paper elevation={3} style={{ margin: "20px", padding: "20px" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="history tabs">
          <Tab label="Wallet" />
          <Tab label="Withdraws" />
          <Tab label="Battle" />
        </Tabs>
      </Box>
      <Box sx={{ padding: 2 }}>
        {value === 0 && renderWalletHistory()}
        {value === 1 && renderWithdrawalsHistory()}
        {value === 2 && renderChallengeHistory()}
      </Box>
    </Paper>
  );
};

export default History;
