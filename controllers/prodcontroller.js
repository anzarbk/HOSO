const Product = require("../model/product");
const Category = require("../model/category");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const multerStorage = multer.memoryStorage();
const ProductModel = require("../model/product");
const categoryDetails = require("../model/category");
//###############  Multer setup  #####################

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("File is not an image"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadProductPic = upload.fields([
  {
    name: "thumbnail",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);
exports.resizeProductPic = async (req, res, next) => {
  //Validations
  if (!req.files.thumbnail || !req.files.images) return next();

  // Get the thumbnail
  req.body.thumbnail = `product-${Date.now()}-thumb.jpeg`;

  await sharp(req.files.thumbnail[0].buffer)
    .resize(450, 450)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/products/${req.body.thumbnail}`);

  // Get the images array
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (el, i) => {
      const filename = `product-${Date.now()}-${i + 1}-image.jpeg`;
      await sharp(req.files.images[i].buffer)
        .resize(450, 450)
        .toFormat("jpeg")
        .jpeg({
          quality: 90,
        })
        .toFile(`public/images/products/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
};
//###################  PRODUCTS  ###########################
exports.renderAddprod = async (req, res) => {
  const categoryDetails = await Category.find();
  console.log(categoryDetails);
  res.render("admin/product-add", { categoryDetails });
};
exports.renderListprod = async (req, res) => {
  const productDetails = await ProductModel.find({})
    .sort({ _id: -1 })
    .populate("category");
  res.render("admin/product-list", { productDetails });
};
exports.renderDetailsprod = (req, res) => {
  res.render("admin/product-detail");
};
exports.renderEditprod = async (req, res) => {
  id = req.params.id;
  const categoryDetails = await Category.find({});
  const Product = await ProductModel.findOne({ _id: id });
  res.render("admin/product-edit", { Product, categoryDetails });
};
exports.deleteProduct = async (req, res) => {
  id = req.params.id;
  await ProductModel.deleteOne({ _id: id });
  res.redirect("/admin/product-list");
};
exports.editProduct = async (req, res) => {
  const id = req.query.id;
  const data = req.body;
  const result = await validateProduct(data, null);
  if (result !== "success") {
    res.locals.message = result;
    const categoryDetails = await Category.find({});
    const Product = await ProductModel.findOne({ _id: id });
    return res.render("admin/product-edit", { Product, categoryDetails });
  }
  await ProductModel.updateOne(
    { _id: id },
    {
      $set: {
        product_name: data.prodname, //
        category: data.categories, //
        price: data.price, //
        quantity: data.quantity, //
        thumbnail: data.thumbnail, //
        images: data.images, //
        size: data.size, //
        color: data.color, //
        description: data.description, //
        tag: data.tag,
      },
    }
  );
  res.redirect("/admin/product-list");
};
exports.addingProduct = async (req, res) => {
  req.session.product = true;
  const data = { ...req.body };
  const result = await validateProduct(data, data.prodname);
  if (result !== "success") {
    res.locals.message = result;
    res.locals.categoryDetails = await Category.find({});
    return res.render("admin/product-add");
  }
  await Product.create({
    product_name: data.prodname,
    category: data.categories,
    images: data.images,
    thumbnail: data.thumbnail,
    price: data.price,
    // brand: data.brand,
    color: data.color,
    size: data.size,
    description: data.description,
    quantity: data.quantity,
    tag: data.tag,
  });
  return res.redirect("/admin/product-list");
};

//###################################

const validateProduct = async (data, name) => {
  console.log(data);
  try {
    if (
      // !data.images ||
      // !data.thumbnail ||
      !data.prodname ||
      !data.categories ||
      !data.description ||
      !data.color ||
      !data.size ||
      !data.price ||
      !data.quantity ||
      !data.group_tag
    ) {
      return "Fill all the fields";
    }

    if (name) {
      const product = await Product.findOne({
        product_name: name,
      });
      if (product) {
        return "product already exist";
      }
    }

    return "success";
  } catch (err) {
    console.log(err);
    return "Something went wrong !";
    
  }
};
