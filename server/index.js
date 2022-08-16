import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { runCron } from "./lib/scraper";
import mongoose from "mongoose";
import {
  addSpotifyRefreshTokenToUser,
  getAuthorizationCode,
  getAuthorizationUrl,
  getSpotifyApi,
} from "./lib/spotify";
import http from "http";
import path from "path";
import { createNewCalendar } from "./lib/calendar";
import { supabase } from "./lib/supabase";

const APP_URL = process.env.APP_URL || "http://localhost:3000/";
const API_URL = process.env.API_URL || "http://localhost:8080/";

const app = express();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  app.use(cors());

  // initialize spotify API client
  const [success, spotifyApi] = await getSpotifyApi();

  // connect to mongoDB
  const db = mongoose.connection;
  db.on(
    "error",
    console.error.bind(console, "❌ Error connecting to MongoDB cluster: ")
  );
  db.once("open", function () {
    console.info("✅ Connected to MongoDB cluster");
  });

  // schedule cron job: run scraper every 10 seconds
  cron.schedule("*/10 * * * * *", () => {
    http.get(API_URL.replace("https", "http")); // keep dyno alive; can only call http
    if (!db) console.error("❌ failed to run cron job: no database connection");
    if (!success)
      console.error("❌ failed to run cron job: spotify not authorized");
    else {
      //   console.log(`⏲️ running cron job`);
      runCron(spotifyApi);
    }
  });

  ////////////////////////////////////////////////////////
  // Express routes
  ////////////////////////////////////////////////////////

  // get status of server
  app.get(`/api/status`, async (req, res, next) => {
    console.info("📃 called status endpoint");
    res.send("spotrack is running");
  });

  // authorise spotify access for user
  // implementation of Spotify Authorization code flow
  // (https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
  app.get("/api/spotify/auth", async function (req, res) {
    const authorizeUrl = await getAuthorizationUrl();
    console.info(`🔗 redirecting to ${authorizeUrl}`);

    res.redirect(authorizeUrl);
  });

  // handling callback from spotify authorization
  app.get("/callback", async function (req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;

    // check state match
    if (state === null) {
      res.redirect(`${APP_URL}?error=state-mismatch`);
    } else {
      try {
        // get authorization code
        const auth = await getAuthorizationCode(code);
        console.info("received authorization code");
        await addSpotifyRefreshTokenToUser(auth);

        res.redirect(`${APP_URL}?callbackStep=2`);
      } catch (error) {
        console.error(JSON.stringify(error));
        res.status(500).send(error);
      }
    }
  });

  // TODO: add support to specify custom calendar
  // create calendar for user
  app.get("/api/calendar/create", async function (req, res) {
    try {
      // parse authentication headers
      const accessOverride = req.get("X-Supabase-Auth") || null;
      if (!accessOverride) {
        console.error("User not authorized.");
        res.status(401).send("Unauthorized");
        return;
      }
      const jwt = JSON.parse(
        Buffer.from(accessOverride.split(".")[1], "base64").toString()
      );
      const userUid = jwt.sub;
      if (!userUid) throw new Error("No user UID found in JWT");

      // assert user is in supabase
      const { data: users } = await supabase.auth.api.listUsers();
      if (!users) throw new Error("Could not retrieve users from supdb");
      const databaseUser = users.find((user) => user.id === userUid);
      if (!databaseUser)
        throw new Error(`Could not find user ${userUid} in database`);
  
      // check if user has a calendar
      var calendarId = databaseUser.user_metadata.calendarId;
      // var calendarId = jwt.user_metadata.calendarId;
      if (!calendarId) {
        calendarId = await createNewCalendar(userUid, databaseUser.user_metadata.email);
      }
      res.send(calendarId);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // serve frontend application
  app.use(express.static(path.join(__dirname, "..", "build")));
  app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });
  console.log(`✅ Serving frontend application from build`);

  // start server
  app.listen(process.env.PORT, () => {
    console.log(
      `✅ Spotrack running on ${
        process.env.API_URL || `http://localhost:${process.env.PORT}`
      }`
    );
  });
}

main();
