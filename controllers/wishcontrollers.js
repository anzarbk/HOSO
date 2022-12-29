const Wish = require("../model/wishlist")
const Product = require("../model/product");
const Category = require("../model/category");

exports.renderWish = async (req, res) => {
    let wish = null;
    if (req.session.user) {
        wish = await Wish.findOne({ user: req.session.user._id }).populate(
        "items.product"
      );
    }
    const categoryDetails = await Category.find({});
    res.render("user/wishlist", { categoryDetails, wish });
  };

 
  
  exports.deleteFromWish= async (req, res) => {
    try {
      const userId = req.session.user._id;
      const index = req.body.index;
      const wish = await Wish.findOne({ user: userId });
       wish.items.splice(index, 1);
        await wish.save();
        return res.json({
          status: "success",
        });
      
    } catch (err) {
      console.log(err);
      res.json({
        status: "failed",
        message: err.message,
      });
    }
  };



exports.addToWish = async (req, res) => {
    try {
      const userId = req.session.user._id;
      const productId = req.body.productId;
  
      const wish = await Wish.findOne({ user: userId });
      const product = await Product.findById(productId);
      
  
      //1 No wish at present for user
      if (!wish) {
        const newWish = await Wish.create({
          user: userId,
          items: [
            {
              product: productId,
              price: product.price,
             
            },
          ]
      
        });
        if (newWish) {
          return res.json({status : 'success'})
        }
  
        //2  Have wish and product already inside wish
      } 
      else if (
        wish &&
        wish.items.some((obj) => obj.product.toString() == productId)
      ) {
        const index = wish.items.findIndex(
          (obj) => obj.product.toString() == productId
        );
       
        wish.items.splice(index, 1); 

       
        await wish.save();
        return res.json({status : 'removed'})
  
        //3 User have wish but current product not in wish
      }
       else {
        wish.items.push({
          product: productId,
          price: product.price
        });
        await wish.save();
        return res.json({status : 'success'})
      }
    } catch (err) {
      console.log(err);
      return res.json({status : 'failed'});
    }
  };