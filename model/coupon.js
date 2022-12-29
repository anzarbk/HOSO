const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    percentage: {
      type: Number,
      required: true,
    },
    expiry:{
      type:Date
    },
    minLimit:{
      type:Number,
      required:true
    },
    maxLimit:{
      type:Number,
      required:true
    }
   
  },
  { timestamps: true }
);

// couponSchema.post(/^find/, (docs, next) => {
//   if (docs && docs.length) {
//     docs.isActive = new Date(docs.endDate) > Date.now();
//   }
//   next();
// });

module.exports = mongoose.model('Coupon', couponSchema);