import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/auth.routes.js";

dotenv.config();

const port = process.env.PORT || 8001; // gateway=8000, auth=8001, chat=8002, agent=8003

const app = express();
app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "hello from auth" });
});

app.listen(port, () => {
  console.log(`auth started at ${port}`);
  connectDB();
});
