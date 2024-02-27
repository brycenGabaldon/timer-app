// pages/api/tasks.js
/* 
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
} */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
const uri = process.env.MONGO_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function handler(req, res) {
  try {
    await client.connect();
    const database = client.db("brycen"); // Replace with your database name
    const collection = database.collection("timers"); // Replace with your collection name

    // Fetch all tasks.
    let tasks = await collection.find({}).toArray();

    // Check if any tasks exist, if not, insert default tasks and fetch again
    if (tasks.length === 0) {
      // Define your default tasks here
      const defaultTasks = [
        { name: "Default Task 1", subtasks: [], timer: 0 },
        { name: "Default Task 2", subtasks: [], timer: 0 },
      ];

      // Insert default tasks into the collection
      await collection.insertMany(defaultTasks);

      // Fetch the tasks again, now it should include the default tasks
      tasks = await collection.find({}).toArray();
    }

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error connecting to the database",
      error: err.message,
    });
  } finally {
    await client.close();
  }
}
