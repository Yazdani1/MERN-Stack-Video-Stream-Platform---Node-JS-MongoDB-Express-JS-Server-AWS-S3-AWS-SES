const router = require("express").Router();
const {createComment,getVideoPostsComments,deleteComment} = require("../controller/comment");
const { requireLogin } = require("../middleware/auth");


// to post comment

router.post('/post-comments',requireLogin,createComment);

// to get comments from each video post

router.get("/get-comments/:slug",getVideoPostsComments);

// to delete comments

router.delete("/delete-comment/:id",requireLogin,deleteComment);

module.exports = router;
