import React, { useState, useEffect } from "react";

const LogCard = ({ logs }) => {
  const [active, setActive] = useState(false);
  const processAndSumDurations = (logs) => {
    const tasks = {};

    logs.forEach((log) => {
      const match = log.action.match(/'([^']+)'/);
      const taskName = match ? match[1] : "Unknown";
      const timestamp = new Date(log.timestamp).getTime();

      if (!tasks[taskName]) {
        tasks[taskName] = { start: [], stop: [] };
      }

      if (log.action.startsWith("Started")) {
        tasks[taskName].start.push(timestamp);
      } else if (log.action.startsWith("Stopped")) {
        tasks[taskName].stop.push(timestamp);
      }
    });

    const result = Object.entries(tasks).map(([taskName, times]) => {
      let totalDuration = 0;
      const minLength = Math.min(times.start.length, times.stop.length);

      for (let i = 0; i < minLength; i++) {
        totalDuration += times.stop[i] - times.start[i];
      }

      return {
        task: taskName,
        combinedDuration: `${(totalDuration / 1000).toFixed(2)}s`,
      };
    });

    return result;
  };
  const [processedDurations, setProcessedDurations] = useState([]);

  useEffect(() => {
    const processedLogs = processAndSumDurations(logs);
    setProcessedDurations(processedLogs);
  }, [logs]);
  const [sortOption, setSortOption] = useState("time"); // "time" or "task"
  const [logsSortedByTime, setLogsSortedByTime] = useState([]);
  const [logsGroupedByTask, setLogsGroupedByTask] = useState({});
  const processLogsForRangeAndDuration = (logs) => {
    const startLogs = {};
    const processedLogs = [];

    const formatDuration = (durationInSeconds) => {
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;

      const parts = [];
      if (hours > 0) parts.push(hours + "h");
      if (minutes > 0) parts.push(minutes + "m");
      if (seconds > 0 || parts.length === 0) parts.push(seconds + "s");

      return parts.join(" ");
    };

    logs.forEach((log) => {
      const taskDetail = log.action.match(/'(.+?)'/);
      const taskName = taskDetail ? taskDetail[1] : "Unknown Task";
      if (log.action.startsWith("Started")) {
        startLogs[taskName] = log.timestamp;
      } else if (log.action.startsWith("Stopped") && startLogs[taskName]) {
        const startTimestamp = startLogs[taskName];
        const stopTimestamp = log.timestamp;
        const durationInSeconds = Math.round(
          (new Date(stopTimestamp) - new Date(startTimestamp)) / 1000
        );
        const duration = formatDuration(durationInSeconds);

        processedLogs.push({
          taskName,
          range: `${formatTime(startTimestamp)} - ${formatTime(stopTimestamp)}`,
          duration: duration,
        });
        delete startLogs[taskName];
      }
    });

    return processedLogs;
  };

  useEffect(() => {
    const processedLogs = processLogsForRangeAndDuration(logs);

    if (sortOption === "time") {
      setLogsSortedByTime(processedLogs);
    } else {
      const groupedByTask = processedLogs.reduce((acc, log) => {
        (acc[log.taskName] = acc[log.taskName] || []).push(log);
        return acc;
      }, {});
      setLogsGroupedByTask(groupedByTask);
    }
  }, [logs, sortOption]);

  const toggleSortOption = () => {
    setSortOption((prevOption) => (prevOption === "time" ? "task" : "time"));
  };

  const formatTime = (timestamp) => {
    // This is a placeholder; adjust formatting as needed
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="log-card relative shadow-lg m-4 shadow-black bg-gray-700 text-center p-4 my-4 min-h-[150px] h-full rounded-lg">
      <div className="w-full flex flex-col justify-center px-10 float-left min-h-[150px] max-w-screen min-w-[250px] my-auto cursor-pointer rounded-lg">
        <span
          className="text-3xl text-black font-extrabold uppercase py-2"
          onClick={() => setActive(!active)}
        >
          Logs
        </span>

        {active && (
          <div className="w-[75vw]">
            <button
              onClick={toggleSortOption}
              className="sort-button mb-4 bg-white text-black p-2 rounded"
            >
              Sort by {sortOption === "time" ? "Task" : "Time"}
            </button>
            <>
              {sortOption === "time"
                ? logsSortedByTime.map((log, index) => (
                    <div
                      key={index}
                      className="log-entry my-2 text-white text-left"
                    >
                      <br />
                      <span className="text-sm text-black">
                        {log.range}
                      </span>{" "}
                      <div>
                        <span className=" float-left "> {log.taskName}</span>{" "}
                        <span className="float-right"> {log.duration}</span>{" "}
                      </div>{" "}
                    </div>
                  ))
                : Object.entries(logsGroupedByTask).map(
                    ([taskName, taskLogs], index) => {
                      // Find the combined duration for this taskName
                      const combinedDurationObj = processedDurations.find(
                        (d) => d.task === taskName
                      );
                      const combinedDuration = combinedDurationObj
                        ? combinedDurationObj.combinedDuration
                        : "Calculating...";

                      return (
                        <div key={index}>
                          <h4 className="text-black font-bold">
                            {taskName} - Total: {combinedDuration}
                          </h4>
                          {taskLogs.map((log, logIndex) => (
                            <div
                              key={logIndex}
                              className="log-entry my-2 text-left text-white"
                            >
                              <div>
                                {log.range}{" "}
                                <span className="text-zinc-900 float-right">
                                  {log.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  )}
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogCard;
