import React, { useEffect, useState } from "react";

import { FaBeer, FaRegWindowClose } from "react-icons/fa";

const Cards = () => {
  const [tasks, setTasks] = useState([
    { id: "task1", name: "Timer 1", subtasks: [], timer: 0 },
    { id: "task2", name: "Timer 2", subtasks: [], timer: 0 },
  ]);
  const [newTaskName, setNewTaskName] = useState(""); // Step 1: New state for task name
  const [localStorageChange, setLocalStorageChange] = useState(0);
  const [activeTimers, setActiveTimers] = useState({});
  const [newSubTaskName, setNewSubTaskName] = useState("");
  const [showSubtasksOf, setShowSubtasksOf] = useState(null);
  const saveTasksToFile = () => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      console.log("Tasks saved successfully");
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };
  // Modified useEffect to load tasks from localStorage

  // Load tasks from localStorage or initialize with default
  useEffect(() => {
    const loadTasks = () => {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks);
          // Ensure parsedTasks is an array before setting it to state
          if (Array.isArray(parsedTasks)) {
            setTasks(parsedTasks);
          } else {
            // Default to an empty array if parsedTasks is not an array
            console.error("Stored tasks are not in array format");
            setTasks([]);
          }
        } catch (error) {
          console.error("Error parsing tasks from localStorage:", error);
          // Default to an empty array if parsing fails
          setTasks([]);
        }
      } else {
        // Initialize with default tasks if none are found in localStorage
        setTasks([
          // Default tasks initialization if needed
        ]);
      }
    };
    loadTasks();
  }, [localStorageChange]); // Depend on localStorageChange to trigger re-load

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
  function importLocalStorage(fileInput) {
    if (!fileInput) {
      // Optionally handle the case where no file is provided
      console.log("No file selected for import.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        for (const key in data) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
        // Update the state to trigger useEffect, only if import succeeds
        setLocalStorageChange((prev) => prev + 1);
        alert("LocalStorage data successfully imported!");
      } catch (error) {
        console.error("Failed to import file:", error);
        // Optionally handle file read or JSON parsing errors
      }
    };

    reader.readAsText(fileInput); // Assuming fileInput is the file object
  }

  // Function to handle file selection and trigger import
  const handleFileImport = (event) => {
    const file = event.target.files[0]; // Assuming single file selection
    if (file) {
      importLocalStorage(file);
    }
  };

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

  const toggleTimer = (id, isSubtask = false, parentTaskId = null) => {
    setActiveTimers((prevActiveTimers) => {
      let updatedActiveTimers = { ...prevActiveTimers };

      if (isSubtask) {
        // Toggle subtask timer
        if (prevActiveTimers[id]) {
          delete updatedActiveTimers[id]; // Stop the timer if it's already running
        } else {
          updatedActiveTimers[id] = true; // Start the timer
        }
      } else {
        // For parent tasks, stop all timers and toggle the clicked one
        if (prevActiveTimers[id]) {
          delete updatedActiveTimers[id]; // Stop the timer if it's already running
        } else {
          // Stop all timers first
          updatedActiveTimers = Object.keys(prevActiveTimers).reduce(
            (acc, timerId) => {
              if (timerId.startsWith(id + "-")) {
                // Keep subtask timers running
                acc[timerId] = true;
              }
              return acc;
            },
            {}
          );
          updatedActiveTimers[id] = true; // Start the clicked timer
        }
      }

      return updatedActiveTimers;
    });
  };
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
    <div className="task-container capitalize  w-full min-h-screen h-full  flex-row flex-wrap place-content-center place-items-center gap-20 flex">
      {" "}
      <div className="flex flex-row flex-wrap mx-auto items-center justify-center">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card  relative shadow-lg m-4 ${
              isTimerActive(task.id)
                ? "shadow-green-500/80 bg-green-300/60"
                : "shadow-black bg-gray-700"
            } text-center p-4 my-4 min-h-[150px] h-full rounded-lg `}
            onClick={() => toggleTimer(task.id)}
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
                        toggleTimer(subtask.id, true, task.id, e),
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
        onClick={() => [saveTasksToFile(), exportLocalStorage()]}
      >
        Save Time
      </button>
      <input type="file" onChange={handleFileImport} />
    </div>
  );
};

export default Cards;
