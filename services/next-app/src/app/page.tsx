"use client";
import { useState } from "react";
import LaunchPage from "@/components/LaunchPage";
import Main from "@/components/Main";

export default function Page() {
  const [showLaunch, setShowLaunch] = useState(true);

  const handleLaunchComplete = () => {
    setShowLaunch(false);
  };

  return (
    <>
      {showLaunch ? (
        <LaunchPage onComplete={handleLaunchComplete} />
      ) : (
        <Main />
      )}
    </>
  );
}