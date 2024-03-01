import React, { useState, useEffect } from "react";

const LogCard = ({
  logs,
  logsGroupedByTask,
  upload,
  handleUpload,
  handleLogsGroupedByTask,
}) => {
  const [active, setActive] = useState(false);

  const [processedDurations, setProcessedDurations] = useState([]);

  useEffect(() => {
    setProcessedDurations(processAndSumDurations(logs));
  }, [logs]);
  const processAndSumDurations = (logs) => {
    const tasks = {};
    const startLogs = {};
    const processedLogs = []; // Assuming this is defined outside the forEach to collect processed log entries
    let note = "";
    logs.forEach((log) => {
      const taskDetail = log.action.match(/'(.+?)'/);
      const hasParent = log.parent !== undefined && log.parent !== "";
      const parentTaskName = hasParent
        ? log.parent
        : taskDetail
        ? taskDetail[1]
        : "Unknown Task";
      const taskName = hasParent
        ? `${log.parent}: ${taskDetail[1]}`
        : parentTaskName;

      if (log.action.startsWith("Started")) {
        // Logic for handling "Started" action
        // Here you set up the initial log entry in startLogs, without setting the note here
        startLogs[taskName] = {
          timestamp: log.timestamp,
          hasParent: hasParent,
          // Do not set the note here since it's managed in logsGroupedByTask
        };
      } else if (log.action.startsWith("Stopped") && startLogs[taskName]) {
        // Logic for handling "Stopped" action
        const startTimestamp = startLogs[taskName].timestamp;
        const stopTimestamp = log.timestamp;
        const durationInSeconds = Math.round(
          (new Date(stopTimestamp) - new Date(startTimestamp)) / 1000
        );
        const duration = formatDuration(durationInSeconds);
        const dateObject = new Date(startTimestamp);

        let note = "";

        // Check for the existence of the task in logsGroupedByTask to find an existing note
        if (
          logsGroupedByTask[parentTaskName] &&
          Array.isArray(logsGroupedByTask[parentTaskName])
        ) {
          const specificTask = logsGroupedByTask[parentTaskName].find(
            (task) => task.taskName === taskName
          );

          if (specificTask && specificTask.note) {
            note = specificTask.note; // Use the existing note if found
          }
        }

        // Push the processed log entry into processedLogs, including any found note
        processedLogs.push({
          taskName,
          range: `${formatTime(startTimestamp)} - ${formatTime(stopTimestamp)}`,
          duration: duration,
          parent: startLogs[taskName].hasParent,
          date: dateObject.toISOString().split("T")[0],
          note: note, // Apply the note from logsGroupedByTask if it existed
        });

        delete startLogs[taskName]; // Clean up startLogs entry after processing
      }

      // Additional logic for other actions or conditions can be added here
    });

    // Utility function to format duration into a human-readable string
    function formatDuration(durationInSeconds) {
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;

      return [hours, minutes, seconds]
        .map((unit) => (unit < 10 ? `0${unit}` : unit.toString())) // Zero padding for single-digit hours/minutes/seconds
        .join(":"); // Joining with colon as separator
    }

    // Utility function to format timestamps into a readable range
    function formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Change to true for AM/PM format
      });
    }

    const result = Object.entries(tasks).map(([taskName, times]) => {
      let totalDuration = 0;
      const minLength = Math.min(times.start.length, times.stop.length);

      for (let i = 0; i < minLength; i++) {
        totalDuration += times.stop[i] - times.start[i];
      }
      const totalMilliseconds = totalDuration; // Assuming totalDuration is in milliseconds

      // Convert milliseconds to hours, minutes, and seconds
      const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
      const minutes = Math.floor(
        (totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds =
        ((totalMilliseconds % (1000 * 60 * 60)) % (1000 * 60)) / 1000;

      let combinedDuration = "";

      if (hours > 0) {
        combinedDuration += `${hours}h `;
      }

      if (minutes > 0 || hours > 0) {
        combinedDuration += `${minutes}m `;
      }

      combinedDuration += `${seconds.toFixed(0)}s`;

      return {
        task: taskName,
        combinedDuration: combinedDuration,
      };
    });

    return result;
  };

  useEffect(() => {
    const processedLogs = processAndSumDurations(logs);
    setProcessedDurations(processedLogs);
  }, [logs]);
  const [sortOption, setSortOption] = useState("time"); // "time" or "task"
  const [logsSortedByTime, setLogsSortedByTime] = useState([]);

  // Save logsGroupedByTask to local storage
  useEffect(() => {
    localStorage.setItem(
      "logsGroupedByTask",
      JSON.stringify(logsGroupedByTask)
    );
  }, [logsGroupedByTask]);

  // Load logsGroupedByTask from local storage on component mount

  useEffect(() => {
    function filterChildTasks(logsGroupedByTask) {
      // Object to hold the filtered tasks, preserving the structure
      const filteredTasks = {};

      // Iterate over each key in the logsGroupedByTask object
      Object.keys(logsGroupedByTask).forEach((parentTaskName) => {
        // Filter out tasks that are considered "child" tasks based on naming convention
        const childTasks = logsGroupedByTask[parentTaskName].filter((task) =>
          task.taskName.includes(":")
        );

        // Assign the filtered array back to the corresponding key
        filteredTasks[parentTaskName] = childTasks;
      });

      return filteredTasks;
    }

    // Usage
    const childTasksOnly = filterChildTasks(logsGroupedByTask);
    console.log(childTasksOnly);

    const storedLogsGroupedByTask = localStorage.getItem("logsGroupedByTask");

    const parsedLogsGroupedByTask = JSON.parse(storedLogsGroupedByTask);
    console.log("Parsed logsGroupedByTask:", parsedLogsGroupedByTask);
    if (storedLogsGroupedByTask) {
      handleLogsGroupedByTask(JSON.parse(storedLogsGroupedByTask));
    }
  }, []);
  const processLogsForRangeAndDuration = (logs) => {
    const startLogs = {};
    const processedLogs = [];

    const formatDuration = (durationInSeconds) => {
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

      return parts.join(" ");
    };

    logs.forEach((log) => {
      const taskDetail = log.action.match(/'(.+?)'/);
      const hasParent = log.parent !== undefined && log.parent !== "";
      const parentTaskName = hasParent
        ? log.parent
        : taskDetail
        ? taskDetail[1]
        : "Unknown Task";
      const taskName = hasParent
        ? `${log.parent}: ${taskDetail[1]}`
        : parentTaskName;
      let note = "";

      // Check for the existence of the task in logsGroupedByTask to find an existing note
      if (
        logsGroupedByTask[parentTaskName] &&
        Array.isArray(logsGroupedByTask[parentTaskName])
      ) {
        const specificTask = logsGroupedByTask[parentTaskName].find(
          (task) => task.taskName === taskName
        );

        if (specificTask && specificTask.note) {
          note = specificTask.note; // Use the existing note if found
        }
      }

      let isTaskLogged = false;
      if (
        logsGroupedByTask[parentTaskName] &&
        Array.isArray(logsGroupedByTask[parentTaskName])
      ) {
        // If it's a child task, check within the parent task's array
        isTaskLogged = logsGroupedByTask[parentTaskName].some(
          (task) => task.taskName === taskName
        );
      } else if (!hasParent && logsGroupedByTask[taskName]) {
        // If it's a parent task, check directly
        isTaskLogged =
          Array.isArray(logsGroupedByTask[taskName]) &&
          logsGroupedByTask[taskName].length > 0;
      }

      if (log.action.startsWith("Started")) {
        // Determine if the task is present in logsGroupedByTask and has entries
        const isTaskLogged =
          logsGroupedByTask.hasOwnProperty(taskName) &&
          logsGroupedByTask[taskName].length > 0;
        console.log("====================================");
        console.log(logsGroupedByTask.hasOwnProperty(taskName));
        console.log("^ is child");
        console.log(taskName);
        console.log("^ is child of");
        console.log(logsGroupedByTask);
        // console.log(specificTaskName);
        console.log("====================================");
        console.log(isTaskLogged);
        console.log("^ is task logged");
        startLogs[taskName] = {
          timestamp: log.timestamp,
          hasParent: hasParent,
          note: note, // Adjust this logic based on your actual requirement
        };
      } else if (log.action.startsWith("Stopped") && startLogs[taskName]) {
        const startTimestamp = startLogs[taskName].timestamp;
        const stopTimestamp = log.timestamp;
        const durationInSeconds = Math.round(
          (new Date(stopTimestamp) - new Date(startTimestamp)) / 1000
        );
        const duration = formatDuration(durationInSeconds);
        const dateObject = new Date(startTimestamp);

        processedLogs.push({
          taskName,
          range: `${formatTime(startTimestamp)} - ${formatTime(stopTimestamp)}`,
          duration: duration,
          parent: startLogs[taskName].hasParent,
          date: dateObject.toISOString().split("T")[0],
          note: note,
        });

        delete startLogs[taskName];
      }
    });
    console.log(processedLogs);
    return processedLogs;
  };

  useEffect(() => {
    const processedLogs = processLogsForRangeAndDuration(logs);
    if (sortOption === "time") {
      setLogsSortedByTime(processedLogs);
    } else {
      // Initial pass to separate parent tasks
      const parents = {};
      processedLogs.forEach((log) => {
        if (!log.parent) {
          // Assuming this means it's a parent task itself
          parents[log.taskName] = [...(parents[log.taskName] || []), log];
        }
      });

      // Nest child tasks under their respective parents
      processedLogs.forEach((log) => {
        if (log.parent) {
          const parentName = log.taskName.split(": ")[0]; // Assuming the parent's name is part of the taskName
          if (!parents[parentName]) {
            parents[parentName] = [];
          }
          parents[parentName].push(log);
        }
      });
      handleLogsGroupedByTask(parents);
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

  const [noteStates, setNoteStates] = useState([]);
  const [noteInputs, setNoteInputs] = useState([]);

  useEffect(() => {
    const initialNoteStates = Array(logs.length).fill(false);
    const initialNoteInputs = logs.map((log) => log.note || ""); // Initialize with existing note or empty string
    setNoteStates(initialNoteStates);
    setNoteInputs(initialNoteInputs);

    const updatedLogGroupedByTask = { ...logsGroupedByTask };

    // Assuming handleLogsGroupedByTask is a state setter function
    handleLogsGroupedByTask(updatedLogGroupedByTask);
  }, [logs]);

  const toggleNote = (index) => {
    setNoteStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleNoteChange = (index, value) => {
    setNoteInputs((prevState) => ({
      ...prevState,
      [index]: value,
    }));
  };

  const addNote = (parentTaskName, logIndex) => {
    handleLogsGroupedByTask((prevLogsGroupedByTask) => {
      const updatedLogsGroupedByTask = { ...prevLogsGroupedByTask };

      if (updatedLogsGroupedByTask[parentTaskName]) {
        const updatedTaskLogs = updatedLogsGroupedByTask[parentTaskName].map(
          (log, i) => {
            if (i === logIndex + 1) {
              return {
                ...log,
                note: noteInputs[logIndex],
              };
            }

            return log;
          }
        );

        updatedLogsGroupedByTask[parentTaskName] = updatedTaskLogs;
      } else {
        console.error(`Parent task '${parentTaskName}' does not exist.`);
      }

      console.log("Updated logs grouped by task:", updatedLogsGroupedByTask);

      return updatedLogsGroupedByTask;
    });
  };

  const [note, setNote] = useState(false);

  return (
    <div className="log-card relative shadow-lg m-4 shadow-black bg-gray-700 text-center p-4 my-4 min-h-[150px] h-full rounded-lg">
      <div
        className="w-full flex flex-col justify-center px-10 float-left min-h-[150px] max-w-screen min-w-[250px] my-auto  rounded-lg cursor-pointer"
        onClick={() => setActive(!active)}
      >
        <span className="text-3xl text-black font-extrabold uppercase py-2 ">
          Logs
        </span>

        {active && (
          <div
            className="w-[75vw] bg-gray-600 border-black border-[1px] p-2 md:p-4 rounded-lg cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => [e.stopPropagation(), toggleSortOption()]}
              className="sort-button m-4 bg-white text-black p-2 rounded"
            >
              Sort by {sortOption === "time" ? "Task" : "Time"}
            </button>
            <button
              onClick={(e) => [e.stopPropagation(), setNote(!note)]}
              className="sort-button m-4 bg-white text-black p-2 rounded"
            >
              Note:
            </button>

            <>
              {" "}
              {note && (
                <>
                  {" "}
                  <br />{" "}
                  <span className="text-white">
                    Need to group by date then sort by main task then sort by
                    time
                  </span>
                </>
              )}
              {sortOption === "time" && logsSortedByTime
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
                    ([parentTaskName, taskLogs], index) => {
                      // Calculate combined duration of all child tasks
                      const combinedDuration = taskLogs
                        .filter((log) => log.taskName !== parentTaskName) // Exclude the parent task itself
                        .reduce(
                          (total, { duration }) =>
                            total + parseInt(duration, 10),
                          0
                        );

                      return (
                        <div key={index}>
                          <h4 className="text-black font-bold">
                            {parentTaskName} - Total: {combinedDuration}s
                          </h4>
                          {taskLogs
                            .filter(
                              (log) =>
                                log.taskName.includes(parentTaskName) &&
                                log.taskName !== parentTaskName
                            ) // Filter to include only child tasks
                            .map((log, logIndex) => (
                              <div
                                key={logIndex}
                                className="log-entry my-2 text-left cursor-pointer text-white"
                                onClick={() => toggleNote(logIndex)} // Toggle note display when clicked
                              >
                                {" "}
                                <div>
                                  {log.taskName.replace(
                                    parentTaskName + ": ",
                                    ""
                                  )}
                                  : {log.range}{" "}
                                  <span className="text-white float-right">
                                    {log.duration}
                                  </span>{" "}
                                  <p className="text-black m-2">{log.note}</p>
                                  {noteStates[logIndex] && (
                                    <div
                                      className="w-full"
                                      onClick={(e) => [e.stopPropagation()]}
                                    >
                                      <form
                                        className="w-full flex flex-row align-middle justify-center"
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          addNote(parentTaskName, logIndex);
                                        }}
                                      >
                                        <input
                                          className="w-3/4 text-black"
                                          type="text"
                                          value={noteInputs[logIndex]} // Ensure this is correctly bound
                                          onChange={(e) =>
                                            handleNoteChange(
                                              logIndex,
                                              e.target.value
                                            )
                                          }
                                        />

                                        <button className="w-1/4" type="submit">
                                          add note
                                        </button>
                                      </form>
                                    </div>
                                  )}
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
