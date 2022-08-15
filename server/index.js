import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { runCron } from "./lib/scraper";
import mongoose from "mongoose";
import { getSpotifyApi } from "./lib/spotify";
import http from "http";
import path from "path";

const app = express();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  const [success, spotifyApi] = await getSpotifyApi();
  app.use(cors());

  // connect db
  const db = mongoose.connection;
  db.on(
    "error",
    console.error.bind(console, "❌ Error connecting to MongoDB cluster: ")
  );
  db.once("open", function () {
    console.log("✅ Connected to MongoDB cluster");
  });

  // run every 10 seconds
  cron.schedule("*/10 * * * * *", () => {
    http.get("http://spotrack.herokuapp.com");
    if (!db) console.error("❌ failed to run cron job: no database connection");
    if (!success)
      console.error("❌ failed to run cron job: spotify not authorized");
    else {
    //   console.log(`⏲️ running cron job`);
      runCron(spotifyApi);
    }
  });

  // express routes
  app.get(`/status`, async (req, res, next) => {
    console.log("📃 called status endpoint");

    //   const [iCount, tCount] = await Promise.all([
    //     getInstagramCount(),
    //     getTwitterCount(),
    //   ]);
    //   res.json({ iCount, tCount });

    res.send("spotrack is running");
  });

  // app.get(`/status`, async (req, res, next) => {
  //   console.log("🏠 called default endpoint");
  //   res.send("spotrack is running");
  // });

  app.use(express.static(path.join(__dirname, "..", "build")));
  app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });

  // start server
  app.listen(process.env.PORT, () => {
    console.log(`✅ Spotrack running on http://localhost:${process.env.PORT}`);
  });
}

main();
