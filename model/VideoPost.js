const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

var videoPostSchema = mongoose.Schema({
  title: {
    type: String,
  },
  des: {
    type: String,
  },

  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true,
  },

  thumbnail: {},
  video: {},

  views: {
    type: Number,
    default: 0,
  },

  tags: {
    type: [String],
    default: [],
  },

  categoryBy: {
    type: ObjectId,
    ref: "Category",
  },

  likes: {
    type: [String],
    default: [],
  },
  dislikes: {
    type: [String],
    default: [],
  },

  postedBy: {
    type: ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VideoPost", videoPostSchema);
