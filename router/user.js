const router = require("express").Router();
const { userRegistration, userLogin,userProfileDetails,getUserProfileAllPosts,getNewlyPublishedPosts,getUserMostViewedPosts } = require("../controller/user");

// user authentication

router.post("/registration", userRegistration);
router.post("/login", userLogin);

// to get single user profile info

router.get("/user-profile-details/:slug",userProfileDetails);

// to get single user all the video posts

router.get('/user-profile-allposts/:slug',getUserProfileAllPosts);

// to get  user newly published video posts

router.get("/user-newly-published-posts/:slug",getNewlyPublishedPosts);

// to get  user newly published video posts
router.get("/user-most-viewed-posts/:slug",getUserMostViewedPosts);


module.exports = router;
