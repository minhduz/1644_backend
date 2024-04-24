const express = require("express");
const router = express.Router();

const jwtDecode = require("./jwtDecode");
const CartModel = require("../models/CartModel");
const OrderModel = require("../models/OrderModel");
const UserModel = require("../models/UserModel");

//Get all order
router.get("/order", jwtDecode, async (req, res) => {
  const { userRole } = req;
  let orders;

  if (!userRole.includes("staff")) {
    return res.sendStatus(403);
  }

  try {
    orders = await OrderModel.find({}, "-items -shippingAddress")
      .populate("user", ["email"])
      .sort({ date: "desc" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.status(200).json(orders);
});

//Get order detail
router.get("/order/:orderId", jwtDecode, async (req, res) => {
  const { userRole } = req;
  const { orderId } = req.params;
  let selectedOrder;

  if (!userRole.includes("staff")) {
    return res.sendStatus(403);
  }

  try {
    selectedOrder = await OrderModel.findOne({
      _id: orderId,
    })
      .populate("user", ["email"])
      .populate("items.product", ["name", "thumbnailUrl", "price"]);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.status(200).json(selectedOrder);
});

//Update order
router.put("/order/:orderId", jwtDecode, async (req, res) => {
  const { userRole } = req;
  const { orderId } = req.params;
  const { status } = req.body;
  let selectedOrder;

  if (!userRole.includes("staff")) {
    return res.sendStatus(403);
  }

  try {
    selectedOrder = await OrderModel.findOneAndUpdate(
      {
        _id: orderId,
      },
      { status: status },
      { new: true }
    )
      .populate("user", ["email"])
      .populate("items.product", ["name", "thumbnailUrl", "price"]);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.status(200).json(selectedOrder);
});

module.exports = router;
