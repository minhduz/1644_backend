const express = require("express");
const router = express.Router();

const jwtDecode = require("./jwtDecode");
const ProductModel = require("../models/ProductModel");

/*
Get all products

query value: searchVal, skip, limit, sort
supported sort type: 'dateAdded_asc', 'dateAdded_desc' , 'price_asc', 'name_desc', ...
*/

// Route handler cho yêu cầu GET đến endpoint "/"
router.get("/", async (req, res) => {
  // Lấy giá trị tham số truy vấn "searchVal" từ yêu cầu. Nếu không có, mặc định là chuỗi rỗng.
  const searchVal = req.query.searchVal ? req.query.searchVal : "";
  // Lấy giá trị tham số truy vấn "skip" từ yêu cầu. Nếu không có, mặc định là null.
  const skip = req.query.skip ? req.query.skip : null;
  // Lấy giá trị tham số truy vấn "limit" từ yêu cầu. Nếu không có, mặc định là null.
  const limit = req.query.limit ? req.query.limit : null;
  // Xác định thứ tự sắp xếp của kết quả. Nếu có tham số truy vấn "sort", sẽ sử dụng nó để sắp xếp kết quả, ngược lại sắp xếp theo thời gian thêm mới nhất.
  const sort = req.query.sort
    ? { [req.query.sort.split("_")[0]]: req.query.sort.split("_")[1] }
    : { dateAdded: "desc" };
  let count;
  let products;
  try {
    // Tạo biểu thức chính quy để tìm kiếm trong trường "name" của sản phẩm. Biểu thức này sẽ không phân biệt chữ hoa và chữ thường.
    const searchRegExp = new RegExp(`${searchVal}`, "i");

    // Đếm số lượng sản phẩm phù hợp với điều kiện tìm kiếm.
    count = await ProductModel.find({ name: searchRegExp }).count();

    // Tìm kiếm sản phẩm dựa trên biểu thức chính quy đã tạo, loại bỏ các trường "description" và "dateAdded", sau đó sắp xếp, bỏ qua và giới hạn kết quả theo các tham số tương ứng.
    products = await ProductModel.find(
      { name: searchRegExp },
      "-description -dateAdded"
    )
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    // Nếu có lỗi xảy ra trong quá trình truy vấn, ghi log và trả về mã trạng thái lỗi 500 (Internal Server Error).
    console.log(error);
    return res.sendStatus(500);
  }
  // Trả về kết quả dưới dạng đối tượng JSON chứa số lượng sản phẩm và danh sách sản phẩm phù hợp với các tham số truy vấn.
  return res.status(200).json({ count: count, data: products });
});

/* Product Detail */
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  let selectedProduct;

  try {
    selectedProduct = await ProductModel.findOne({
      _id: productId,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.status(200).json(selectedProduct);
});

/*
Add products (allowed: 'staff')

name: String,
thumbnailUrl: String,
description: String,
price: Number,
stock: Number,
*/
router.post("/", jwtDecode, async (req, res) => {
  const { userRole } = req;
  if (!userRole || !userRole.includes("staff")) {
    return res.sendStatus(403);
  }

  // JS destructuring
  const { name, thumbnailUrl, description, price, stock } = req.body;

  if (!name || !thumbnailUrl || !description || !price || !stock) {
    return res.sendStatus(400);
  }

  let newProduct;
  try {
    newProduct = await ProductModel.create({
      name: name,
      thumbnailUrl: thumbnailUrl,
      description: description,
      price: price,
      stock: stock,
      dateAdded: new Date().toJSON(),
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.status(200).json(newProduct);
});

/*
Update product (allowed: 'staff'), find product by id

name: String,
thumbnailUrl: String,
description: String,
price: Number,
stock: Number,
 *not all field is required
*/
router.put("/:productId", jwtDecode, async (req, res) => {
  const { userRole } = req;
  if (!userRole.includes("staff")) {
    return res.sendStatus(403);
  }

  const { name, thumbnailUrl, description, price, stock } = req.body;

  const { productId } = req.params;
  let selectedProduct;
  try {
    selectedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        name: name,
        thumbnailUrl: thumbnailUrl,
        description: description,
        price: price,
        stock: stock,
      },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.status(200).json(selectedProduct);
});

/*
Delete product (allowed: 'staff'), find product by id
*/
router.delete("/:productId", jwtDecode, async (req, res) => {
  const { userRole } = req;
  if (!userRole || !userRole.includes("staff")) {
    return res.sendStatus(403);
  }

  const { productId } = req.params;
  try {
    await ProductModel.findOneAndDelete({ _id: productId });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  return res.sendStatus(200);
});

module.exports = router;
