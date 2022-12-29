const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const commonController = require("../controllers/commonControllers");
const cartController = require("../controllers/cartControllers");
const wishcontroller = require("../controllers/wishControllers");
const otpAuth = require("../utils/twilio");
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const reviewController = require('../controllers/reviewController')
//########################  AUTH  ##############################

router
  .route("/login")
  .get(commonController.renderLogin)
  .post(authController.checkIsBlocked, authController.logInUser);

router.route("/register").get(commonController.renderRegister);

router.route("/reg-submit").post(authController.registerUser);

router.route("/otp-login").post(authController.otpVerification);

router.route("/logout").get(commonController.renderOutToLogin);

router.route("/resend-otp").get(authController.resendOtp)

//########################  COMMON  ##############################

router
  .route("/")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderHome
  );

router
  .route("/index")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderHome
  );
router
  .route("/shop")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderShop
  );
router
  .route("/Load-more")
  .get(
    
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.loadMore,
    commonController.renderShop
  );

router
  .route("/contact")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderContact
  );
router
  .route("/product")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderProduct
  );
router
  .route("/orders")
  .get(
    authController.isUserAuthed,
    commonController.userPopulator,
    authController.checkIsBlocked,
    orderController.renderorders
  );

//#################  CART  ####################################

router
  .route("/shopping-cart")
  .get(
    authController.isUserAuthed,
    authController.checkIsBlocked,
    commonController.userPopulator,
    cartController.renderCart
  );

router
  .route("/add-to-carthome")
  .patch(authController.isUserAuthedAjax, cartController.addToCarthome);

router
  .route("/remove-from-cart")
  .patch(authController.isUserAuthedAjax, cartController.deleteFromcart);

router
  .route("/cart-action")
  .patch(authController.isUserAuthedAjax, cartController.updateCart);

//#################  WISHLIST  ####################################
router
  .route("/shopping-wish")
  .get(
    authController.isUserAuthed,
    authController.checkIsBlocked,
    commonController.userPopulator,
    wishcontroller.renderWish
  );

router
  .route("/add-to-wish")
  .patch(authController.isUserAuthedAjax, wishcontroller.addToWish);

router
  .route("/remove-from-wish")
  .patch(authController.isUserAuthedAjax, wishcontroller.deleteFromWish);

//#################  CHECKOUT  ####################################

router
  .route("/render-check-out")
  .get(
    authController.isUserAuthed,
    authController.checkIsBlocked,
    commonController.userPopulator,
    commonController.renderCheckout
  );

router
  .route("/add-address-checkout")
  .post(
    authController.isUserAuthed,
    commonController.userPopulator,
    commonController.addAddressCheckout
  );
  router.route('/applyCoupon')
  .post(commonController.userPopulator,
    couponController.applyCoupon
    )
//#################  PROFILE  ######################################
router
  .route("/profile")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderProfile
  );
router
  .route("/wallet")
  .get(
    commonController.userPopulator,
    authController.checkIsBlocked,
    commonController.renderWallet
  );

router
  .route("/add-address-profile")
  .post(
    authController.isUserAuthed,
    commonController.userPopulator,
    commonController.addAddressProfile
  );
router
  .route("/delete-address")
  .patch(
    authController.isUserAuthed,
    commonController.userPopulator,
    commonController.deleteAddress
  );
// router
//   .route("/edit-address")
//   .patch(
//     authController.isUserAuthed,
//     commonController.userPopulator,
//     commonController.editAddress
//   );
//#################  ORDER  #########################################

router
.route('/place-order')
.post(
  authController.isUserAuthed,
  commonController.userPopulator,
  orderController.placeOrder
)


router.route('/verify-payment').post(
  authController.isUserAuthed,
  commonController.userPopulator,
  orderController.verifyPayment
)

router.route('/invoice').get(
  authController.isUserAuthed,
  commonController.userPopulator,
  orderController.invoice
)
router.route('/order-details').get(
  authController.isUserAuthed,
  commonController.userPopulator,
  orderController.orderinvoice
)
router.route('/cancel-order').post(
  authController.isUserAuthed,
  commonController.userPopulator,
  orderController.cancelOrder
)


// ################################
router.route('/review').post(authController.isUserAuthed,
  commonController.userPopulator,reviewController.addReview)

module.exports = router;
