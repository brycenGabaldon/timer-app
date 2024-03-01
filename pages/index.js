import Cards from "@/components/Cards";
import LogCard from "@/components/LogCard";
import React, { useEffect, useState } from "react";

const Index = () => {
  // Use an object to track the active card and its timer value
  const [activeTimer, setActiveTimer] = useState({
    activeId: null,
    startTime: null,
  });
  const [logsGroupedByTask, setLogsGroupedByTask] = useState({});
  const [logs, setLogs] = useState([]);
  const [upload, setUpload] = useState(0);
  const handleUpload = () => {
    setUpload(upload + 1);
  };
  const [tasks, setTasks] = useState([]);
  // Save logs to local storage
  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);
  // Save logs to local storage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);
  // Save logs to local storage
  useEffect(() => {
    localStorage.setItem(
      "logsGroupedByTask",
      JSON.stringify(logsGroupedByTask)
    );
  }, [logsGroupedByTask]);

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

  const handleLogsGroupedByTask = (item) => {
    setLogsGroupedByTask(item);
  };
  useEffect(() => {
    const loadDataFromLocalStorage = () => {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks);
          // Ensure parsedTasks is an array before setting it to state
          if (Array.isArray(parsedTasks)) {
            setTasks(parsedTasks);
          } else {
            console.error("Stored tasks are not in array format");
            setTasks([]);
          }
        } catch (error) {
          console.error("Error parsing tasks from localStorage:", error);
          setTasks([]);
        }
      } else {
        // Initialize with default tasks if none are found in localStorage
        setTasks([]);
      }

      const storedLogs = localStorage.getItem("logs");
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs);
          setLogs(parsedLogs);
        } catch (error) {
          console.error("Error parsing logs from localStorage:", error);
          setLogs([]);
        }
      } else {
        setLogs([]);
      }

      const storedLogsGroupedByTask = localStorage.getItem("logsGroupedByTask");
      if (storedLogsGroupedByTask) {
        const parsedLogsGroupedByTask = JSON.parse(storedLogsGroupedByTask);
        // Now parsedLogsGroupedByTask will be an object
        setLogsGroupedByTask(parsedLogsGroupedByTask);
      } else {
        setLogsGroupedByTask({});
      }
    };

    loadDataFromLocalStorage();
  }, [upload]);
  return (
    <div className="place-items-center  place-content-center flex  gap-[100px] w-screen min-h-screen bg-gray-900 overflow-x-hidden p-[2vw]">
      <Cards
        activeTimer={activeTimer}
        setActiveTimer={setActiveTimer}
        handleSetLogs={handleSetLogs}
        logs={logs}
        setLogs={setLogs}
        upload={upload}
        handleUpload={handleUpload}
        logsGroupedByTask={logsGroupedByTask}
        handleLogsGroupedByTask={handleLogsGroupedByTask}
      />
    </div>
  );
};

export default Index;
