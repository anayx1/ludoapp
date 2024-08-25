import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/AdminSidebar";
import Styles from "@/styles/adminDashboard.module.css";
import { useRouter } from "next/router";
import withAdminAuth from "@/components/withAdminAuth";


const Dashboard = () => {
  const [commissionData, setCommissionData] = useState({});
  const [depositData, setDepositData] = useState({});
  const [withdrawalData, setWithdrawalData] = useState({});
  const [battleData, setBattleData] = useState({});
  const [userBalance, setUserBalance] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch commission data
        const commissionResponse = await axios.get(
          `https://ludotest.pythonanywhere.com/panel/get-commisions/`
        );
        // console.log("Commission Data:", commissionResponse.data);
        setCommissionData(commissionResponse.data);

        // Fetch deposit data
        const depositResponse = await axios.get(
          `https://ludotest.pythonanywhere.com/panel/total-deposits/`
        );
        // console.log("Deposit Data:", depositResponse.data);
        setDepositData(depositResponse.data);

        // Fetch withdrawal data
        const withdrawalResponse = await axios.get(
          `https://ludotest.pythonanywhere.com/panel/total-withdrawals/`
        );
        // console.log("Withdrawal Data:", withdrawalResponse.data);
        setWithdrawalData(withdrawalResponse.data);

        const userBalance = await axios.get(
          `https://ludotest.pythonanywhere.com/panel/get-user-total/`
        );
        // console.log("Withdrawal Data:", withdrawalResponse.data);
        setUserBalance(userBalance.data);

        // Fetch battle data
        const battleResponse = await axios.get(
          `https://ludotest.pythonanywhere.com/panel/number-of-games/`
        );
        // console.log("Battle Data:", battleResponse.data);
        setBattleData(battleResponse.data);
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "NA";
    }
    return parseFloat(value).toFixed(2);
  };

  const deposit = () => {
    router.push("/admin/deposits");
  };
  const openbattles = () => {
    router.push("/admin/battles?tab=0");
  };
  const runningbattles = () => {
    router.push("/admin/battles?tab=1");
  };
  const closedbattles = () => {
    router.push("/admin/battles?tab=2");
  };
  const pendingbattles = () => {
    router.push("/admin/battles?tab=3");
  };
  const withdrawals
  = () => {
    router.push("/admin/withdrawls");
  };

  return (
    <>
      <Sidebar />

      <section className={Styles.sec}>
        <h2>Commission</h2>
        <div className={Styles.rootDiv}>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>Today</p>
            </div>
            <div>
              <p>{formatValue(commissionData.today)}</p>
            </div>
          </div>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>Admin</p>
            </div>
            <div>
              <p>{formatValue(commissionData.admin)}</p>
            </div>
          </div>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>Referral Commission</p>
            </div>
            <div>
              <p>{formatValue(commissionData.referal)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={Styles.sec}>
        <h2>Deposit</h2>
        <div className={Styles.rootDiv}>
          <div className={Styles.upperDiv} onClick={deposit}>
            <div className={Styles.lowerDiv} onClick={deposit}>
              <p>Today</p>
            </div>
            <div>
              <p>{formatValue(depositData.today)}</p>
            </div>
          </div>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>UPI Total</p>
            </div>
            <div>
              <p>{formatValue(depositData.upi_total)}</p>
            </div>
          </div>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>Admin</p>
            </div>
            <div>
              <p>{formatValue(depositData.admin)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={Styles.sec}>
        <h2>Battles</h2>
        <div className={Styles.rootDiv}>
          <div className={Styles.upperDiv} onClick={openbattles}>
            <div className={Styles.lowerDiv} onClick={openbattles}>
              <p>Open</p>
            </div>
            <div>
              <p>{battleData.open || "0"}</p>
            </div>
          </div>
          <div className={Styles.upperDiv} onClick={runningbattles}>
            <div className={Styles.lowerDiv} onClick={runningbattles}>
              <p>Running</p>
            </div>
            <div>
              <p>{battleData.running || "0"}</p>
            </div>
          </div>
          <div className={Styles.upperDiv} onClick={closedbattles}>
            <div className={Styles.lowerDiv} onClick={closedbattles}>
              <p>Closed</p>
            </div>
            <div>
              <p>{battleData.closed || "0"}</p>
            </div>
          </div>
          <div className={Styles.upperDiv} onClick={pendingbattles}>
            <div className={Styles.lowerDiv} onClick={pendingbattles}>
              <p>Pending</p>
            </div>
            <div>
              <p>{battleData.pending || "0"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={Styles.sec}>
        <h2>Withdrawals</h2>
        <div className={Styles.rootDiv}>
          <div className={Styles.upperDiv} onClick={withdrawals}>
            <div className={Styles.lowerDiv} onClick={withdrawals}>
              <p>Pending</p>
            </div>
            <div>
              <p>{formatValue(withdrawalData.pending)}</p>
            </div>
          </div>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>Total</p>
            </div>
            <div>
              <p>{formatValue(withdrawalData.successful)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={Styles.sec}>
        <h2>User Balance</h2>
        <div className={Styles.rootDiv}>
          <div className={Styles.upperDiv}>
            <div className={Styles.lowerDiv}>
              <p>Total</p>
            </div>
            <div>
              <p>{formatValue(userBalance.user_total)}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default withAdminAuth(Dashboard);
