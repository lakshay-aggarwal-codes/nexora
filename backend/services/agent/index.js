import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";  
dotenv.config();

const port = process.env.PORT || 8001;

const app = express();
app.use(express.json());  
app.get("/", (req, res) => {
  res.json({ message: "hello from agent" });
});

app.listen(port, () => {
  console.log(`Agent started at ${port}`);
  connectDB();
});
