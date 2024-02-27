// pages/api/saveTasks.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      const client = await MongoClient.connect(process.env.MONGO_URL);
      const db = client.db(); // If your database has a specific name, pass it here

      // Assuming your tasks are stored in a collection named "tasks"
      const collection = db.collection("tasks");

      // Update tasks in the database
      // This example assumes you want to replace all tasks; modify as needed for your use case
      await collection.deleteMany({}); // Be cautious with this operation
      await collection.insertMany(req.body.tasks);

      client.close();

      res.status(200).json({ message: "Tasks saved successfully" });
    } catch (error) {
      console.error(error);
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
