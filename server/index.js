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
import path from "path";
import { createNewCalendar, shareCalendarWithUser } from "./lib/calendar";
import bodyParser from "body-parser";
import { isAuthorised } from "./lib/middleware";
import { keepDynoAlive } from "./lib/utils";
import { deleteUser, updateUserData } from "./lib/supabase";

const app = express();

// connect to MongoDB instance
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// TODO: split routes into routers

async function main() {
  app.use(cors());
  // app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json

  // initialize spotify API client
  const [isSpotifyAuthorised, spotifyApi] = await getSpotifyApi();

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
  cron.schedule("*/10 * * * * *", async () => {
    keepDynoAlive(); // keep free tier dyno alive

    // run cron job
    if (!db) console.error("❌ failed to run cron job: no database connection");
    if (!isSpotifyAuthorised)
      console.error("❌ failed to run cron job: spotify not authorized");
    else {
      await runCron(spotifyApi);
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

  // GET - handling callback from spotify authorization
  app.get("/callback", async function (req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;

    // TODO: check state match
    if (state === null) {
      res.redirect(`${process.env.APP_URL}?error=state-mismatch`);
    } else {
      try {
        // get authorization code
        const auth = await getAuthorizationCode(code);
        console.info("received authorization code");
        const user = await addSpotifyRefreshTokenToUser(auth);
        if (user) await updateUserData(user.id, { isPaused: false });

        res.redirect(`${process.env.APP_URL}?callbackStep=2`);
      } catch (error) {
        console.error(JSON.stringify(error));
        res.status(500).send(error);
      }
    }
  });

  // POST [auth] - create calendar for user
  app.post("/api/calendar/create", isAuthorised, async function (req, res) {
    const databaseUser = res.locals.user;
    const userUid = databaseUser.id;
    const calendarEmail = req.body.calendarEmail;

    console.info(`📅 creating calendar for user ${userUid}`);
    try {
      // check if user already has a calendar
      var calendarId = databaseUser.user_metadata.calendarId;
      if (!calendarId) {
        calendarId = await createNewCalendar(userUid, calendarEmail);
      }
      res.send({ calendarId, calendarEmail });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // POST [auth] - update calendar for user
  app.post("/api/calendar/update", isAuthorised, async function (req, res) {
    const databaseUser = res.locals.user;
    const userUid = databaseUser.id;
    const calendarEmail = req.body.calendarEmail;

    if (!calendarEmail) {
      console.error("No email provided.");
      return res.status(400).send("Missing calendarEmail in request body");
    }
    console.info(`📅 changing email for user ${userUid}`);

    try {
      // confirm that user has a calendar
      var calendarId = databaseUser.user_metadata.calendarId;
      if (!calendarId) {
        console.error(`User does not have a calendar`);
        return res.status(500).send("Must first create a calendar");
      }

      // share calendar with new email
      await shareCalendarWithUser(calendarId, calendarEmail);

      // update user record with calendar ID and calendar email
      await updateUserData(userUid, { calendarId, calendarEmail });
      console.info(
        `added calendarId ${calendarId.substring(0, 9)}... to user ${userUid}`
      );

      res.send({ calendarId, calendarEmail });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // POST [auth] - pause tracking for user
  app.post("/api/user/pause", isAuthorised, async function (req, res) {
    const databaseUser = res.locals.user;
    try {
      const user = await updateUserData(databaseUser.id, { isPaused: true });
      res.send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // POST [auth] - unpause tracking for user
  app.post("/api/user/unpause", isAuthorised, async function (req, res) {
    const databaseUser = res.locals.user;
    try {
      const user = await updateUserData(databaseUser.id, { isPaused: false });
      res.send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // POST [auth] - delete user record
  app.post("/api/user/delete", isAuthorised, async function (req, res) {
    const databaseUser = res.locals.user;
    try {
      const user = await deleteUser(databaseUser.id);
      res.status(204).send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // serve frontend application
  app.use(express.static(path.join(__dirname, "..", "build")));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });
  console.log(`✅ Serving frontend application from build`);

  // start server
  app.listen(process.env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
  });
}

main();
