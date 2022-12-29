const mongoose = require("mongoose");
const AddressSchema = new mongoose.Schema({
 user:{
    type:mongoose.Types.ObjectId,
    ref:"User",
    required:true

 },
 address:[{
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    streetaddress:{
        type:String,
        required:true
    },
    postcode:{
        type:Number,
        required:true
    },
    town:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
 }],
},
{
    timestamps: true,
}

)
    module.exports = mongoose.model("Address", AddressSchema);