import Image from "next/image";
import React from "react";

const Maintenance = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: "#f4f4f4",
        textAlign: "center",
        color: "#333",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          marginTop: "20px",
          fontWeight: "bold",
        }}
      >
        We're Under Maintenance
      </h1>
      <Image
        src={"/maintenance.svg"}
        height={250}
        width={250}
        alt="Maintenance"
      />
      <p
        style={{
          fontSize: "1rem",
          marginTop: "10px",
          maxWidth: "500px",
          //   padding:"5px",
          textAlign: "center",
          maxWidth:"90%"
        }}
      >
        Our site is currently undergoing scheduled maintenance. We apologize for
        the inconvenience and appreciate your patience. Please check back soon!
      </p>
    </div>
  );
};

export default Maintenance;
