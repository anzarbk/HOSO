const mongoose=require('mongoose')
const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        minLen: [2, 'User must have at least 2 letters !'],
        maxLen: [64, 'User name cannot exceed 64 letters !'],
      },
      email: {
        type: String,
        required: [true, '2'],
        unique: true,
        lowercase: true,
        // validate: [validator.isEmail, 'Please enter a valid email address'],
      },
      password: {
        type: String,
        required: [true, 'User has to provide password in order to login'],
      },
      age: {
        type: Number,
        default: 18,
      },
      isBlocked: {
        type: Boolean,
        default: false,
      },
      contactNumber: {
        type: Number,
      },
      image: {
        type: String,
      },
      address: {
        type: mongoose.Types.ObjectId,
        ref: 'Address',
      },
      cart: {
        type: mongoose.Types.ObjectId,
        ref: 'Cart',
      },
      wishlist: {
        type: Array,
        
      },
      
      role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
        select: false,
      },
      verified:{
        type:Boolean,
        default:false
      },
      wallet:{
        type:Number
      }
      
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model('User', userSchema);
  