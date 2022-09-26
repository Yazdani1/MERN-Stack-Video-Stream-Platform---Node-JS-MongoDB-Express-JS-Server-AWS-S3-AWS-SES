const AWS = require("aws-sdk");
const { uuid } = require("uuidv4");
const slugify = require("slugify");
const { readFileSync } = require("fs");
const VideoPost = require("../model/VideoPost");
require("dotenv").config();

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_INFO,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_kEY_INFO,
  region: process.env.AWS_REGION_INFO,
  apiVersion: process.env.AWS_API_VERSION_INFO,
  correctClockSkew: true,
};

const S3 = new AWS.S3(awsConfig);

exports.uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).send("Please Upload Thumbnail");

    // prepare the image

    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const typess = image.split(";")[0].split("/")[1];

    // image params

    const params = {
      Bucket: "news-note",
      Key: `${uuid()}.${typess}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${typess}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      res.send(data);
    });
  } catch (error) {
    return res.status(400).json({ error: "No Image" });
  }
};

// to upload video to aws s3

exports.uploadVideo = async (req, res) => {
  try {
    const { video } = req.files;

    // console.log(video);

    const params = {
      Bucket: "news-note",
      Key: `${uuid()}.${video.type.split("/")[1]}`,
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      res.send(data);
      console.log(data);
    });
  } catch (error) {
    console.log(error);
  }
};

// to create post

exports.createVideoPost = async (req, res) => {
  try {
    const { title, des, thumbnail, video, categoryBy, tags } = req.body;

    if (!title) {
      return res.status(422).json({ error: "Please add title" });
    }
    if (!des) {
      return res.status(422).json({ error: "Please add description" });
    }
    if (!thumbnail) {
      return res.status(422).json({ error: "Please add thumbnail" });
    }
    if (!video) {
      return res.status(422).json({ error: "Please add video" });
    }
    if (!categoryBy) {
      return res.status(422).json({ error: "Please add category" });
    }

    const slug = slugify(title);

    const alreadyExist = await VideoPost.findOne({ title });

    if (alreadyExist) {
      return res
        .status(422)
        .json({ error: "Title already exist. try a new title" });
    }

    const postDetails = VideoPost({
      title,
      des,
      thumbnail,
      video,
      categoryBy,
      postedBy: req.user,
      slug,
      tags,
    });

    const videoPost = await VideoPost.create(postDetails);

    res.status(201).json(videoPost);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to get loged in user video post

exports.getLogedInUserPosts = async (req, res) => {
  try {
    const logedInuserPosts = await VideoPost.find({ postedBy: req.user })
      .sort({ date: "DESC" })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(logedInuserPosts);
  } catch (error) {
    res.status(400).json({ error: "something went wrong" });
  }
};

// to get all video post

exports.getAllVideoPosts = async (req, res) => {
  try {
    const allVideopost = await VideoPost.find({})
      .sort({ date: "DESC" })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(allVideopost);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to get single post details

exports.getSinglePostDetails = async (req, res) => {
  try {
    const detailsQuery = { slug: req.params.slug };

    const postDetails = await VideoPost.findOne(detailsQuery)
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    if (!postDetails)
      return res.status(404).json({ error: "Post could not found" });

    const increaseViews = await VideoPost.findByIdAndUpdate(postDetails._id, {
      $inc: { views: 1 },
    });

    res.status(200).json(postDetails);
  } catch (error) {
    res.status(404).json({ error: "Something went wrong" });
  }
};

// to add view count

exports.addView = async (req, res) => {
  try {
    const viewQuery = { slug: req.params.slug };

    const post = await VideoPost.findOne(viewQuery);

    const increaseViews = await VideoPost.findByIdAndUpdate(post._id, {
      $inc: { views: 1 },
    });
    res.status(200).json(increaseViews);
  } catch (error) {
    res.status(404).json({ error: "Something went wrong" });
  }
};

// to get simmilar posts by category

exports.getPostsBySameCategory = async (req, res) => {
  try {
    const videoQuery = { slug: req.params.slug };

    const singleVideoPost = await VideoPost.findOne(videoQuery);

    if (!singleVideoPost)
      return res.status(404).json({ error: "Post could not found" });

    const videos = await VideoPost.find({
      _id: { $ne: singleVideoPost._id },
      categoryBy: singleVideoPost.categoryBy._id,
    })
      .sort({ date: "DESC" })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(videos);
  } catch (error) {
    res.status(404).json({ error: "Something went wrong" });
  }
};

// to get simmilar posts by the same user

exports.getPostsBySamePostedByUser = async (req, res) => {
  try {
    const videoQuery = { slug: req.params.slug };

    const singleVideoPost = await VideoPost.findOne(videoQuery);

    if (!singleVideoPost)
      return res.status(404).json({ error: "Post could not found" });

    const videos = await VideoPost.find({
      _id: { $ne: singleVideoPost._id },
      postedBy: singleVideoPost.postedBy._id,
    })
      .sort({ date: "DESC" })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(videos);
  } catch (error) {
    res.status(404).json({ error: "Something went wrong" });
  }
};

// to get trending posts

exports.getTrendingPosts = async (req, res) => {
  try {
    const trending_posts = await VideoPost.find({ views: { $gt: 20 } })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(trending_posts);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to delete post

exports.deletePost = async (req, res) => {
  try {
    const deleteQuery = { _id: req.params.id };

    const video = await VideoPost.findOne(deleteQuery);

    if (!video) return res.status(404).json({ error: "Video could not found" });

    if (req.user._id === video.postedBy._id.toString()) {
      const deleteposts = await VideoPost.findByIdAndDelete(deleteQuery);
      res.status(200).json({ deleteposts, message: "Post deleted" });
    } else {
      res.status(200).json("You can only delete your video");
    }
  } catch (error) {
    res.status(404).json({ error: "Post id could not found" });
    console.log(error);
  }
};

// to add like in a video post

exports.addLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const videopostid = req.body.videopostId;

    const like_video = await VideoPost.findByIdAndUpdate(videopostid, {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
    });
    res.status(200).json(like_video);
  } catch (err) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to add like in a video post

exports.addDisLike = async (req, res) => {
  const videopostid = req.body.videopostId;
  try {
    const userId = req.user._id;

    const dislike_video = await VideoPost.findByIdAndUpdate(videopostid, {
      $addToSet: { dislikes: userId },
      $pull: { likes: userId },
    });
    res.status(200).json("You disliked this video");
  } catch (err) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to search video posts

exports.searchVideoPost = async (req, res) => {
  const query = req.query.search_query;
  try {
    const videos = await VideoPost.find({
      title: { $regex: query, $options: "i" },
    })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(videos);
  } catch (err) {
    res.status(400).json({ error: "Something went wrong" });
  }
};
