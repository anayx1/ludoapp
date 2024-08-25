import React, { useEffect, useState } from "react";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import SystemUpdateRoundedIcon from "@mui/icons-material/SystemUpdateRounded";

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const onClick = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (error) {
        console.error('Error during installation prompt:', error);
      }
    } else {
      // If installPrompt is null, guide them to manual installation
      alert("To install the app, please use your browser's 'Add to Home Screen' or 'Install' option from the menu.");
    }
  };

  if (isInstalled) {
    return null; // Don't show the install button if the app is already installed
  }

  return (
    <List>
      <ListItemButton
        onClick={onClick}
        aria-label="Install app"
        title="Install app"
        id="setup_button"
        style={{ display: "flex", gap: "5px", alignItems: "center" }}
      >
        <SystemUpdateRoundedIcon />
        <ListItemText
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