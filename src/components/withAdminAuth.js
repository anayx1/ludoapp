import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { CircularProgress, Box } from "@mui/material";


const withAdminAuth = (WrappedComponent) => {
  return (props) => {
    const Router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAdminAuth = () => {
        const userData = Cookies.get("userData");
        if (!userData) {
          Router.replace("/login");
          return;
        }

        try {
          const parsedUserData = JSON.parse(decodeURIComponent(userData));
          const userDetails = parsedUserData.user_details;

          if (!userDetails || userDetails.is_admin === false) {
            // User is not an admin, redirect to a non-admin page
            Router.replace("/admin");
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Invalid user data in cookie:", error);
          Cookies.remove("userData"); // Remove invalid cookie
          Router.replace("/login");
        }
      };

      checkAdminAuth();
    }, []);

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

export default withAdminAuth;
