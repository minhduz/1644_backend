const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.options(
  "*",
  cors({
    origin: ["https://atn-toy-0p7v.onrender.com", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(
  cors({
    origin: ["https://atn-toy-0p7v.onrender.com", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.set("strictQuery", true); // suppress warning
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((err) => {
    console.log("Failed to connect MongoDB: " + err);
  });

app.get("/", (req, res) => {
  return res.status(200).send("OK");
});

const authRoute = require("./routes/auth");
app.use("/api/auth", authRoute);

const productRoute = require("./routes/product");
app.use("/api/product", productRoute);

const cartRoute = require("./routes/cart");
app.use("/api/cart", cartRoute);

const userRoute = require("./routes/user");
app.use("/api/user", userRoute);

const orderRoute = require("./routes/order");
app.use("/api/order", orderRoute);

const dashboardRoute = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoute);

app.listen(process.env.SERVER_PORT);
