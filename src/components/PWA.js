import React, { useEffect, useState } from "react";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import SystemUpdateRoundedIcon from "@mui/icons-material/SystemUpdateRounded";

// Declare a global variable to store the install prompt event
if (typeof window !== "undefined") {
  window.deferredInstallPrompt = null;
}

const InstallPWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log("Before install prompt fired");
      window.deferredInstallPrompt = e;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log("App installed event fired");
      setIsInstalled(true);
      setIsInstallable(false);
      window.deferredInstallPrompt = null;
    };

    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("App is already in standalone mode");
      setIsInstalled(true);
    }

    // Check if we already captured an install prompt
    if (window.deferredInstallPrompt) {
      setIsInstallable(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const onClick = async () => {
    console.log(
      "Install button clicked. Install prompt state:",
      !!window.deferredInstallPrompt
    );
    if (window.deferredInstallPrompt) {
      try {
        console.log("Prompting for installation");
        window.deferredInstallPrompt.prompt();
        const { outcome } = await window.deferredInstallPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
          setIsInstalled(true);
          setIsInstallable(false);
          window.deferredInstallPrompt = null;
        } else {
          console.log("User dismissed the install prompt");
          // Keep the prompt available for future use
        }
      } catch (error) {
        console.error("Error during installation prompt:", error);
      }
    } else {
      console.log("Install prompt not available");
      alert(
        "To install the app, please use your browser's 'Add to Home Screen' or 'Install' option from the menu."
      );
    }
  };

  if (isInstalled || !isInstallable) {
    return null; // Don't show the install button if the app is already installed or not installable
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
