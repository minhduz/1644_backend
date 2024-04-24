const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      quantity: { type: Number, default: 1 },
    },
  ],
});
const CartModel = mongoose.model("carts", cartSchema);

module.exports = CartModel;
