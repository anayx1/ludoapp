import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SystemUpdateRoundedIcon from "@mui/icons-material/SystemUpdateRounded";


const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      console.log("we are being triggered :D");
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };
  // if (!supportsPWA) {
  //   return null;
  // }
  return (
      <List>
    <ListItemButton
      style={{ display: "flex", gap: "5px", alignItems: "center" }}
    >
      <SystemUpdateRoundedIcon />
      <ListItemText
        onClick={onClick}
        primary={
          <Typography variant="body1" style={{ fontSize: "1.2rem" }}>
            Install App
          </Typography>
        }
      />
    </ListItemButton>
    </List>
  );
};

export default InstallPWA;
