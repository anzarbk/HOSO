const User = require("../model/user");
const Cart = require("../model/cart");
const Product = require("../model/product");
const Category = require("../model/category");

const roundOff = (num) => Math.round(num * 100) / 100;

exports.renderCart = async (req, res) => {
  let cart = null;
  if (req.session.user) {
    cart = await Cart.findOne({ user: req.session.user._id }).populate(
      "items.product"
    );
    console.log("🚀 ~ file: cartcontrollers.js:14 ~ exports.renderCart= ~ cart", cart)
    // adding availability on cart
    if(cart){
    cart.items.forEach((el) => {
      el.isAvailable = el.product.quantity >= el.quantity;
    });
  }
    res.locals.cart = cart;

    console.log("🚀 ~ file: commonControllers.js:116 ~ exports.renderCart= ~ cart", cart)
  }
  const categoryDetails = await Category.find({});
  res.render("user/shopping-cart", { categoryDetails, cart });
};

// exports.addToCart = async (req, res) => {
//   try {
//     const userId = req.session.user._id;
//     const productId = req.query._id;

//     const cart = await Cart.findOne({ user: userId });
//     const product = await Product.findById(productId);

//     //1 No cart at present for user
//     if (!cart) {
//       const newCart = await Cart.create({
//         user: userId,
//         items: [
//           {
//             product: productId,
//             price: product.price,
//             quantity: 1,
//           },
//         ],
//         totalAmount: product.price,
//       });
//       if (newCart) {
//         return res.redirect(`/product?_id=${productId}`);
//       }

//       //2  Have cart and product already inside cart
//     } else if (
//       cart &&
//       cart.items.some((obj) => obj.product.toString() == productId)
//     ) {
//       const index = cart.items.findIndex(
//         (obj) => obj.product.toString() == productId
//       );
//       cart.items[index].quantity += 1;
//       cart.totalAmount += product.price;
//       await cart.save();
//       return res.redirect(`/product?_id=${productId}`);

//       //3 User have cart but current product not in cart
//     } else {
//       cart.items.push({
//         product: productId,
//         quantity: 1,
//         price: product.price,
//       });
//       cart.totalAmount += product.price;
//       await cart.save();
//       return res.redirect(`/product?_id=${productId}`);
//     }
//   } catch (err) {
//     console.log(err);
//     return res.redirect(`/`);
//   }
// };

exports.deleteFromcart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const id = req.body.id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    const index = cart.items.findIndex(
      (obj) => obj._id.toString() === id.toString()
    );

    const product = cart.items[index].product;
    const discountAmount = roundOff((product.price * product.discount) / 100);

    const discountAmountSingle = (product.price * product.discount) / 100;
    const totalDiscount = cart.items[index].quantity * discountAmount;
    const totalForProduct =
      (product.price - discountAmountSingle) * cart.items[index].quantity;

    const reductAmount = cart.items[index].quantity * cart.items[index].price;
    cart.subTotal -= roundOff(reductAmount);
    cart.discount -= roundOff(totalDiscount);
    cart.totalAmount -= roundOff(totalForProduct);

    cart.items.splice(index, 1);
    await cart.save();
    return res.json({
      status: "success",
      total: cart.totalAmount,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "failed",
      message: err.message,
    });
  }
};
exports.updateCart = async (req, res, next) => {
  const { index, action } = req.body;

  try {
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    const product = cart.items[index].product;
    const discountAmount = roundOff((product.price * product.discount) / 100);

    if (action === "inc") {
      cart.items[index].quantity += 1;
      cart.subTotal = roundOff(cart.subTotal + product.price);
      cart.discount = roundOff(cart.discount+discountAmount);
      cart.totalAmount = roundOff(cart.totalAmount +(product.price - discountAmount));

      await cart.save();
      return res.json({
        status: "success",
        message: `${action}rement has done on ${index + 1}-th product on cart!`,
        cart,
      });
    } else if (action === "dec") {
      cart.items[index].quantity -= 1;
      cart.subTotal = roundOff(cart.subTotal -product.price);
      cart.discount = roundOff(cart.discount -discountAmount);
      cart.totalAmount = roundOff(cart.totalAmount -(product.price - discountAmount));

       await cart.save();
      return res.json({
        status: "success",
        message: `${action}rement has done on ${index + 1}-th product on cart!`,
        cart,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "failed",
      message: err.message,
    });
  }

  res.json({
    status: "failed",
  });
};

exports.addToCarthome = async (req, res) => {
  console.log("cart function");
  try {
    const userId = req.session.user._id;
    const productId = req.body.productId;
    const cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);
    const discountAmount = roundOff((product.price * product.discount) / 100);

    //1 No cart at present for user
    if (!cart) {
      await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            price:roundOff(product.price),
            quantity: 1,
          },
        ],
        subTotal: roundOff(product.price),
        discount: roundOff(discountAmount),
        totalAmount: roundOff(product.price - discountAmount),
      });
      return res.json({
        status: "success",
      });

      //2  Have cart and product already inside cart
    } else if (
      cart &&
      cart.items.some((obj) => obj.product.toString() == productId)
    ) {
      return res.json({
        status: "already",
      });

      //3 User have cart but current product not in cart
    } else {
      cart.items.push({
        product: productId,
        quantity: 1,
        price: product.price,
      });
      cart.subTotal = roundOff(cart.subTotal +product.price);
      cart.totalAmount = roundOff(cart.totalAmount +(product.price - discountAmount));
      cart.discount = roundOff(cart.discount +discountAmount);
      await cart.save();
      return res.json({
        status: "success",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      status: "failed",
      message: "added",
    });
  }
};
