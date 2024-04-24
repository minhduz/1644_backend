const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: [{ type: String, enum: ["customer", "staff", "admin"] }],
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
});
const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
