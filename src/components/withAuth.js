import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Box } from "@mui/material";
import axios from "axios";
import Loader from "./Loader";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const Router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuthAndMaintenance = async () => {
        const cookieUserData = Cookies.get("userData");
        const sessionUserData = sessionStorage.getItem("userData");

        if (!cookieUserData && !sessionUserData) {
          Router.replace("/login");
          return;
        }

        try {
          let userData;
          if (cookieUserData) {
            userData = JSON.parse(decodeURIComponent(cookieUserData));
          } else if (sessionUserData) {
            userData = JSON.parse(sessionUserData);
          }

          // Check if user is blocked
          if (userData.user_details.is_blocked) {
            // Remove user data from cookies and session storage
            Cookies.remove("userData");
            sessionStorage.removeItem("userData");
            Router.replace("/login");
            return;
          }

          // Check maintenance mode
          const maintenanceResponse = await axios.get(
            "https://admin.aoneludo.com/maintainance/check/"
          );

          if (maintenanceResponse.data.maintenance) {
            // Redirect to maintenance page if maintenance mode is enabled
            Router.replace("/maintenance");
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error in authentication or maintenance check:", error);
          if (error.response && error.response.status === 503) {
            // If the server is in maintenance mode, it might return a 503 status
            Router.replace("/maintenance");
          } else {
            // Remove user data from cookies and session storage
            Cookies.remove("userData");
            sessionStorage.removeItem("userData");
            Router.replace("/login");
          }
        }
      };

      checkAuthAndMaintenance();
    }, [Router]);

    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Loader />
        </Box>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
