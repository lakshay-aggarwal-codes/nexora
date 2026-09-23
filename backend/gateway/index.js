import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controllers/user.controller.js";
import protect from "./middleware/auth.middleware.js";
import morgan from "morgan";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
dotenv.config();

const port = process.env.PORT || 8000;

const app = express();
app.use(
  cors({
    origin: process.env.FRONTED_URL,
    credentials:true
  }),
);
app.use(morgan("dev"))
app.use(cookieParser())
app.use("/api/auth", proxy(process.env.AUTH_SERVICE));
app.use("/api/chat",protect, proxyWithHeader(process.env.CHAT_SERVICE));
app.use("/api/agent",protect, proxyWithHeader(process.env.AGENT_SERVICE));
app.get("/api/me", protect, getCurrentUser)
app.get("/", (req, res) => {
  res.json({ message: "hello from gateway" });
});

app.listen(port, () => {
  console.log(`gateway started at ${port}`);
});
