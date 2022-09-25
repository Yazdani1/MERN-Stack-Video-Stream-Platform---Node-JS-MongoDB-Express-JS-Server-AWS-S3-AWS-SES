const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  videoPostId: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Comments", commentSchema);
