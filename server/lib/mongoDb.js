import { SongModel } from "../models";

export async function saveSongToDb(dbEntry) {
  const song = new SongModel(dbEntry);

  try {
    await song.save();
    console.log("✅ Song added to database");
  } catch (error) {
    console.error(`❌ Error saving song to database: ${error}`);
  }
}

export async function getLastSong(userUid) {
  const lastSongs = await SongModel.find({ userUid })
    .sort({ datetime: -1 })
    .limit(1);
  return lastSongs[0];
}

// TODO: add subscription to change stream to update stats in realtime (websocket with FE)
// https://mongoosejs.com/docs/change-streams.html