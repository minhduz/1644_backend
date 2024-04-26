const express = require("express");
const router = express.Router();

const jwtDecode = require("./jwtDecode");
const CartModel = require("../models/CartModel");
const OrderModel = require("../models/OrderModel");
const UserModel = require("../models/UserModel");

/* Get all personal order
 */
router.get("/", jwtDecode, async (req, res) => {
  const { userId } = req;
  let orders;
  let total = 0;
  try {
    orders = await OrderModel.find(
      { user: userId },
      "-items -shippingAddress -user"
    ).sort({ date: "desc" });

    orders.forEach((order) => {
      total += order.totalBill;
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
  return res.status(200).json(orders);
});

router.get("/total", jwtDecode, async (req, res) => {
  const { userId } = req;
  let orders;
  let total = 0;
  try {
    orders = await OrderModel.find(
      { user: userId },
      "-items -shippingAddress -user"
    ).sort({ date: "desc" });

    orders.forEach((order) => {
      total += order.totalBill;
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
  console.log(total);
  return res.status(200).json(total);
});

/* Get single order
 */
router.get("/:orderId", jwtDecode, async (req, res) => {
  const { userId } = req;
  const { orderId } = req.params;
  let selectedOrder;

  try {
    selectedOrder = await OrderModel.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("user", ["email"])
      .populate("items.product", ["name", "thumbnailUrl", "price"]);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.status(200).json(selectedOrder);
});

/* Create new order
body: {
  paymentMethod: <"COD" or "Bank transfer">, 
  shippingAddress:{
    firstName: String,
    lastName: String,
    phone: String,
    detailedAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  }}
*/
router.post("/", jwtDecode, async (req, res) => {
  const { userId } = req;
  const { paymentMethod, shippingAddress } = req.body;
  let selectedCart;
  let totalBill = 0;
  let newOrder;

  if (!paymentMethod || !shippingAddress) {
    return res.sendStatus(400);
  }

  // get current cart
  try {
    selectedCart = await CartModel.findOne({ user: userId }).populate(
      "items.product",
      ["price"]
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  // check if cart empty
  if (selectedCart.items.length == 0) {
    return res.sendStatus(400);
  }

  // calculate the total bill
  selectedCart.items.forEach((item) => {
    totalBill += item.product.price * item.quantity;
  });

  // create new order
  try {
    newOrder = await OrderModel.create({
      user: userId,
      date: new Date().toJSON(),
      totalBill: totalBill,
      paymentMethod: paymentMethod,
      items: [...selectedCart.items],
      shippingAddress: { ...shippingAddress },
    });

    newOrder.populate("user", ["email"]);
    newOrder.populate("items.product", ["name", "thumbnailUrl", "price"]);

    // clear cart
    await selectedCart.set({ items: [] }).save();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  // save address for auto-filling
  try {
    await UserModel.findOneAndUpdate(
      { _id: userId },
      { shippingAddress: { ...shippingAddress } }
    );
  } catch (error) {
    console.log(err);
    return res.sendStatus(500);
  }

  return res.status(200).json(newOrder);
});

module.exports = router;
