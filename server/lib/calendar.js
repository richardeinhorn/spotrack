import { google } from "googleapis";
import { updateUserData } from "./supabase";

const calendar = google.calendar("v3");

// initiate jwtClient
let jwtClient = new google.auth.JWT(
  process.env.CALENDAR_CLIENT_EMAIL,
  null,
  Buffer.from(process.env.CALENDAR_PRIVATE_KEY_BASE64, "base64").toString(
    "ascii"
  ),
  ["https://www.googleapis.com/auth/calendar"]
);

// authenticate request
jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(`❌ Error connecting to calendar: ${err}`);
    return;
  } else {
    console.log("✅ Connected calendar");
  }
});

// // get list of events from Google Calendar to show them in application
// export async function listEvents() {
//   calendar.events.list(
//     {
//       auth: jwtClient,
//       calendarId: process.env.CALENDAR_ID,
//     },
//     function (err, response) {
//       if (err) {
//         console.log("The API returned an error: " + err);
//         return;
//       }
//       var events = response.items;
//       if (!events || events.length === 0) {
//         console.log("No events found.");
//       } else {
//         console.log("Event from Google Calendar:");
//         for (let event of response.items) {
//           console.log(
//             "Event name: %s, Creator name: %s, Create date: %s",
//             event.summary,
//             event.creator.displayName,
//             event.start.date
//           );
//         }
//       }
//     }
//   );
// }

export async function shareCalendarWithUser(calendarId, calendarEmail) {
  // share calendar with user email
  await calendar.acl
    .insert({
      auth: jwtClient,
      calendarId,
      resource: {
        role: "reader",
        scope: { type: "user", value: calendarEmail },
      },
    })
    .then((res) => {
      console.log("✅ Calendar shared with user");
      if (res.data) return res.data;
    })
    .catch((error) =>
      console.error(`❌ Error sharing calendar with user: ${error}`)
    );
}

// TODO: add time zone support
export async function createNewCalendar(userUid, calendarEmail) {
  // create new calendar
  const newCalendar = await calendar.calendars
    .insert({
      auth: jwtClient,
      resource: {
        summary: "Spotrack",
        description: "Tracks songs you listen to on Spotify",
      },
    })
    .then((res) => {
      console.log("✅ New calendar added");
      if (res.data) return res.data;
    })
    .catch((error) => console.error(`❌ Error creating calendar: ${error}`));
  const calendarId = newCalendar.id;
  if (!calendarId) throw new Error("❌ Error creating new calendar");

  // share the calendar with the user
  await shareCalendarWithUser(calendarId, calendarEmail);

  // update user record with calendar ID and calendar email
  await updateUserData(userUid, { calendarId, calendarEmail });
  console.info(
    `added calendarId ${calendarId.substring(0, 9)}... to user ${userUid}`
  );

  return calendarId;
}

export async function addEvent(calendarId, newEvent) {
  const id = await calendar.events
    .insert({
      auth: jwtClient,
      calendarId,
      resource: newEvent,
    })
    .then((res) => {
      console.log("✅ Song added to calendar");
      if (res.data) return res.data.id;
    })
    .catch((error) =>
      console.error(`❌ Error adding song to calendar: ${error}`)
    );
  return id;
}

export async function updateLastEvent(
  calendarId,
  oldEventId,
  updatedEventInfo
) {
  const id = await calendar.events
    .patch({
      auth: jwtClient,
      calendarId,
      eventId: oldEventId,
      requestBody: updatedEventInfo,
    })
    .then((res) => {
      // console.log("✅ Previous song updated");
      if (res.data) return res.data.id;
    })
    .catch((error) =>
      console.error(`❌ Error updating previous song ${oldEventId}: ${error}`)
    );
  return id;
}

export async function getEvent(calendarId, eventId) {
  const id = await calendar.events
    .get({
      auth: jwtClient,
      calendarId,
      eventId,
    })
    .then((res) => {
      if (res.data) return res.data;
    })
    .catch((error) =>
      console.error(`❌ Error fetching event ${eventId}: ${error}`)
    );
  return id;
}
