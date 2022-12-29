const mongoose = require("mongoose");
const WishSchema = new mongoose.Schema(
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
            
            price: {
              type: Number,
              default: 0,
            },
            date: {
              type: Date,
              default: Date.now,
            },
          }
        ]
      },
      {
        timestamps: true,
      }
    );
    module.exports = mongoose.model("Wish", WishSchema);