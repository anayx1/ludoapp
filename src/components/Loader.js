import React from "react";
import Styles from "@/styles/loader.module.css";

const loader = () => {
  return (
    <>
      <div className={Styles.loaderRectangle}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

export default loader;
