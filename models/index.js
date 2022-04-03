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
    required: true,
  },
  progress_ms: {
    type: Number,
  },
  duration_ms: {
    type: Number,
  },
  href: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  calendarId: {
    type: String,
  },
  dump: {
    type: String,
  }
});

const Song = mongoose.model("Song", SongSchema);

module.exports = Song;
