import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import Divider from "@mui/material/Divider";
import CachedIcon from "@mui/icons-material/Cached";

import { List, ListItemButton, ListItemText, Typography } from "@mui/material";

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleWalletClick = () => {
    router.push("/wallet");
  };
  const homePage = () => {
    router.push("/admin/dashboard");
  };
  const users = () => {
    router.push("/admin/users");
  };
  const battles = () => {
    router.push("/admin/battles");
  };
  const kyc = () => {
    router.push("/admin/kyc");
  };
  const funds = () => {
    router.push("/admin/deposits");
  };
  const withdrawls = () => {
    router.push("/admin/withdrawls");
  };
  const settings = () => {
    router.push("/admin/settings");
  };

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
    }
  }, []);
  const user_details = userData?.user_details;
  const token = userData?.token;
  // const { user_details, token } = userData;

  const handleLogout = () => {
    sessionStorage.removeItem("user_data");
    window.location.href = "/login";
  };
  const reload = () => {
    window.location.reload();
  };
  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
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
          <ListItemText
            onClick={users}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Users
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
          <ListItemText
            onClick={battles}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Battles
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
          <ListItemText
            onClick={kyc}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                KYC
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
          <ListItemText
            onClick={funds}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Funds
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
          <ListItemText
            onClick={withdrawls}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Withdrawls{" "}
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider />

      {/* <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <ListItemText
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Games{" "}
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Divider /> */}
      <List>
        <ListItemButton
          style={{ display: "flex", gap: "5px", alignItems: "center" }}
        >
          <ListItemText
            onClick={settings}
            primary={
              <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
                Settings{" "}
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
          <ListItemText
            onClick={handleLogout}
            primary={
              <Typography
                variant="body1"
                style={{ fontSize: "1.2rem", fontStyle: "italic" }}
              >
                Logout{" "}
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      {/* <Divider /> */}
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
            // justifyContent: "space-between",
            alignItems: "center",
            width: "90%",
            gap: "20px",
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
          <div style={{ fontSize: "20px", marginTop: "-4px" }}>
            Admin Panel{" "}
          </div>
          {/* <div>
            <img
              src={"logo_ludo.webp"}
              style={{ width: "100px", height: "auto" }}
              alt="logo"
              onClick={homePage}
            />
          </div> */}
        </div>
        <div>
          <CachedIcon style={{ cursor: "pointer" }} onClick={reload} />
        </div>
      </div>
    </>
  );
}
