import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = await MongoClient.connect(process.env.MONGO_URL);
      const db = client.db();
      const collection = db.collection("tasks");

      // Check if the collection is empty and insert placeholder data if it is
      const count = await collection.countDocuments();
      if (count === 0) {
        // Placeholder tasks - modify with your actual placeholder data
        const placeholderTasks = [
          { task: "Example Task 1", completed: false },
          { task: "Example Task 2", completed: false },
        ];
        await collection.insertMany(placeholderTasks);
      }

      // Now, handle the incoming tasks
      // This logic replaces all tasks with the new set provided in the request
      // Be careful with deleteMany in a production environment
      await collection.deleteMany({});
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
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
