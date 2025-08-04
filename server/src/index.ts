// index.ts (or app.ts)

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { rootRouter } from "./routes";
import { connectMongoDB } from "./db";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:4200";
const angularAppPath = path.join(
  __dirname,
  "../../client/dist/beatfinder/browser"
);

// Connect to MongoDB
connectMongoDB(); // Pass MONGODB_URI to your connect function

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true, // Enable credentials (cookies, authorization headers)
  })
);

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "../uploads/artists"))); // Serve uploaded assets
app.use(express.static(angularAppPath)); // Serve Angular app files

// API Routes
app.use("/api", rootRouter); // Mount your API routes

// Serve Angular app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(angularAppPath, "index.html"));
});

// Determine if running in production
const isProduction = process.env.NODE_ENV === "production";

// Start the server
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      isProduction ? "production" : "development"
    } mode on PORT: ${PORT}`
  );
});
