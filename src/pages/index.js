import React from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import withAuth from "@/components/withAuth";

const index = () => {
  return (
    <>
      <Sidebar />
      <Dashboard />
    </>
  );
};

export default withAuth(index);
