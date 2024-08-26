import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/admin/AdminSidebar";
import withAdminAuth from "@/components/withAdminAuth";

const UserComponent = () => {
  const [userData, setUserData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "https://ludotest.pythonanywhere.com/panel/get-users/"
        );
        setUserData(response.data.users || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const filteredUserData = useMemo(() => {
    return userData.filter((user) =>
      Object.values(user).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [userData, searchTerm]);

  const handleViewDetails = (userId) => {
    router.push(`/admin/userDetail/`);
  };

  return (
    <>
      <Sidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "95%" }}>
          <Typography
            variant="h4"
            sx={{ mb: 2, justifyContent: "center", textAlign: "center", mt: 2 }}
          >
            Users
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr no.</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>KYC</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUserData.length > 0 ? (
                  filteredUserData.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.phone_number}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>{user.verified ? "Yes" : "No"}</TableCell>
                      <TableCell>{user.kyc ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          // onClick={() => handleViewDetails(user.id)}
                          onClick={handleViewDetails}
                          >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </>
  );
};

export default withAdminAuth(UserComponent);
