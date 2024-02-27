import React, { useEffect, useState } from "react";

const Cards = () => {
  const [tasks, setTasks] = useState([
    { id: "task1", name: "Vast", subtasks: [], timer: 0 },
    { id: "task2", name: "Ahura", subtasks: [], timer: 0 },
  ]);
  const [newTaskName, setNewTaskName] = useState(""); // Step 1: New state for task name

  const [activeTimers, setActiveTimers] = useState({});
  const [newSubTaskName, setNewSubTaskName] = useState("");
  const [showSubtasksOf, setShowSubtasksOf] = useState(null);
  const saveTasksToFile = async () => {
    try {
      const response = await fetch("/api/saveTasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tasks),
      });
      if (!response.ok) {
        throw new Error("Failed to save tasks");
      }
      const result = await response.json();
      console.log(result.message); // You can handle the success state here
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };
  useEffect(() => {
    // Function to fetch tasks
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);
  useEffect(() => {
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
    <div className="task-container capitalize  w-full min-h-screen h-full  flex-col place-content-center place-items-center gap-20 flex">
      {" "}
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card bg-gray-700 relative shadow-xl ${
              isTimerActive(task.id) ? "shadow-green-500" : "shadow-black"
            } text-center p-4 my-4 min-h-[150px] h-full rounded-lg flex flex-col flex-wrap`}
            onClick={() => toggleTimer(task.id)}
          >
            {" "}
            <button
              className="absolute top-0 right-0"
              onClick={() => handleRemoveTask(task.id)}
            >
              X
            </button>
            <div className="w-full flex flex-col justify-center min-w-[300px]  my-auto cursor-pointer rounded-lg">
              <span className="text-3xl text-black font-extrabold uppercase">
                {task.name}
              </span>{" "}
              <br /> {formatTime(task.timer)}
              <button
                className=" h-full "
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
                    onChange={(e) => setNewSubTaskName(e.target.value)}
                  />
                  <button onClick={() => handleAddSubTask(task.id)}>Add</button>
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
        onClick={saveTasksToFile}
      >
        Save Time
      </button>
    </div>
  );
};

export default Cards;
