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
import { createNewCalendar, shareCalendarWithUser, updateUserCalendarData } from "./lib/calendar";
import { supabase } from "./lib/supabase";
import bodyParser from "body-parser";

const APP_URL = process.env.APP_URL || "http://localhost:3000/";
const API_URL = process.env.API_URL || "http://localhost:8080/";

const app = express();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  app.use(cors());
  // app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json

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

  const parseCalendarRequest = async (req, res) => {
    // parse request params
    const accessOverride = req.get("X-Supabase-Auth") || null;
    const calendarEmail = req.body.calendarEmail;

    // check JWT
    if (!accessOverride) {
      console.error("User not authorized.");
      return res.status(401).send("Unauthorized");
    }
    if (!calendarEmail) {
      console.error("No email provided.");
      return res.status(400).send("Missing calendarEmail in request body");
    }

    // parse authentication headers
    const jwt = JSON.parse(
      Buffer.from(accessOverride.split(".")[1], "base64").toString()
    );
    const userUid = jwt.sub;
    if (!userUid) {
      console.error("No user UID found in JWT");
      return res.status(400).send("Missing user UID");
    }

    // assert user is in supabase
    const { data: users } = await supabase.auth.api.listUsers();
    if (!users) {
      console.error("Could not retrieve users from supdb");
      return res.status(500).send("Error");
    }
    const databaseUser = users.find((user) => user.id === userUid);
    if (!databaseUser) {
      console.error(`Could not find user ${userUid} in database`);
      return res.status(500).send("Unknown user");
    }

    return { calendarEmail, userUid, databaseUser };
  };

  // create calendar for user
  app.post("/api/calendar/create", async function (req, res) {
    try {
      const { calendarEmail, userUid, databaseUser } =
        await parseCalendarRequest(req, res);

      console.info(`📅 creating calendar for user ${userUid}`);
      // check if user has a calendar
      var calendarId = databaseUser.user_metadata.calendarId;
      if (!calendarId) {
        calendarId = await createNewCalendar(userUid, calendarEmail);
      }
      res.send({calendarId, calendarEmail});
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // create calendar for user
  app.post("/api/calendar/update", async function (req, res) {
    try {
      const { calendarEmail, userUid, databaseUser } =
        await parseCalendarRequest(req, res);

      console.info(`📅 changing email for user ${userUid}`);
      // confirm that user has a calendar
      var calendarId = databaseUser.user_metadata.calendarId;
      if (!calendarId) {
        console.error(`Could not find user ${userUid} in database`);
        return res.status(500).send("Unknown user");
      }

      // share calendar with new email
      await shareCalendarWithUser(calendarId, calendarEmail);

      // update user record with calendar ID and calendar email
      await updateUserCalendarData(userUid, calendarId, calendarEmail);

      res.send({calendarId, calendarEmail});
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
