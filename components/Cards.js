import React, { useEffect, useState } from "react";

import { FaBeer, FaRegWindowClose } from "react-icons/fa";
import LogCard from "./LogCard";

const Cards = ({
  handleSetLogs,
  logs,
  setLogs,
  upload,
  handleUpload,
  logsGroupedByTask,
  handleLogsGroupedByTask,
}) => {
  const [localStorageChange, setLocalStorageChange] = useState(0);

  const [download, setDownload] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [activeTimers, setActiveTimers] = useState({});
  const [newSubTaskName, setNewSubTaskName] = useState("");
  const [showSubtasksOf, setShowSubtasksOf] = useState(null);

  // Utility function to debounce any function call
  const debounce = (func, delay) => {
    let timerId;
    return function (...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounce toggleTimer specifically for starting a timer
  const debouncedStartTimer = debounce((id, isSubtask, parentTaskId) => {
    toggleTimer(id, isSubtask, parentTaskId);
  }, 250); // 250ms delay

  const saveDataToFile = () => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("logs", JSON.stringify(logs));
      localStorage.setItem(
        "logsGroupedByTask",
        JSON.stringify(logsGroupedByTask)
      );
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");

    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        } else {
          console.error(
            "Expected tasks to be an array but received:",
            typeof parsedTasks
          );
          setTasks([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
        setTasks([]); // Fallback to an empty array if parsing fails
      }
    }
  }, []);

  const importLocalStorage = (file) => {
    if (!(file instanceof File)) {
      console.error("No Readable File object");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data) {
          if (typeof data.tasks === "string") {
            setTasks(JSON.parse(data.tasks));
            localStorage.setItem("tasks", data.tasks);
            console.log("Tasks imported successfully.");
          } else {
            console.warn("Imported tasks data is not a string.");
          }
          if (typeof data.logs === "string") {
            setLogs(JSON.parse(data.logs));
            localStorage.setItem("logs", data.logs);
            console.log("Logs imported successfully.");
          } else {
            console.warn("Imported logs data is not a string.");
          }
          if (
            data.logsGroupedByTask &&
            typeof data.logsGroupedByTask === "string"
          ) {
            handleLogsGroupedByTask(JSON.parse(data.logsGroupedByTask));
            console.log("logsGroupedByTask imported successfully.");
          } else {
            console.warn(
              "Imported data does not contain logsGroupedByTask or incorrect format."
            );
          }
        } else {
          console.error("Imported data is empty or incorrect format.");
        }
      } catch (error) {
        console.error("Failed to import data:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0]; // Extracts the first file
    if (file) {
      importLocalStorage(file); // Passes the file to the import function
    } else {
      console.error("No file selected");
    }
  };

  function exportLocalStorage() {
    // Serialize the data
    const data = {
      tasks: localStorage.getItem("tasks"),
      logs: localStorage.getItem("logs"),
      logsGroupedByTask: localStorage.getItem("logsGroupedByTask"),
    };

    const jsonString = JSON.stringify(data);

    // Create a blob and trigger a download
    const blob = new Blob([jsonString], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.json";
    document.body.appendChild(a); // Append the element to the DOM (required for Firefox)
    a.click();
    document.body.removeChild(a); // Remove the element after the download starts
  }

  function exportLocalStorage() {
    // Serialize the data
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const jsonString = JSON.stringify(data);

    // Create a blob and trigger a download
    const blob = new Blob([jsonString], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tasks.json";
    document.body.appendChild(a); // We need to append the element to the dom -> this is required for Firefox
    a.click();
    document.body.removeChild(a); // Remove the element after the download starts
  }

  // Import file and update localStorage

  useEffect(() => {
    importLocalStorage();
    const interval = setInterval(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) => {
          const isTaskActive = activeTimers[task.id];
          const updatedTask = {
            ...task,
            timer: isTaskActive ? task.timer + 1 : task.timer,
            subtasks: task.subtasks.map((subtask) => {
              const isSubtaskActive = activeTimers[subtask.id];
              return isSubtaskActive
                ? { ...subtask, timer: subtask.timer + 1 }
                : subtask;
            }),
          };
          return updatedTask;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimers]);

  // Example adjustment within Cards component

  const [timerStatus, setTimerStatus] = useState({});

  const toggleTimer = (name, id, parentName) => {
    setActiveTimers((prevActiveTimers) => {
      const isTimerActive = !!prevActiveTimers[id];
      let updatedActiveTimers = { ...prevActiveTimers };

      if (isTimerActive) {
        delete updatedActiveTimers[id]; // Stop the timer
        // Log stopping with task/subtask name for clarity
        handleSetLogs({
          action: `Stopped timer for '${name}'`,
          timestamp: new Date().toISOString(),
          parent: `${parentName !== "" ? parentName : ""}`,
        });
      } else {
        updatedActiveTimers[id] = true; // Start the timer
        // Log starting with task/subtask name for clarity
        handleSetLogs({
          action: `Started timer for '${name}'`,
          timestamp: new Date().toISOString(),
          parent: `${parentName !== "" ? parentName : ""}`,
        });
      }

      return updatedActiveTimers;
    });
  };

  useEffect(() => {
    if (timerStatus.id) {
      const timestamp = new Date().toISOString();
      handleSetLogs({
        action: `${timerStatus.action} timer for task '${timerStatus.id}'`,
        timestamp,
        parent: `${parentName !== "" ? parentName : ""}`,
      });
    }
  }, [timerStatus]);

  const handleAddTask = () => {
    // Prevent adding empty tasks
    if (!newTaskName.trim()) return;

    // Create a new task object
    const newTask = {
      id: `task${tasks.length + 1}`, // Example id generation, ensure uniqueness in your application
      name: newTaskName,
      subtasks: [],
      timer: 0,
    };

    // Add the new task to the existing tasks array
    setTasks((prevTasks) => [...prevTasks, newTask]);

    // Reset the new task name input field
    setNewTaskName("");
  };

  const handleAddSubTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                {
                  id: `${taskId}-${task.subtasks.length + 1}`,
                  name: newSubTaskName,
                  timer: 0,
                },
              ],
            }
          : task
      )
    );
    setNewSubTaskName("");
  };

  const toggleSubtasksView = (taskId) => {
    setShowSubtasksOf(showSubtasksOf === taskId ? null : taskId);
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 3600)}h ${Math.floor(
      (seconds % 3600) / 60
    )}m ${seconds % 60}s`;
  };
  const isTimerActive = (id) => !!activeTimers[id];

  const handleRemoveTask = (taskId) => {
    // Filter out the task with the given id
    const updatedTasks = tasks.filter((task) => task.id !== taskId);

    // Update the tasks state
    setTasks(updatedTasks);
  };
  return (
    <div className="task-container capitalize  w-full  h-full  flex-row flex-wrap place-content-center place-items-center gap-20 flex">
      {" "}
      <div className="flex flex-row flex-wrap mx-auto items-center justify-center min-h-[200px] h-full">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card  relative shadow-lg m-4 ${
              isTimerActive(task.id)
                ? "shadow-green-500/80 bg-green-300/60"
                : "shadow-black bg-gray-700"
            } text-center p-4 my-4 min-h-[150px] h-full rounded-lg `}
            onClick={(e) => toggleTimer(task.name, task.id, "")}
          >
            {" "}
            <button
              className="absolute top-0 right-0"
              onClick={() => handleRemoveTask(task.id)}
            >
              <FaRegWindowClose className="text-lg m-2" />
            </button>
            <div className="w-full flex flex-col justify-center px-10 float-left min-h-[150px] max-w-screen min-w-[250px]  my-auto cursor-pointer rounded-lg">
              <span className="text-3xl text-black font-extrabold uppercase py-2">
                {task.name}
              </span>{" "}
              <br /> {formatTime(task.timer)}
              <button
                className=" h-full py-2 "
                onClick={(e) => [
                  e.stopPropagation(),
                  toggleSubtasksView(task.id),
                ]}
              >
                Sub-Tasks
              </button>
            </div>
            {showSubtasksOf === task.id && (
              <>
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={`h-full w-full flex flex-col my-[5%] ${
                      activeTimers[subtask.id] ? "bg-green-500" : "bg-gray-600"
                    } text-black p-2 text-center rounded-lg z-[1000]`}
                  >
                    <span> {subtask.name}</span> <br />
                    {formatTime(subtask.timer)}
                    <button
                      className="bg-black text-white rounded-md"
                      onClick={(e) => [
                        e.stopPropagation(),

                        toggleTimer(subtask.name, subtask.id, task.name),
                      ]}
                    >
                      {activeTimers[subtask.id] ? "Stop" : "Start"}
                    </button>
                  </div>
                ))}
                <div className="subtask-add">
                  <input
                    className=" text-black mx-4 rounded-md p-2 bg-gray-400"
                    type="text"
                    placeholder="Add new subtask"
                    value={newSubTaskName}
                    onChange={(e) => [
                      e.stopPropagation(),
                      setNewSubTaskName(e.target.value),
                    ]}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => [
                      e.stopPropagation(),
                      handleAddSubTask(task.id),
                    ]}
                  >
                    Add
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <LogCard
          logs={logs}
          setLogs={setLogs}
          handleSetLogs={handleSetLogs}
          logsGroupedByTask={logsGroupedByTask}
          upload={upload}
          handleUpload={handleUpload}
          handleLogsGroupedByTask={handleLogsGroupedByTask}
        />
      </div>{" "}
      <div className="add-task-form">
        <input
          type="text"
          placeholder="Enter new task name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className=" text-black mx-4 rounded-md p-2 bg-gray-400"
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <button
        className="bg-gray-700 text-white font-bold p-4 rounded-lg shadow-lg shadow-black"
        onClick={() => {
          saveDataToFile();
          setDownload(!download);
          if (download) {
            exportLocalStorage();
          }
        }}
      >
        {download ? "Download" : "Save Time"}
      </button>
      <input type="file" onChange={handleFileImport} />
    </div>
  );
};

export default Cards;
