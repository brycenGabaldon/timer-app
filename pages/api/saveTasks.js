// pages/api/saveTasks.js

import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Assuming your Next.js project is structured to allow writing to a specific directory
      const filePath = path.resolve("./public", "tasks.json");
      fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), "utf-8");
      res.status(200).json({ message: "Tasks saved successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving tasks", error: error.message });
    }
  } else {
    // Handle any requests that aren't POST
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
