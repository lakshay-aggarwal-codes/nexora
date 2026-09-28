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

const port = process.env.PORT || 8010;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!process.env.FRONTEND_URL) {
  console.warn(
    "[gateway] FRONTEND_URL is not set — defaulting CORS to http://localhost:5173. " +
      "Set FRONTEND_URL in backend/gateway/.env for other environments.",
  );
}

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl, server-to-server, etc.) with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
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
