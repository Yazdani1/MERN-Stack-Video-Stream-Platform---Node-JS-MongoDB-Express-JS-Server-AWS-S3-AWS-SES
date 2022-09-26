const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const slugify = require("slugify");
const User = require("../model/User");
const VidePost = require("../model/VideoPost");

require("dotenv").config();

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_INFO,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_kEY_INFO,
  region: process.env.AWS_REGION_INFO,
  apiVersion: process.env.AWS_API_VERSION_INFO,
  correctClockSkew: true,
};

const SES = new AWS.SES(awsConfig);

// to register

exports.userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Please Add Your Full Name" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ error: "Please Add Your valid E-mail Address" });
    }

    if (!password) {
      return res.status(400).json({ error: "Please Add Your Password" });
    }

    const slug = slugify(name);

    const alreadyExist = await User.findOne({ name });

    if (alreadyExist) {
      return res
        .status(422)
        .json({ error: "User name already exist. try a different name" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ error: "User already exist with same email address" });
    }
    const hash_password = await bcrypt.hash(password, 10);

    userDetails = new User({
      name,
      email,
      slug,
      password: hash_password,
    });

    const params = {
      Source: process.env.EMAIL_FROM_INFO,
      Destination: {
        ToAddresses: [process.env.EMAIL_FROM_INFO],
      },
      ReplyToAddresses: [email],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1 style={{color:"red"}}>You have Successfully Registered to This Video Stream Platform</h1>
                <p>Log in to your profile now and publish your video</p>
              </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Welcome : " + name,
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();

    const createUserAccount = await User.create(userDetails);

    res
      .status(201)
      .json({ createUserAccount, message: "Account Created Successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Account could not create" });
  }
};

// to log in

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "add your register email" });
    }

    if (!password) {
      return res.status(400).json({ error: "add your password" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Account could not found " });
    }

    const isMatchData = await bcrypt.compare(password, user.password);
    if (!isMatchData) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // to send email using aws service

    const params = {
      Source: process.env.EMAIL_FROM_INFO,
      Destination: {
        ToAddresses: [process.env.EMAIL_FROM_INFO],
      },
      ReplyToAddresses: [email],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1 style={{color:"red"}}>You have Signed In to this account</h1>
                <p>Visit your profile</p>
              </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Welcome Back: " + email,
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();

    user.password = undefined;
    user.expireToken = undefined;
    user.resetToken = undefined;

    return res.status(200).json({ token, user });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something Went Wrong, Could not Log In" });
  }
};

// to get user profile details

exports.userProfileDetails = async (req, res) => {
  try {
    const userProfileQuery = { slug: req.params.slug };
    const userDetails = await User.findOne(userProfileQuery).select(
      "-password"
    );
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to get user profile user all the posts

exports.getUserProfileAllPosts = async (req, res) => {
  try {
    const userQuery = { slug: req.params.slug };

    const userDetails = await User.findOne(userQuery);

    const userAllPosts = await VidePost.find({ postedBy: userDetails._id })
      .sort({ date: "DESC" })
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(userAllPosts);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

// to get  user newly published video posts

exports.getNewlyPublishedPosts = async (req, res) => {
  try {
    const userQuery = { slug: req.params.slug };
    const userDetails = await User.findOne(userQuery);

    const videoPosts = await VidePost.find({ postedBy: userDetails._id })
      .sort({ date: "DESC" })
      .limit(20)
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(videoPosts);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};


// to get  user most views video posts


exports.getUserMostViewedPosts = async (req, res) => {
  try {
    const userQuery = { slug: req.params.slug };
    const userDetails = await User.findOne(userQuery);

    const mostViewedVideoPosts = await VidePost.find({
      postedBy: userDetails._id,
      views: { $gt: 20 },
    })
      .sort({ date: "DESC" })
      .limit(30)
      .populate("postedBy", "name slug _id")
      .populate("categoryBy", "categoryName slug _id");

    res.status(200).json(mostViewedVideoPosts);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
};
