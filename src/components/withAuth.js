import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { CircularProgress, Box } from "@mui/material";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const Router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        const userData = Cookies.get("userData");
        if (!userData) {
          Router.replace("/login");
        } else {
          try {
            // Attempt to parse the cookie to ensure it's valid JSON
            JSON.parse(decodeURIComponent(userData));
            setIsLoading(false);
          } catch (error) {
            console.error("Invalid user data in cookie:", error);
            Cookies.remove("userData"); // Remove invalid cookie
            Router.replace("/login");
          }
        }
      };

      checkAuth();
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

export default withAuth;
