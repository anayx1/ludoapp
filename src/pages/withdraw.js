import React from "react";
import Sidebar from "@/components/Sidebar";
import Withdraw from "@/components/Withdraw";
import withAuth from "@/components/withAuth";

const withdraw = () => {
  return (
    <>
      <Sidebar />
      <Withdraw />
    </>
  );
};

export default withAuth(withdraw);
