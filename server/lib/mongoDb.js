import { SongModel } from "../models";

export async function saveSongToDb(dbEntry) {
  const song = new SongModel(dbEntry);

  try {
    await song.save();
    // console.log("✅ Song added to database");
  } catch (error) {
    console.error(`❌ Error saving song to database for user ${dbEntry.userUid}. ${error}`);
  }
}

export async function getLastSong(userUid) {
  const lastSongs = await SongModel.find({ userUid })
    .sort({ datetime: -1 })
    .limit(1);
  return lastSongs[0];
}

export async function countSongs(userUid) {
  const count = await SongModel.countDocuments({ userUid });
  return count;
}

// TODO: add subscription to change stream to update stats in realtime (websocket with FE)
// https://mongoosejs.com/docs/change-streams.html