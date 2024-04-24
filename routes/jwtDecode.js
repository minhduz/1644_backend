const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Decode JWT token
router.use((req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token ? req.cookies.token : null;

  if (!token) {
    return res.status(401).send("Token not provided");
  }

  let decodedToken;
  try {
    //Verify the token
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Add decoded information to the req so next middleware can use it
    req.userId = decodedToken.userId;
    req.userEmail = decodedToken.email;
    req.userRole = decodedToken.role;

    // calling next middleware
    next();
  } catch (error) {
    console.log(error);

    //token invalid or expired, perform clear token (logout)
    return res.status(401).clearCookie("token").send("token invalid");
  }
});

module.exports = router;
