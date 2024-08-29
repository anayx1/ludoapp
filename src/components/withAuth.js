import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { CircularProgress, Box } from "@mui/material";
import axios from "axios";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const Router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuthAndMaintenance = async () => {
        const userData = Cookies.get("userData");
        if (!userData) {
          Router.replace("/login");
          return;
        }

        try {
          // Attempt to parse the cookie to ensure it's valid JSON
          JSON.parse(decodeURIComponent(userData));

          // Check maintenance mode
          const maintenanceResponse = await axios.get(
            "https://ludotest.pythonanywhere.com/maintainance/check/"
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
            Cookies.remove("userData"); // Remove invalid cookie
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
          <CircularProgress />
        </Box>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;