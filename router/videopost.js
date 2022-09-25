const router = require("express").Router();
const formidableMiddleware = require("express-formidable");
const {
  uploadImage,
  uploadVideo,
  createVideoPost,
  getAllVideoPosts,
  getLogedInUserPosts,
  deletePost,
  getSinglePostDetails,
  addView,
  getPostsBySameCategory,
  getPostsBySamePostedByUser,
  getTrendingPosts,
  addLike,
  addDisLike,
  searchVideoPost
} = require("../controller/videopost");
const { requireLogin } = require("../middleware/auth");

// to upload image to aws s3
router.post("/upload-image", requireLogin, uploadImage);

// to upload video to aws s3

router.post("/upload-video", requireLogin, formidableMiddleware(), uploadVideo);

// to create video post

router.post("/create-post", requireLogin, createVideoPost);

// to get all video posts

router.get("/get-all-posts", getAllVideoPosts);

// to get logedin user video post
router.get("/get-logedin-user-posts", requireLogin, getLogedInUserPosts);

// to get single post details..

router.get("/details-post/:slug", getSinglePostDetails);

// to add views

router.put("/add-views/:slug",addView);



// to get simmilar posts by category

router.get("/posts-bysame-category/:slug",getPostsBySameCategory);

// to get simmilar posts by same postedby user
router.get("/posts-bysame-postedby-user/:slug",getPostsBySamePostedByUser);

// to get trending posts

router.get("/trending-posts",getTrendingPosts);

// to delete posts

router.delete("/delete-post/:id", requireLogin, deletePost);

// to like video post

router.put("/likes",requireLogin, addLike);

// to dislike video post

router.put("/dislikes",requireLogin, addDisLike);

// to search post

router.get("/search", searchVideoPost)


module.exports = router;
