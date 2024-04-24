const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  date: Date,
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalBill: Number,
  paymentMethod: { type: String, enum: ["COD", "Bank transfer"] },
  shippingAddress: {
    firstName: String,
    lastName: String,
    phone: String,
    detailedAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  status: {
    type: String,
    enum: ["Pending", "In progress", "Completed", "Returned", "Canceled"],
    default: "Pending",
  },
});
const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
