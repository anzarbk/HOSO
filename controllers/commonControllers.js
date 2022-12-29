//#############  MAIN  ##########################
const mongoose = require("mongoose");
const admin = require("../model/admin");
const ProductModel = require("../model/product");
const User = require("../model/user");
const Category = require("../model/category");
const Wishlist = require("../model/wishlist");
const Cart = require("../model/cart");
const Address = require("../model/address");
const Order = require("../model/order");
const Review = require("../model/review");
const Banner = require("../model/banner");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const Coupon = require("../model/coupon");
const {
  ConversationList,
} = require("twilio/lib/rest/conversations/v1/conversation");

const multerStorage = multer.memoryStorage();

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

exports.uploadProfilePic = upload.single("image");

////////////////////////////////////////////////////////////////////////////
exports.resizeProfilePic = (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  req.file.filename = `${req.session.user.name}-${
    req.session.user._id
  }-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
};

//#############  COMMON ALL #####################
module.exports.renderHome = async (req, res) => {
  const categoryDetails = await Category.find();
  let menProducts = []
  let womenProducts =[]

  if (categoryDetails.length){
  const menCategoryObj = categoryDetails.find((el) => el.name === "MEN");
  const womenCategoryObj = categoryDetails.find((el) => el.name === "WOMEN");
   menProducts = await ProductModel.find({category: menCategoryObj._id})
    .sort({ createdAt: -1 })
    .populate("category")
    .limit(7)
   womenProducts = await ProductModel.find({category: womenCategoryObj._id})
    .sort({ createdAt: -1 })
    .populate("category")
    .limit(7)
   

  }

  res.locals.menProducts = menProducts 
  res.locals.womenProducts = womenProducts 
  const banner = await Banner.find();
    res.render("user/index", {
    categoryDetails,
    banner,
    
  });
};
exports.renderRegister = (req, res) => {
  res.render("user/register");
};
exports.registerUser = (req, res) => {
  res.render("user/login");
};
exports.renderLogin = (req, res) => {
  res.render("user/login");
};
exports.renderOutToLogin = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
  });
  res.redirect("/login");
};

exports.renderShop = async (req, res) => {
  const { category } = req.query;
  let productDetails;
  if (category) {
    productDetails = await ProductModel.find({ category })
      .sort({ createdAt: -1 })
      .limit(9);
  } else {
    productDetails = await ProductModel.find({})
      .sort({ createdAt: -1 })
      .limit(9);
  }

  const categoryDetails = await Category.find({});
  res.render("user/shop", { categoryDetails, productDetails });
};
exports.renderContact = async (req, res) => {
  const categoryDetails = await Category.find({});
  res.render("user/contact", { categoryDetails });
};
exports.renderWallet = async (req, res) => {
  const categoryDetails = await Category.find({});
  const user = await User.findById(req.session.user);
  res.render("user/wallet", { user, categoryDetails });
};
exports.renderProduct = async (req, res) => {
  const { _id } = req.query;
  const review = await Review.find({ product: _id }).populate("user");
  const productView = await ProductModel.findById(_id).populate("category");
  const categoryDetails = await Category.find({});
  res.render("user/product", { categoryDetails, productView, review });
};
//###############  USER  ######################

exports.renderGridUser = (req, res) => {
  res.render("admin/user-card");
};
exports.renderListUser = async (req, res) => {
  const userDetails = await User.find();
  res.render("admin/user-list", { userDetails });
};
exports.renderProfileUSer = (req, res) => {
  res.render("admin/user-profile");
};
exports.renderLogout = (req, res) => {
  res.status(200).clearCookie("connect.sid", {
    path: "/admin/loginAdmin",
  });
  req.session.destroy(function (err) {
    res.redirect("/admin/loginAdmin");
  });
};
exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.session.user);
  const { _id } = req.query;
  const productView = await ProductModel.findById(_id);
  const categoryDetails = await Category.find({});
  res.render("user/profile", { categoryDetails, productView, user });
};

exports.userPopulator = async (req, res, next) => {
  const user = req?.session?.user;
  if (user) {
    res.locals.profile = await User.findById(user._id);
    res.locals.wishlist = await Wishlist.findOne({ user: user._id });
    res.locals.cart = await Cart.findOne({ user: user._id }).populate(
      "items.product"
    );
    res.locals.categoryDetails = await Category.find();
    res.locals.address = await Address.find({ user: user._id });

    return next();
  }
  res.locals.profile = null;

  next();
};

exports.loadMore = async (req, res) => {
  try {
    const page = req.query.page;
    const result = {};
    result.page = parseInt(page) + 1;
    result.data = await ProductModel.find({})
      .sort({ createdAt: -1 })
      .skip(9 * page)
      .limit(9);
    if (result.data.length) {
      return res.json({
        status: "success",
        result,
        cart: res.locals.cart,
        wishlist: res.locals.wishlist,
      });
    } else {
      return res.json({
        status: "failed",
        message: "No more items !",
      });
    }
  } catch (er) {
    console.log(er.message);
    return res.json({
      status: "error",
      message: "Something went wrong !",
    });
  }
};

//###########  CART  ############################

exports.renderCart = async (req, res) => {
  const cart = res.locals.cart;
  // adding availability on cart
  cart.items.forEach((el) => {
    el.isAvailable = el.product.quantity >= el.quantity;
  });
  res.locals.cart = cart;
  console.log(
    "🚀 ~ file: commonControllers.js:116 ~ exports.renderCart= ~ cart",
    cart
  );
  const categoryDetails = await Category.find({});
  res.render("user/shopping-cart", { categoryDetails, productView });
};
exports.renderCheckout = async (req, res) => {
  const cart = res.locals.cart;

  // adding availability on cart
  cart.items.forEach((el) => {
    el.isAvailable = el.product.quantity >= el.quantity;
  });
  res.locals.cart = cart;

  const categoryDetails = await Category.find();
  res.render("user/check-out", { categoryDetails });
};

exports.signUp = async (req, res) => {
  const { email, name, password } = req.body;

  const adminacc = {
    name,
    email,
    password,
  };

  let status = await admin(adminacc).save();
};
exports.renderUserLogout = (req, res) => {
  res.status(200).clearCookie("connect.sid", {
    path: "/user/login",
  });
  req.session.destroy(function (err) {
    res.redirect("/user/login");
  });
};

//################   CHECK-OUT   #######################
//dec req
exports.addAddressProfile = async (req, res) => {
  const userId = req.session.user._id;
  try {
    const address = await Address.findOne({ user: userId });
    if (!address) {
      await Address.create({
        user: userId,
        address: [req.body],
      });
      return res.redirect("/profile");
    } else {
      const address = { ...req.body };
      await Address.updateOne(
        {
          user: userId,
        },
        {
          $push: {
            address,
          },
        }
      );
      return res.redirect("/profile");
    }
  } catch (err) {
    console.log(err);
    res.render("user/404"); //swal something went wrong
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    let { index } = req.body;

    if (!index && index != 0)
      return res.json({
        status: false,
        message: "No index found",
      });
    index = parseInt(index, 10);
    console.log(
      "🚀 ~ file: commonControllers.js:171 ~ exports.deleteAddress ~ index",
      typeof index
    );
    console.log(
      "🚀 ~ file: commonControllers.js:171 ~ exports.deleteAddress ~ index",
      index
    );

    const userId = req.session.user._id;
    const address = await Address.findOne({
      user: userId,
    });
    address.address.splice(index, 1);
    await address.save();
    return res.json({
      status: true,
    });
  } catch (er) {
    console.log(er);
    return res.json({
      status: false,
      message: er.message,
    });
  }
};
exports.addDp = (req, res) => {};

exports.addAddressCheckout = async (req, res) => {
  const userId = req.session.user._id;
  try {
    const address = await Address.findOne({ user: userId });
    if (!address) {
      await Address.create({
        user: userId,
        address: [req.body],
      });
      return res.redirect("/render-check-out");
    } else {
      const address = { ...req.body };
      await Address.updateOne(
        {
          user: userId,
        },
        {
          $push: {
            address,
          },
        },
        {
          runValidators: true,
        }
      );
      return res.redirect("/render-check-out");
    }
  } catch (err) {
    console.log(err);
    res.render("user/404");
  }
};

// exports.editAddress = async (req,res)=>{
//   userId=req.session.user._id
//   try {
//     await Address.updateOne({
//       user:userId
//     },{
//       $set:{
//         address:[req.body]
//       }

//     })
//     return res.redirect("/profile");
//   } catch (error) {
//     console.log(err);
//   }

// }

//########################################################################################
//######################################   ADMIN   #######################################
//#########################################################################################
//#######################   LOGIN    ########################

exports.getloginToAdmin = (req, res) => {
  res.render("admin/loginAdmin");
};
exports.renderDashboard = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(10)
  const usercount = await User.find().count();
  const order = await Order.find().count();
  const product = await ProductModel.find().count();
  const orders = await Order.find().populate([
    {
      path: "productDetails.product",
      model: "Product",
    },
    {
      path: "user",
      model: "User",
    },
  ]);
  const confirmedOrders = await Order.find({ status: "confirmed" }).count();
  const processingOrders = await Order.find({ status: "processing" }).count();
  const dispatchedOrders = await Order.find({ status: "dispatched" }).count();
  const deliverydOrders = await Order.find({
    status: "out-for-delivery",
  }).count();
  const deliveredOrders = await Order.find({ status: "delivered" }).count();
  const cancelledOrders = await Order.find({ status: "cancelled" }).count();
  const returnOrders = await Order.find({ status: "return" }).count();
  let orderCount = [
    confirmedOrders,
    processingOrders,
    dispatchedOrders,
    deliverydOrders,
    deliveredOrders,
    cancelledOrders,
    returnOrders,
  ];

  let lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  let lastMonth = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  let today = Date.now();
  let weekRevenue = await Order.aggregate([
    {
      $match: { createdAt: { $gt: lastWeek } },
    },
    {
      $project: { createdAt: 1, totalAmount: 1 },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalAmount: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
  ]).sort({ _id: 1 });
  let revenueDate = [];
  let revenueAmount = [];
  let countOrder = [];
  console.log(weekRevenue);

  weekRevenue.forEach((e) => {
    revenueDate.push(e._id);
    revenueAmount.push(e.totalAmount);
    countOrder.push(e.count);
  });
  console.log(weekRevenue);

  const reviews = await Review.find();
  const products = await ProductModel.find().sort({ createdAt: -1 }).limit(5)
  if (req.session.admin) {
    res.render("admin/dashboard", {
      users,
      orders,
      reviews,
      products,
      usercount,
      orderCount,
      revenueDate,
      revenueAmount,
      countOrder,
      order,
      product,
    });
  } else {
    res.redirect("/admin/loginAdmin");
  }
};
