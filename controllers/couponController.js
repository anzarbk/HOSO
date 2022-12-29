const Coupon = require("../model/coupon");
const Cart = require("../model/cart");
const Category = require("../model/category");
const { findOne } = require("../model/user");
const roundOff = (num) => Math.round(num * 100) / 100;
exports.Coupon = (req, res) => {
  res.locals.message = null;
  res.render("admin/add-coupon");
};
exports.addCoupon = async (req, res) => {
  console.log(req.body);
  let message;
  try {
    const coupon = await Coupon.findOne({ code: req.body.code });
    if (coupon) {
      message = "Coupon already exists !";
      res.locals.message = message;
      return res.render("admin/add-coupon");
    }
    if (
      !req.body.name ||
      !req.body.code ||
      !req.body.description ||
      !req.body.percentage ||
      !req.body.minLimit ||
      !req.body.maxLimit ||
      !req.body.expiry
    ) {
      message = "Fill all the fields";
      res.locals.message = message;
      return res.render("admin/add-coupon");
    }
    
    await Coupon.create({
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      percentage: req.body.percentage,
      expiry: req.body.expiry,
      minLimit: req.body.minLimit,
      maxLimit: req.body.maxLimit,
    });
    return res.redirect("/admin/list-coupon");
  } catch (error) {
    console.log(error);
    message = `Internal error : ${err.message}`;
    res.render("admin/add-coupon");
  }
};
exports.listCoupon = async (req, res) => {
  const coupon = await Coupon.find();
  console.log(coupon);
  res.render("admin/coupon-list", { coupon });
};
exports.editCoupon = async (req, res) => {
  let couponId = req.query.id;
  console.log(couponId);
  const coupon = await Coupon.findById(couponId);
  res.render("admin/edit-coupon", { coupon });
};
exports.editTheCoupon = async (req, res) => {
  let couponId = req.query.id;
  //try, validate response
  await Coupon.findByIdAndUpdate(couponId, {
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    percentage: req.body.percentage,
    expiry: req.body.expiry,
    minLimit: req.body.minLimit,
    maxLimit: req.body.maxLimit,
  });
  return res.redirect("/admin/list-coupon");
};
exports.deletecoupon = async (req, res) => {
  let couponId = req.params.id;
  console.log(
    "🚀 ~ file: couponController.js:74 ~ exports.deletecoupon ~ couponId",
    couponId
  );
  await Coupon.deleteOne({ _id: couponId });
  res.redirect("/admin/list-coupon");
};
exports.applyCoupon = async (req, res) => {
  try {
    const categoryDetails = await Category.find({});
    if (!req.body) {
      res.locals.message = "fill the field";
      res.locals.categoryDetails = categoryDetails;
      return res.render("user/check-out");
    }
    const userId = req.session.user._id;
    const code = req.body.code;
    const date = new Date();
    const coupon = await Coupon.findOne({ code: code });
    if (!coupon) {
      res.locals.message = "invalid coupon";
      return res.render("user/check-out");
    }
    if (date >= coupon.expiry) {
      res.locals.message = "coupon expired";
      return res.render("user/check-out");
    }
    const cart = await Cart.findOne({ user: userId });
    const couponAmount = roundOff((cart.totalAmount * coupon.percentage) / 100);
    cart.couponDiscount = couponAmount;
    cart.totalAmount -= couponAmount;
    cart.save();
    return res.redirect("/render-check-out");
  } catch (err) {
    console.log(err);
  }
};
