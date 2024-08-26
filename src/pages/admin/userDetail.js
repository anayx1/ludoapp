import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const UserDetail = () => {
  return (
    <Box sx={{ maxWidth: 400, margin: "auto", p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">User Name</Typography>
            <Typography variant="body2" sx={{ color: "green" }}>
              active
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Typography variant="body2">Id: -</Typography>
            <Typography variant="body2">Name: -</Typography>
            <Typography variant="body2">Mobile: -</Typography>
            {/* <Typography variant="body2">Otp: -</Typography> */}
            <Typography variant="body2">Win: -</Typography>
            <Typography variant="body2">Cash: -</Typography>
            <Typography variant="body2">Total Balance: -</Typography>
            <Typography variant="body2">DOJ: -</Typography>
            <TextField
              label="ReferBy"
              variant="outlined"
              fullWidth
              size="small"
            />
          </Stack>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Actions
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button variant="contained" color="primary" size="small">
              TopUp
            </Button>
            <Button variant="outlined" color="error" size="small">
              Deduct Balance
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kyc Details
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">Name: -</Typography>
            <Typography variant="body2">Document Number: -</Typography>
          </Stack>
          <Box
            component="img"
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              mt: 2,
              borderRadius: 1,
            }}
            alt="KYC Document"
            src="/refer.jpg"
          />
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Wallet History
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 300, overflow: "auto" }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Txn Id</TableCell>
                  <TableCell>Cash</TableCell>
                  <TableCell>Win</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Closing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(10)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetail;
