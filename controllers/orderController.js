const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../model/order");
const Cart = require("../model/cart");
const Address = require("../model/address");
const User = require("../model/user");
const Category = require("../model/category");
const Product = require("../model/product");

exports.renderorders = async (req, res) => {
  const user = req.session.user._id;
  console.log(
    "🚀 ~ file: orderController.js:11 ~ exports.renderorders= ~ req.session.user",
    req.session.user
  );
  const orders = await Order.find({ user: user })
    .sort({ createdAt: -1 })
    .limit(10);
  console.log(
    "🚀 ~ file: orderController.js:11 ~ exports.renderorders= ~ orders",
    orders
  );
  const categoryDetails = await Category.find({});
  res.render("user/orders", { orders, categoryDetails });
};

exports.orderinvoice = async (req, res) => {
  const orderId = req.query.id;
  const orderDetails = await Order.findById(orderId).populate(
    "productDetails.product"
  );
  console.log(
    "🚀 ~ file: orderController.js:27 ~ exports.orderinvoice= ~ orderDetails",
    orderDetails
  );
  res.locals.order = orderDetails;
  res.render("user/invoice");
};
async function stockUpdate(order) {}

exports.placeOrder = async (req, res) => {
  const thisDay = new Date();
  const defaultDeliveryDelay = 10;
  const defaultDeliveryCharge = 32;
  const userId = req.session.user._id;
  const { index, payment } = req.body;
  //1 Get Cart
  const cart = res.locals.cart;

  //2 Get Address
  const allAddress = await Address.findOne({ user: userId });

  const address = allAddress.address[parseInt(index, 10)];

  //3 Prepare order to place
  const order = {
    user: userId,
    paymentType: payment,
    productDetails: [...cart.items],
    address,
    deliveryExpected: thisDay.setDate(thisDay.getDate() + defaultDeliveryDelay),
    deliveryCharge: defaultDeliveryCharge,
    status: "confirmed",
    subTotal: cart.subTotal,
    totalAmount: cart.totalAmount,
    discount: cart.discount,
    // couponUsed:asdasdasdas,
    // couponDiscount:asdadsdasdasd,
  };
  req.session.order = order;
  //4 According to payment-type create new order (Check availabilty -stock)
  try {
    const user = await User.findOne({ user: userId });
    // const cart = await Cart.findOne({ user: userId }).populate("items.product");
    //4a If COD -> Place order (Create order on DB)
    if (payment === "cod") {
      // Check if product available in stock
      await Order.create(order);

      // req.session.order= null;

      //5 If order placed successfully, delete/clear the cart & update inventory
      cart.items.forEach(async (el) => {
        await Product.findByIdAndUpdate(el.product._id, {
          $inc: { quantity: -el.quantity },
        });
      });
      await Cart.deleteOne({ user: userId });
      return res.json({
        status: true,
      });
      //4b If Online-pay ->Verify the payment and then Place order (Create order on DB)
    }
    // Online Payment Method
    if (payment === "online") {
      // Creating an instance of Razorpay to create order
      const instance = new Razorpay({
        key_id: process.env.RAZ_KEY_ID_DEV,
        key_secret: process.env.RAZ_KEY_SECRET_DEV,
      });
      // Details to create order from Razorpay server
      const options = {
        amount: order.totalAmount * 100,
        currency: "INR",
        receipt: order._id,
      };

      const orderFromRazorpay = await instance.orders.create(options);

      return res.json({
        status: true,
        order: orderFromRazorpay,
        user: req.session.user,
      });
    }
    if (payment === "wallet") {
      if (cart.totalAmount <= user.wallet) {
        await Order.create(order);
        cart.items.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: -el.quantity },
          });
        });
        user.wallet -= order.totalAmount;
        await user.save();
        await Cart.deleteOne({ user: userId });
        return res.json({
          status: true,
        });
      } else {
        return res.json({
          status: false,
          message:'Insufficient balance !'
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: false,
     
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const userId = req.session.user._id;

  const secret = process.env.RAZ_KEY_SECRET_DEV;
  const { signature, order_id, payment_id } = req.body;
  const body = `${order_id}|${payment_id}`.toString(); // body as specified in RZPay docs

  // creating expected signature to verify against
  // recieved signature with the secret key we have
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature === signature) {
    // Placing the order if ssignature verified
    await Order.create(req.session.order);
    req.session.order = null;
    const cart = res.locals.cart;
    cart.items.forEach(async (el) => {
      await Product.findByIdAndUpdate(el.product._id, {
        $inc: { quantity: -el.quantity },
      });
    });

    //5 If order placed successfully, delete/clear the cart & update inventory
    await Cart.deleteOne({ user: userId });
    res.json({
      status: true,
    });
  } else {
    res.json({
      status: false,
    });
  }
};

exports.invoice = async (req, res) => {
  const order = await Order.find({ user: req.session.user._id })
    .sort("-createdAt")
    .limit(1);

  res.locals.order = order[0];
  // res.json(order)
  res.render("user/invoice");
};

//5 If order placed successfully, delete/clear the cart & update inventory
//6 redirect to invoice page.

exports.listOrder = async (req, res) => {
  const order = await Order.find().populate("user");

  res.render("admin/order-list", { order });
};

exports.orderInfo = async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId)
    .populate("address")
    .populate({
      path: "productDetails",
      populate: {
        path: "product",
      },
    });

  res.render("admin/order-detail", { order });
};

// exports.statusNotCancelled = async (req, res) => {
//   id = req.params.id;
//   await Order.updateOne({ _id: id }, { $set: { status: true } });
//   res.redirect("/admin/order-list");
// };

// exports.statusCancelled = async (req, res) => {
//   console.log("hisdas");
//   id = req.params.id;
//   await Order.updateOne({ _id: id }, { $set: { status: "cancelled" } });
//   res.redirect("/admin/order-list");
// };
exports.statusChange = async (req, res) => {
  console.log(req.body);
  const { status, id } = req.body;
  if (
    !status ||
    !id ||
    ![
      "confirmed",
      "processing",
      "dispatched",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ].includes(status)
  ) {
    return res.json({
      status: failed,
      message: "Could not find order status !",
    });
  }
  // fetching the order from database
  const order = await Order.findById(id);
  if (!order) {
    return res.json({
      status: "failed",
      message: "Wrong order ID !",
    });
  }

  order.status = status;
  console.log(
    "🚀 ~ file: orderController.js:184 ~ exports.statusChange= ~ order.status",
    order.status
  );
  order.save();
  return res.json({
    status: "success",
    message: "Status updated !!",
  });
};
exports.cancelOrder = async (req, res) => {
  try {
    const user = req.session.user;
    const { orderId } = req.body;
    console.log(
      "🚀 ~ file: orderController.js:195 ~ exports.cancelOrder= ~ orderId",
      orderId
    );
    const order = await Order.findById(orderId);
    //status change
    if (order.paymentType == "cod") {
      //if cod && order placed, refund to wallet
      if (order.status === "delivered") {
        order.status = "return";
        order.productDetails.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: +el.quantity },
          });
        });
        await order.save();
        req.session.user = await User.findByIdAndUpdate(
          req.session.user._id,
          { $inc: { wallet: order.totalAmount } },
          { new: true }
        );
        console.log(
          "🚀 ~ file: orderController.js:216 ~ exports.cancelOrder= ~ req.session.user",
          req.session.user
        );
        return res.json({
          status: "productReturn",
        });
      } else {
        //else status change - cancel
        order.status = "cancelled";
        order.productDetails.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: +el.quantity },
          });
        });
        await order.save();
        return res.json({
          status: "success",
        });
      }
    } else if (order.paymentType == "online") {
      if (order.status === "delivered") {
        order.status = "return";
        order.productDetails.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: +el.quantity },
          });
        });
        await order.save();
        req.session.user = await User.findByIdAndUpdate(
          req.session.user._id,
          { $inc: { wallet: order.totalAmount } },
          { new: true }
        );

        return res.json({
          status: "productReturn",
        });
      } else {
        //else status change - cancel
        order.status = "cancelled";
        order.productDetails.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: +el.quantity },
          });
        });
        await order.save();
        req.session.user = await User.findByIdAndUpdate(
          req.session.user._id,
          { $inc: { wallet: order.totalAmount } },
          { new: true }
        );

        return res.json({
          status: "success",
        });
      }
    } else if (order.paymentType == "wallet") {
      if (order.status === "delivered") {
        order.status = "return";
        order.productDetails.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: +el.quantity },
          });
        });
        await order.save();
        req.session.user = await User.findByIdAndUpdate(
          req.session.user._id,
          { $inc: { wallet: order.totalAmount } },
          { new: true }
        );

        return res.json({
          status: "productReturn",
        });
      } else {
        //else status change - cancel
        order.status = "cancelled";
        order.productDetails.forEach(async (el) => {
          await Product.findByIdAndUpdate(el.product._id, {
            $inc: { quantity: +el.quantity },
          });
        });
        await order.save();
        req.session.user = await User.findByIdAndUpdate(
          req.session.user._id,
          { $inc: { wallet: order.totalAmount } },
          { new: true }
        );

        return res.json({
          status: "success",
        });
      }
    }
  } catch (err) {
    console.log(err.message);
    return res.json({
      status: "failed",
    });
  }
};
// const order1 = await Order.findByIdAndUpdate(orderId,{status:'cancelled'})

//if onlinepayment refund to wallet

//   console.log(req.body);
//  const {status,id} = req.body
//  if(!status||!id||!['confirmed',
//  'processing',
//  'dispatched',
//  'out-for-delivery',
//  'delivered',
//  'cancelled',].includes(status)){
//   return res.json({
//     status:failed,
//     message:'Could not find order status !'
//   })
//  }
// // fetching the order from database
//  const order=await Order.findById(id)
//  if(!order){
//   return res.json({
//     status:'failed',
//     message:'Wrong order ID !'
//   })
//  }

//  order.status=status;
//  console.log("🚀 ~ file: orderController.js:184 ~ exports.statusChange= ~ order.status", order.status)
//  order.save();
//  return res.json({
//   status:'success',
//   message:'Status updated !!'
//  })
// };
