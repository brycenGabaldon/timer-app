import Cards from "@/components/Cards";
import LogCard from "@/components/LogCard";
import React, { useEffect, useState } from "react";

const Index = () => {
  // Use an object to track the active card and its timer value
  const [activeTimer, setActiveTimer] = useState({
    activeId: null,
    startTime: null,
  });
  const [logs, setLogs] = useState([]);

  // Save logs to local storage
  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  // Load logs from local storage on component mount
  useEffect(() => {
    const storedLogs = localStorage.getItem("logs");
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  const handleSetLogs = (newLog) => {
    setLogs((currentLogs) => {
      // Check if the newLog exactly exists
      const duplicate = currentLogs.some(
        (log) =>
          log.action === newLog.action && log.timestamp === newLog.timestamp
      );
      if (!duplicate) {
        return [...currentLogs, newLog];
      } else {
        return currentLogs; // Return currentLogs unmodified if duplicate is found
      }
    });
  };

  return (
    <div className="place-items-center  place-content-center flex  gap-[100px] w-screen min-h-screen bg-gray-900 overflow-x-hidden p-[2vw]">
      <Cards
        activeTimer={activeTimer}
        setActiveTimer={setActiveTimer}
        handleSetLogs={handleSetLogs}
        logs={logs}
        setLogs={setLogs}
      />
    </div>
  );
};

export default Index;
