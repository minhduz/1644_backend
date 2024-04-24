const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  thumbnailUrl: String,
  description: String,
  price: Number,
  stock: Number,
  dateAdded: Date,
});
const ProductModel = mongoose.model("products", productSchema);

module.exports = ProductModel;
