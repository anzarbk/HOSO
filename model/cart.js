const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          default: 0,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subTotal:{
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    discount:{
      type: Number,
    },
    couponDiscount:{
      type: Number,
      default:0,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
