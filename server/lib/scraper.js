import { addEvent, getEvent, updateLastEvent } from "./calendar";
import { saveSongToDb, getLastSong } from "./db";
import { refreshAccessToken } from "./spotify";
import { supabase } from "./supabase";

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
  // do not process if not playing
  if (!data.body || !data.body.is_playing) return;

  // get last song from DB
  const lastSong = await getLastSong(userUid);
  const songData = data.body;
  if (songData.currently_playing_type === "track") {
    if (lastSong && lastSong.uri === songData.item.uri) {
      // console.log(`🎵 song for user ${userUid} already saved: ${songData.item.name}`);
    } else {
      // if skipped last song (with 3s threshhold)
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

// get all users from supabase db
async function getUsers(supabase) {
  const { data: users, error } = await supabase.auth.api.listUsers();
  if (error) throw new Error(error);

  console.info("Retrieved users from database.");
  return users;
}

async function getCurrentTrackFromUser(
  spotifyApi,
  calendarId,
  userUid,
  refreshToken,
  accessToken
) {
  // set access token for current user
  spotifyApi.setAccessToken(accessToken);

  // fetch current track
  spotifyApi.getMyCurrentPlayingTrack().then(
    function (data) {
      // on success, process data
      processData(calendarId, userUid, data);
    },
    async function (err) {
      // on error, try to refresh token
      console.error("❌ Cron job failed on 1st attempt. " + err);
      const newAccessToken = await refreshAccessToken(refreshToken, userUid);
      if (!newAccessToken) return;

      spotifyApi.setAccessToken(newAccessToken);

      // then request current playing track again
      spotifyApi.getMyCurrentPlayingTrack().then(
        async function (data) {
          // on success, process data
          processData(calendarId, userUid, data);

          // update user record with new access token
          const { error: updateUserError } =
            await supabase.auth.api.updateUserById(userUid, {
              user_metadata: { access_token: newAccessToken },
            });
          if (updateUserError)
            console.error(
              "Error saving new access token to User record." + updateUserError
            );
          else console.info("Updated access token for user " + userUid);
        },
        function (err) {
          return console.error(
            "❌ Cron job failed on 2nd attempt. No data processed." + err
          );
        }
      );
    }
  );
}

export async function runCron(spotifyApi) {
  const users = await getUsers(supabase);

  // loop through users and process data
  console.info(`⏲️ running cron job - looping through ${users.length} users.`);
  var user;
  for (let i = 0; i < users.length; i++) {
    user = users[i];

    // user onboarding not completed - missing calendar or spotify authorization
    if (!user.user_metadata.calendarId || !user.user_metadata.refresh_token) {
      if (process.env.NODE_ENV !== "production")
        console.info(`User ${user.id} is not onboarded.`);
      return;
    }
    // TODO: allow parallel processing
    await getCurrentTrackFromUser(
      spotifyApi,
      user.user_metadata.calendarId,
      user.id,
      user.user_metadata.refresh_token,
      user.user_metadata.access_token
    );
  }
}
