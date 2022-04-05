import { addEvent, getEvent, updateLastEvent } from "./calendar";
import { saveSongToDb, getLastSong } from "./db";
import { refreshAccessToken } from "./spotify";

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

async function addNewPodcastEvent(data, songData) {
  const newEvent = parseEpisodeEvent(songData);
  const eventId = await addEvent(newEvent);
  const dbEntry = {
    datetime: songData.timestamp,
    name: "Podcast",
    type: songData.currently_playing_type,
    eventId,
    dump: JSON.stringify(data),
  };
  await saveSongToDb(dbEntry);
}

async function processData(data) {
  // get last song from DB
  const lastSong = await getLastSong();
  const songData = data.body;
  if (songData.currently_playing_type === "track") {
    if (lastSong && lastSong.uri === songData.item.uri) {
      // console.log(`🎵 song already saved: ${songData.item.name}`);
    } else {
      // if skipped last song (with 3s threshhold)
      if (lastSong.endTime > new Date().getTime() - 3000) {
        await updateLastEvent(lastSong.eventId, {
          end: {
            dateTime: `${new Date(songData.timestamp - songData.progress_ms)
              .toISOString()
              .substring(0, 19)}+00:00`,
            timeZone: "Europe/London",
          },
        });
      }

      const newEvent = parseTrackEvent(songData);
      const eventId = await addEvent(newEvent);
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
      };
      await saveSongToDb(dbEntry);
    }
  } else if (songData.currently_playing_type === "episode") {
    // if continue to listen
    if (lastSong && lastSong.type === "episode") {
      const lastEvent = await getEvent(lastSong.eventId);

      // if last podcast ping is more than 30s ago
      if (lastEvent.end.dateTime + 30000 < new Date().getTime()) {
        // add new podcast event
        addNewPodcastEvent(data, songData);
      } else {
        // else update existing podcast episode to end now
        await updateLastEvent(lastSong.eventId, {
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
        await updateLastEvent(lastSong.eventId, {
          end: {
            dateTime: `${new Date().toISOString().substring(0, 19)}+00:00`,
            timeZone: "Europe/London",
          },
        });
      }

      addNewPodcastEvent(data, songData);
    }
  }
}

export async function runCron(spotifyApi) {
  // fetch spotify
  spotifyApi.getMyCurrentPlayingTrack().then(
    async function (data) {
      if (data.body && data.body.is_playing) {
        processData(data)
      };
    },
    async function (err) {
      console.error("❌ Cron job failed", err);
      await refreshAccessToken();
      spotifyApi.getMyCurrentPlayingTrack().then(
        async function (data) {
          // if is playing
          if (data.body && data.body.is_playing) {
            processData(data)
          };
        },
        function () {
          throw "❌❌❌ stopping execution";
        }
      );
    }
  );
}
