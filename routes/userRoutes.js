const express=require('express')
const router=express.Router()
const authController = require('../controllers/authController')
const commonController = require('../controllers/commonControllers')
const cartController = require('../controllers/cartControllers')
const otpAuth = require('../utils/twilio')

//########################  MAIN  ###############################

router.get('/',commonController.renderHome)
router.get('/logout',commonController.renderOutToLogin)

//########################  LOGIN  ##############################

router.get('/login',authController.checkNotAuthenticated,commonController.renderLogin);
router.post('/login-acc',authController.checkNotAuthenticated,authController.renderAcc);
router.get('/create-reg',commonController.renderRegister)
router.get('/index',commonController.renderHome);
router.get('/shop',commonController.renderShop);
router.get('/contact',commonController.renderContact);

//########################  REGISTER  ##############################

router.get('/register',authController.checkNotAuthenticated,commonController.renderRegister)
router.post('/reg-submit',authController.checkNotAuthenticated,authController.registerUser);
// router.get('/render-',commonController.renderLogin)
// router.post('/reg-otp',authController.checkNotAuthenticated,authController.otpValidation);
router.post('/otp-login',authController.checkNotAuthenticated,authController.otpRenderIndex);
router.get('/reg-login',commonController.renderLogin)
router.get('/index',commonController.renderHome);
router.get('/shop',commonController.renderShop);
router.get('/contact',commonController.renderContact);

//##################  SHOP  #################################

router.get('/shop',commonController.renderShop);
router.get('/product',commonController.renderProduct)
router.get('/add-to-cart',cartController.addToCart)

//#################  CART  ####################################

router.get('/shopping-cart',authController.checkAuthenticated,authController.checkIsBlocked,cartController.renderCart);
// router.get('/shopping-cart',commonController.renderCheckout);

//#################  CONTACT  #################################

router.get('/contact',commonController.renderContact);

//#######################################################

module.exports = router