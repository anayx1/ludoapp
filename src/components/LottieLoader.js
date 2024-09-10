"use client";
import React from "react";
import Lottie from "react-lottie";
import animationData from "@/components/loaderAnimation.json";

const LottieLoader = ({ width = 200, height = 200 }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Lottie options={defaultOptions} height={height} width={width} />
    </div>
  );
};

export default LottieLoader;