import { addEvent, getEvent, updateLastEvent } from "./calendar";
import { saveSongToDb, getLastSong } from "./mongoDb";
import { getCurrentTrackFromUser } from "./spotify";
import { getUsers } from "./supabase";

// TODO: add timezone support
function parseTrackEvent(songData) {
  const startTime = songData.timestamp - songData.progress_ms;
  return {
    summary: songData.item.name,
    location: songData.item.external_urls.spotify,
    description: `${songData.item.name} - ${songData.item.album.name} - ${songData.item.artists[0].name}`,
    start: {
      dateTime: `${new Date(startTime).toISOString().substring(0, 19)}+00:00`,
      timeZone: "Europe/London",
    },
    end: {
      dateTime: `${new Date(startTime + songData.item.duration_ms)
        .toISOString()
        .substring(0, 19)}+00:00`,
      timeZone: "Europe/London",
    },
  };
}

function parseEpisodeEvent(songData) {
  return {
    summary: "Podcast",
    location: "",
    description: "",
    start: {
      dateTime: `${new Date(songData.timestamp)
        .toISOString()
        .substring(0, 19)}+00:00`,
      timeZone: "Europe/London",
    },
    end: {
      // adding 9s to current time
      dateTime: `${new Date(songData.timestamp + 9000)
        .toISOString()
        .substring(0, 19)}+00:00`,
      timeZone: "Europe/London",
    },
  };
}

async function addNewPodcastEvent(calendarId, userUid, data, songData) {
  const newEvent = parseEpisodeEvent(songData);
  const eventId = await addEvent(calendarId, newEvent);
  const dbEntry = {
    datetime: songData.timestamp,
    name: "Podcast",
    type: songData.currently_playing_type,
    eventId,
    dump: JSON.stringify(data),
    userUid,
    calendarId,
  };
  await saveSongToDb(dbEntry);
}

async function addNewSongEvent(calendarId, userUid, data, songData) {
  const newEvent = parseTrackEvent(songData);
  const eventId = await addEvent(calendarId, newEvent);
  const dbEntry = {
    datetime: songData.timestamp,
    name: songData.item.name,
    uri: songData.item.uri,
    progress_ms: songData.progress_ms,
    duration_ms: songData.item.duration_ms,
    href: songData.item.href,
    type: songData.currently_playing_type,
    eventId,
    startTime: songData.timestamp - songData.progress_ms,
    endTime:
      songData.timestamp - songData.progress_ms + songData.item.duration_ms,
    dump: JSON.stringify(data),
    userUid,
    calendarId,
  };
  await saveSongToDb(dbEntry);
}

async function processData(calendarId, userUid, data) {
  if (!data.body) return;

  // get last song from DB
  const lastSong = await getLastSong(userUid);
  const songData = data.body;

  // if playing is paused
  if (!data.body.is_playing) {
    // if paused before end of last song, update end time to now
    if (new Date().getTime() < lastSong.endTime - 3000) {
      await updateLastEvent(calendarId, lastSong.eventId, {
        end: {
          dateTime: `${new Date().toISOString().substring(0, 19)}+00:00`,
          timeZone: "Europe/London",
        },
      });
    }
  }

  // TODO: delete last song if played for less than 10 seconds

  // if playing a track (and not a podcast)
  if (songData.currently_playing_type === "track") {
    // if playing the same song as on last check
    if (lastSong && lastSong.uri === songData.item.uri) {
      // if the song is played longer than expected, update end time to new expected end time
      if (songData.endTime > lastSong.endTime + 3000) {
        await updateLastEvent(calendarId, lastSong.eventId, {
          end: {
            dateTime: `${new Date(
              songData.timestamp -
                songData.progress_ms +
                songData.item.duration_ms
            )
              .toISOString()
              .substring(0, 19)}+00:00`,
            timeZone: "Europe/London",
          },
        });
      }
    } else {
      // if skipped last song (with 3s threshhold), update endtime to estimated past end time
      if (lastSong && lastSong.endTime > new Date().getTime() - 3000) {
        await updateLastEvent(calendarId, lastSong.eventId, {
          end: {
            dateTime: `${new Date(songData.timestamp - songData.progress_ms)
              .toISOString()
              .substring(0, 19)}+00:00`,
            timeZone: "Europe/London",
          },
        });
      }
      await addNewSongEvent(calendarId, userUid, data, songData);
    }
  } else if (songData.currently_playing_type === "episode") {
    // if continue to listen
    if (lastSong && lastSong.type === "episode") {
      const lastEvent = await getEvent(calendarId, lastSong.eventId);

      // if last podcast ping is more than 30s ago
      if (
        new Date(lastEvent.end.dateTime).getTime() + 30000 <
        new Date().getTime()
      ) {
        // add new podcast event
        addNewPodcastEvent(calendarId, userUid, data, songData);
      } else {
        // else update existing podcast episode to end now
        await updateLastEvent(calendarId, lastSong.eventId, {
          end: {
            dateTime: `${new Date().toISOString().substring(0, 19)}+00:00`,
            timeZone: "Europe/London",
          },
        });
      }
      // else if startened to listen to podcast
    } else if (lastSong && lastSong.type !== "episode") {
      // if skipped last song to a podcast episode (with 3s threshhold)
      if (lastSong.endTime > new Date().getTime() - 3000) {
        await updateLastEvent(calendarId, lastSong.eventId, {
          end: {
            dateTime: `${new Date().toISOString().substring(0, 19)}+00:00`,
            timeZone: "Europe/London",
          },
        });
      }
      // else if started to listen to podcast after silence
      addNewPodcastEvent(calendarId, userUid, data, songData);
    }
  }
}

export async function runCron(spotifyApi) {
  const users = await getUsers();

  const activeUsers = users.filter((user) => !user.user_metadata.isPaused);

  // loop through users and process data
  console.info(
    `⏲️ running cron job - looping through ${activeUsers.length} active users from ${users.length} total users.`
  );
  var user;
  for (let i = 0; i < activeUsers.length; i++) {
    user = activeUsers[i];

    // user onboarding not completed - missing calendar or spotify authorization
    if (!user.user_metadata.calendarId || !user.user_metadata.refresh_token) {
      if (process.env.NODE_ENV !== "production")
        console.info(`User ${user.id} is not onboarded.`);
      continue;
    }
    // TODO: allow parallel processing
    await getCurrentTrackFromUser(
      spotifyApi,
      user.user_metadata.calendarId,
      user.id,
      user.user_metadata.refresh_token,
      user.user_metadata.access_token,
      processData
    );
  }
}
