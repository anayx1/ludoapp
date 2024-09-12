import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchUserDetails = async (userId, token) => {
    try {
      const response = await fetch(
        `https://admin.aoneludo.com/auth/get-user-details/${userId}/`,
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
      setUserId(parsedData.user_details.id);
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

  useEffect(() => {
    loadAndUpdateUserData();
  }, []);

  useEffect(() => {
    let socketIo = null; 
    if(userId){
      socketIo = io("https://socket.aoneludo.com");
      setSocket(socketIo);
      socketIo.on("connect", () => {
        console.log("Connected to the server");
        socketIo.emit("user-joined", userId);
        socketIo.on("balance-update", async (data) => {
          if (data == userId) {
            loadAndUpdateUserData();
          }
        });
      });
    }
    return () => {
      socketIo?.disconnect();
    };
  }, [userId]);

  const config = {
    socket,
    userData,
    userId,
    loadAndUpdateUserData,
    walletBalance,
    setWalletBalance
  };

  return (
    <SocketContext.Provider value={config}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const { socket, userId, userData, loadAndUpdateUserData, walletBalance, setWalletBalance } =
    useContext(SocketContext);
  return { socket, userId, userData, loadAndUpdateUserData, walletBalance, setWalletBalance };
};

export default SocketContextProvider;
