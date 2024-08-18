import React from "react";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";
import History from "@/components/History";

const history = () => {
  return (
    <>
      <Sidebar />
      <History/>
    </>
  );
};

export default withAuth(history);
