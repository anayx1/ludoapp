import { Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

const Dashboard = () => {
  return (
    <>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          // justifyContent: "center",
          alignItems: "center",
          width: "100%",
          gap: "10%",
          backgroundColor:"black",
          // backgroundImage: "url('/bg.jpg')",
          // backgroundSize: "cover",
          // backgroundPosition: "center",
          // backgroundRepeat: "no-repeat",
          minHeight: "95vh", // Ensures the background covers the full viewport height
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            backgroundColor: "#fee2e1",
            color: "#ef4544",
            height: "auto",
            textAlign: "center",
            borderRadius: "20px",
            marginTop: "10px",
          }}
        >
          Notice:- पॉपुलर का रूम कोड डालने पर यूजर का बैलेंस जीरो कर दिया जायेगा
          🙏 (User's balance will be reduced to zero on entering Popular's room
          code)
        </div>
        <div>
          <h2 style={{ color: "white" }}>Games</h2>
        </div>

        <div
          style={{
            width: "90%",
            margin: "10px 0 0 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "320px" }}>
            <Link
              href="/battles"
              color="primary"
              style={{ textDecoration: "none" }}
            >
              <img
                src="/ludoimg.jpeg"
                width={320}
                height={200}
                style={{ borderRadius: "10px 10px 0 0" }}
              />
              <p
                style={{
                  backgroundColor: "#0f172a",
                  margin: "0px",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "0 0 10px 10px",
                }}
              >
                Classic 50 - 15000
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
