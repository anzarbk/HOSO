const mongoose=require('mongoose')
const Product = require("../model/product");
const User = require("../model/user");

exports.addToWishlist=async (req,res)=>{
    const productId=req.query;
    const userId=mongoose.Types.ObjectId(req.user.id);
    
}