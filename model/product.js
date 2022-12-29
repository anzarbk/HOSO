const mongoose=require('mongoose')
const ProductSchema = new mongoose.Schema(
    {
      product_name: {
        type: String,
        reqiured:true
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        reqiured:true,
        ref:"Category"
      },
      thumbnail:{
        type: String
      },
      images: {
        type: [String],
      },
      price : {
        type: Number,
        reqiured:true
      },
      size : {
        type: String,
        reqiured:true
      },
      color : {
        type: String,
        reqiured:true
      },
      quantity : {
        type: Number,
        reqiured:true
      },
      description : {
        type: String,
        reqiured:true
      },    
      tag : {
        type: String,
        reqiured:true
      },
      discount:{
        type: Number,
        default: 0
      } 
    },
    {
      timestamps:true
    });

  module.exports = mongoose.model('Product', ProductSchema);