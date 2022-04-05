import { google } from "googleapis";

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

//authenticate request
jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(`❌ Error connecting to calendar: ${err}`);
    return;
  } else {
    console.log("✅ Connected calendar");
  }
});

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

export async function addEvent(newEvent) {
  const calendarId = await calendar.events
    .insert({
      auth: jwtClient,
      calendarId: process.env.CALENDAR_ID,
      resource: newEvent,
    })
    .then((res) => {
      console.log("✅ Song added to calendar");
      if (res.data) return res.data.id;
    })
    .catch((error) =>
      console.error(`❌ Error adding song to calendar: ${error}`)
    );
  return calendarId;
}

export async function updateLastEvent(oldEventId, updatedEventInfo) {
  const calendarId = await calendar.events
    .patch({
      auth: jwtClient,
      calendarId: process.env.CALENDAR_ID,
      eventId: oldEventId,
      requestBody: updatedEventInfo,
    })
    .then((res) => {
      console.log("✅ Previous song updated");
      if (res.data) return res.data.id;
    })
    .catch((error) =>
      console.error(`❌ Error updating previous song ${oldEventId}: ${error}`)
    );
  return calendarId;
}

export async function getEvent(eventId) {
  const calendarId = await calendar.events
    .get({
      auth: jwtClient,
      calendarId: process.env.CALENDAR_ID,
      eventId,
    })
    .then((res) => {
      if (res.data) return res.data;
    })
    .catch((error) =>
      console.error(`❌ Error fetching event ${eventId}: ${error}`)
    );
  return calendarId;
}
