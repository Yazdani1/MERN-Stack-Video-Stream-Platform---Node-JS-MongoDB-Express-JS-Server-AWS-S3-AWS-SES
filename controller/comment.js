const Comment = require("../model/Comment");
const VideoPost = require("../model/VideoPost");

exports.createComment = async (req, res) => {
  try {
    const { comment, videoPostId } = req.body;

    if (!comment) {
      return res.status(422).json({ error: "Comment is required" });
    }
    if (!videoPostId) {
      return res.status(422).json({ error: "Video Id is required" });
    }

    const commenDetails = Comment({ postedBy: req.user, comment, videoPostId });

    const createComment = await Comment.create(commenDetails);

    res.status(201).json(createComment);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to get comments from video post

exports.getVideoPostsComments = async (req, res) => {
  try {
    const videoQuery = { slug: req.params.slug };

    const videoPost = await VideoPost.findOne(videoQuery);

    const comments = await Comment.find({ videoPostId: videoPost._id })
      .sort({ date: "DESC" })
      .populate("postedBy", "name slug _id");

    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to delete comment

exports.deleteComment = async (req, res) => {
  try {
    const commentIdQuery = { _id: req.params.id };
    const comment = await Comment.findOne(commentIdQuery).populate(
      "postedBy",
      "name slug _id"
    );

    if (!comment) return res.status(404).json({ error: "comment could not found" });
    const video = await VideoPost.findById(comment.videoPostId).populate("postedBy", "name slug _id");

    if (req.user._id === comment.postedBy._id.toString() || req.user._id === video.postedBy._id.toString() ) {

      await Comment.findByIdAndDelete(commentIdQuery);

      res.status(200).json("The comment has been deleted.");

    } else {
      return res.status(400).json({ error: "You dont have access to delete this comment" });
    }
 
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};
