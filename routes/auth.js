const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/UserModel");

router.post("/signup", async (req, res) => {
  let { email, password } = req.body;

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!emailRegex.test(email) || !password) {
    return res.status(400).send("invalid request");
  }

  // check if email exsisted
  let existedUser = await UserModel.findOne({ email: email });
  if (existedUser) {
    return res.status(400).send("User Exsited");
  }

  // hash password
  password = bcrypt.hashSync(password, 10);
  let newUser;
  try {
    // add new user to db
    newUser = await UserModel.create({
      email: email,
      password: password,
      role: ["customer"],
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  // generate JWT
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  return res.cookie("token", token, { secure: true }).sendStatus(200);
});

// Login
router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  // validate email
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email) || !password) {
    return res.status(400).send("invalid request");
  }

  // find user, perform authentication
  let currentUser = await UserModel.findOne({ email: email });
  if (!currentUser) {
    return res.status(400).send("User not found");
  }
  const passwordMatch = bcrypt.compareSync(password, currentUser.password);
  if (!passwordMatch) {
    return res.status(400).send("Authentication error");
  }

  // generate jwt
  const token = jwt.sign(
    {
      userId: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  return res.cookie("token", token, { secure: true }).sendStatus(200);
});

//Logout
router.get("/signout", (req, res) => {
  return res.clearCookie("token").sendStatus(200);
});

module.exports = router;
