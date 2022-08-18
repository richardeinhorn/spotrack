const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  datetime: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  uri: {
    type: String,
  },
  progress_ms: {
    type: Number,
  },
  duration_ms: {
    type: Number,
  },
  href: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
  },
  dump: {
    type: String,
    required: true,
  },
  startTime: {
    type: Number,
  },
  endTime: {
    type: Number,
  },
  userUid: {
    type: String,
    required: true,
  },
  calendarId: {
    type: String,
    required: true,
  }
});

const Song = mongoose.model("Song", SongSchema);

module.exports = Song;
