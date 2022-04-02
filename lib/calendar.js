import { google } from "googleapis";

const calendar = google.calendar("v3");

// initiate jwtClient
let jwtClient = new google.auth.JWT(
  process.env.CALENDAR_CLIENT_EMAIL,
  null,
  process.env.CALENDAR_PRIVATE_KEY,
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
  calendar.events
    .insert({
      auth: jwtClient,
      calendarId: process.env.CALENDAR_ID,
      resource: newEvent,
    })
    .then(() => console.log("✅ Song added to calendar"))
    .catch((error) => console.error(`❌ Error adding song to calendar: ${error}`));
}
