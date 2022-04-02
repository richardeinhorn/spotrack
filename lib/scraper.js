import { addEvent } from "./calendar";
import { saveSongToDb, getLastSong } from "./db";

function parseEvent(songData) {
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

export async function runCron(spotifyApi) {
  // get last song from DB
  const lastSong = await getLastSong();

  // fetch spotify
  spotifyApi.getMyCurrentPlayingTrack().then(
    async function (data) {
      const songData = data.body;
      if (lastSong && lastSong.uri === songData.item.uri) {
        // console.log(`🎵 song already saved: ${songData.item.name}`);
      } else {
        const newEvent = parseEvent(songData);
        const dbEntry = {
          datetime: songData.timestamp,
          name: songData.item.name,
          uri: songData.item.uri,
          progress_ms: songData.progress_ms,
          duration_ms: songData.item.duration_ms,
          href: songData.item.href,
          dump: JSON.stringify(data),
        };
        await Promise.all([addEvent(newEvent), saveSongToDb(dbEntry)]);
      }
    },
    function (err) {
      console.error("❌ Cron job failed", err);
    }
  );
}
