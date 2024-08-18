import { Button } from "@mui/material";
import Router from "next/router";
import React, { useState, useEffect } from "react";

const Wallet = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
    }
  }, []);

  const user_details = userData?.user_details;
  const token = userData?.token;

  const addCash = () => {
    Router.push("/add-cash");
  };

  const Withdraw = () => {
    Router.push("/withdraw");
  };

  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        marginTop: "5%",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: "95%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          gap: "30px",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            boxShadow:
              "0 6.4px 14.4px 0 rgb(0 0 0 / 13%), 0 1.2px 3.6px 0 rgb(0 0 0 / 11%)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2>Deposit Cash</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                backgroundColor: "#bfdcfe",
                color: "rgb(58 130 247)",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              <span>
                यह Cash Spin & Win एवं Buy की गई चिप्स है इनसे सिर्फ़ गेम खेले
                जा सकते है ॥ Bank या UPI में निकाला नहीं जा सकता है
              </span>
            </div>
            <div style={{ fontSize: "20px" }}>
              <b> ₹ {user_details?.wallet?.balance}</b>
            </div>
            <div style={{ width: "100%" }}>
              <Button
                style={{ width: "100%", background:"black" }}
                variant="contained"

                onClick={addCash}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: "400px",
            boxShadow:
              "0 6.4px 14.4px 0 rgb(0 0 0 / 13%), 0 1.2px 3.6px 0 rgb(0 0 0 / 11%)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2>Withdraw Cash</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                backgroundColor: "#bfdcfe",
                color: "rgb(58 130 247)",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              <span>
                यह Cash गेम से जीती हुई एवं रेफरल से कमाई हुई है इन्हें Bank या
                UPI में निकाला जा सकता है ॥ इन चिप्स से गेम भी खेला जा सकता है
              </span>
            </div>
            <div style={{ fontSize: "20px" }}>
              <b> ₹ {user_details?.wallet?.withdrawable_balance}</b>
            </div>
            <div style={{ width: "100%" }}>
              <Button
                style={{ width: "100%", background:"black" }}
                variant="contained"
                onClick={Withdraw}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Wallet;
