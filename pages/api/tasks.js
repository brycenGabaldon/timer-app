// pages/api/tasks.js

import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // Define the path to the file
  const filePath = path.resolve("./public", "tasks.json");

  // Read the file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error reading tasks file" });
    }
    // Parse the JSON data and send it as a response
    const tasks = JSON.parse(data);
    res.status(200).json(tasks);
  });
}
