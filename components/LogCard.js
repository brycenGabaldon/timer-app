import React, { useState, useEffect } from "react";

const LogCard = ({ logs }) => {
  const [sortOption, setSortOption] = useState("time");
  const [displayLogs, setDisplayLogs] = useState([]);

  useEffect(() => {
    if (sortOption === "time") {
      const sortedByTime = [...logs].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setDisplayLogs(sortedByTime);
    } else {
      // Create groups with a guaranteed array for logs
      const groupedByTask = logs.reduce((acc, log) => {
        const taskName = log.action.split("'")[1];
        if (!acc[taskName]) {
          acc[taskName] = [];
        }
        acc[taskName].push(log);
        return acc;
      }, {});

      // Ensure each group is structured properly for rendering
      const groupedLogs = Object.keys(groupedByTask).map((taskName) => ({
        taskName,
        logs: groupedByTask[taskName].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        ),
      }));

      setDisplayLogs(groupedLogs);
    }
  }, [logs, sortOption]);

  const toggleSortOption = () => {
    setSortOption((prevOption) => (prevOption === "time" ? "task" : "time"));
  };

  return (
    <div className="log-card relative shadow-lg m-4 shadow-black bg-gray-700 text-center p-4 my-4 min-h-[150px] h-full rounded-lg">
      <div className="w-full flex flex-col justify-center px-10 float-left min-h-[150px] max-w-screen min-w-[250px] my-auto cursor-pointer rounded-lg">
        <span className="text-3xl text-black font-extrabold uppercase py-2">
          Logs
        </span>
        <button
          onClick={toggleSortOption}
          className="sort-button mb-4 bg-white text-black p-2 rounded"
        >
          Sort by {sortOption === "time" ? "Task" : "Time"}
        </button>
        {sortOption === "time"
          ? displayLogs.map((log, index) => (
              <div key={index} className="log-entry my-2">
                {`${log.action} - ${new Date(
                  log.timestamp
                ).toLocaleTimeString()}`}
              </div>
            ))
          : displayLogs.map((group) => (
              <div key={group.taskName}>
                <h4 className="text-black font-bold">{group.taskName}</h4>
                {group.logs &&
                  group.logs.map((log, logIndex) => (
                    <p key={logIndex} className="text-white">
                      {`${new Date(log.timestamp).toLocaleTimeString()} - ${
                        log.action
                      }`}
                    </p>
                  ))}
              </div>
            ))}
      </div>
    </div>
  );
};

export default LogCard;
