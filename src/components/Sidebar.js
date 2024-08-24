import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Divider from "@mui/material/Divider";
import Cookies from "js-cookie";

import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CachedIcon from "@mui/icons-material/Cached";
import HomeIcon from "@mui/icons-material/Home";
import InstallPWA from "./PWA";

export default function TemporaryDrawer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchUserDetails = async (userId, token) => {
    try {
      const response = await fetch(
        `https://ludotest.pythonanywhere.com/auth/get-user-details/${userId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const getDecodedCookieData = () => {
    const cookieData = Cookies.get("userData");
    return cookieData ? JSON.parse(decodeURIComponent(cookieData)) : null;
  };

  useEffect(() => {
    const loadAndUpdateUserData = async () => {
      let storedData = sessionStorage.getItem("userData");
      if (!storedData) {
        const cookieData = getDecodedCookieData();
        if (cookieData) {
          storedData = JSON.stringify(cookieData);
        }
      }

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        setWalletBalance(parsedData.user_details.wallet.balance || 0);

        // Fetch latest user details
        const updatedData = await fetchUserDetails(
          parsedData.user_details.id,
          parsedData.token
        );
        if (updatedData) {
          const newUserData = {
            ...parsedData,
            user_details: updatedData.user_details,
          };
          const newUserDataString = JSON.stringify(newUserData);
          sessionStorage.setItem("userData", newUserDataString);
          Cookies.set("userData", newUserDataString, { expires: 7 }); // Cookie expires in 7 days
          setUserData(newUserData);
          setWalletBalance(newUserData.user_details.wallet.balance || 0);
        }
      }
    };

    loadAndUpdateUserData();
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleWalletClick = () => {
    router.push("/wallet");
  };

  const homePage = () => {
    router.push("/");
  };

  const profile = () => {
    router.push("/profile");
  };

  const wallet = () => {
    router.push("/wallet");
  };

  const InstallApp = () => {
    router.push("/Install");
  };

  const legal = () => {
    router.push("/legal");
  };

  const history = () => {
    router.push("/history");
  };

  const refer = () => {
    router.push("/referandearn");
  };

  const reload = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    Cookies.remove("userData");
    setWalletBalance(0);
    window.location.href = "/login";
  };

  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation" onClick={toggleDrawer(false)}>
      <List style={{ paddingLeft: "15px" }}>
        <Typography variant="body1" style={{ fontSize: "1.5rem" }}>
          <b>Hello, {userData?.user_details?.username}</b>
        </Typography>
      </List>
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <HomeIcon />
          <ListItemText
            onClick={homePage}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Home
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <PersonRoundedIcon />
          <ListItemText
            onClick={profile}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Profile
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <AccountBalanceWalletRoundedIcon />
          <ListItemText
            onClick={wallet}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Wallet
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <HistoryRoundedIcon />
          <ListItemText
            onClick={history}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                History
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          <img src={"/ref.svg"} height={20} width={20} />
          <ListItemText
            onClick={refer}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Refer and Earn
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <AssignmentRoundedIcon />
          <ListItemText
            onClick={legal}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Legal Terms
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />
      <InstallPWA />
      <Divider />
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <ListItemText
            onClick={handleLogout}
            primary={
              <Typography
                variant="body1"
                style={{ fontSize: "1.2rem", fontStyle: "italic" }}
              >
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          alignItems: "center",
          width: "100%",
          backgroundColor: "black",
          color: "white",
          height: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "90%",
          }}
        >
          <div>
            <MenuIcon
              onClick={toggleDrawer(true)}
              style={{ fontSize: "2.2rem" }}
            />
            <Drawer open={open} onClose={toggleDrawer(false)}>
              {DrawerList}
            </Drawer>
          </div>
          <div>
            <img
              src={"logo_ludo.webp"}
              style={{ width: "100px", height: "auto" }}
              alt="logo"
              onClick={homePage}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: "15px",
            }}
          >
            <CachedIcon style={{ cursor: "pointer" }} onClick={reload} />
            <div
              onClick={handleWalletClick}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                border: "1px solid white",
                padding: "5px",
                borderRadius: "10px",
              }}
            >
              <AccountBalanceWalletIcon style={{ fontSize: "2.2rem" }} />
              <Typography style={{ fontSize: "1rem", color: "white" }}>
                {walletBalance.toFixed(1)}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
