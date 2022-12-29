const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: [true],
      enum: [
        "confirmed",
        "processing",
        "dispatched",
        "out-for-delivery",
        "delivered",
        "cancelled",
        "return",
      ],
      default: "confirmed",
    },
    productDetails: [
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
    address: {
      type: Object,
      required: true
    },
    deliveryExpected: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    deliveryCharge: {
      type: Number,
      default: 10,
    },
    subTotal: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    couponUsed: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);