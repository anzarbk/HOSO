const User = require("../model/user");
const Cart = require("../model/cart");
const Product = require("../model/product");
const Category = require("../model/category");
const cart = require("../model/cart");


exports.renderCart=async(req,res)=>{
    const profile=req.user
    console.log(profile)
    
    const cart=await Cart.findOne({user:profile._id}).populate('items.product')
     console.log(cart);
    const categoryDetails = await Category.find({})
    res.render('user/shopping-cart',{profile,categoryDetails,cart})
}

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user;
    const productId = req.query._id;

    const cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);

    //1 No cart at present for user
    if (!cart) {
      const newCart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            price: product.price,
            quantity: 1,
          },
        ],
        totalAmount: product.price,
      });
      if (newCart) {
        return res.redirect(`/product?_id=${productId}`);
      }

      //2  Have cart and product already inside cart
    } else if (
      cart &&
      cart.items.some((obj) => obj.product.toString() == productId)
    ) {
      const index = cart.items.findIndex(
        (obj) => obj.product.toString() == productId
      );
      cart.items[index].quantity += 1;
      cart.totalAmount += product.price;
      await cart.save();
      return res.redirect(`/product?_id=${productId}`);

      //3 User have cart but current product not in cart
    } else {
      cart.items.push({
        product: productId,
        quantity: 1,
        price: product.price,
      });
      cart.totalAmount += product.price;
      await cart.save();
      return res.redirect(`/product?_id=${productId}`);
    }
  } catch (err) {
    console.log(err);
    return res.redirect(`/`);
  }
};

// exports.deleteFromcart=(req,res)=>{
   
// }

// if(profile){
//     await Cart.updateOne({profile._id},{

//             $push:{products}

//     })

// }else{
//     await Cart.create({
//     user:profile._id,
//         products:[{
//             product:product._id,
//             amount:product.price
//         }],
// })
// }

// // }

//
