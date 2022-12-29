const express=require('express')
const router=express.Router()
const authController = require('../controllers/authController')
const commonController = require('../controllers/commonControllers')
const prodController = require('../controllers/prodcontroller')
const catgController = require('../controllers/catgcontrollers')
const couponController = require('../controllers/couponController')
const orderController = require('../controllers/orderController')
const bannerController = require('../controllers/bannerController')
const reviewController = require('../controllers/reviewController')
//######################  LOGIN  #####################################

router.get('/',commonController.renderDashboard)
router.get('/loginAdmin',commonController.getloginToAdmin);
router.post('/loginacc',authController.renderAdminAcc); 
router.get('/logoutAdmin',authController.logoutAdmin);

//#####################  PRODUCTS  ###################################

router.get('/addingprod',authController.checkIfAdmin, prodController.renderAddprod);
router.post('/add-product',authController.checkIfAdmin,prodController.uploadProductPic,prodController.resizeProductPic,prodController.addingProduct);
router.get('/product-list',authController.checkIfAdmin,prodController.renderListprod);
router.get('/product-detail',authController.checkIfAdmin,prodController.renderDetailsprod);
router.get('/product-edit/:id',
 authController.checkIfAdmin,
prodController.renderEditprod);
router.post('/product-edit',authController.checkIfAdmin,prodController.uploadProductPic,prodController.resizeProductPic,prodController.editProduct);
router.get('/product-delete/:id',authController.checkIfAdmin,prodController.deleteProduct);
router.route('/product-info/:id').get(authController.checkIfAdmin,prodController.ProductInfo)

//####################  USER  #######################################

router.get('/user-list',authController.checkIfAdmin,commonController.renderListUser);
router.get("/userUnBlock/:id",authController.checkIfAdmin, authController.activeUsers);
router.get("/userBlock/:id",authController.checkIfAdmin, authController.blockedUsers);
router.get('/user-profile',authController.checkIfAdmin,commonController.renderProfileUSer);

//####################  CATEGORY  ####################################

router.get('/main-category',authController.checkIfAdmin,catgController.renderAddCategory);
router.post('/main-category',authController.checkIfAdmin,catgController.uploadCategoryPic,catgController.resizeCategoryPic,catgController.categoryValidate,catgController.addingCategory);
router.get('/category-delete/:id',authController.checkIfAdmin,catgController.deleteCategory);

//###################   ORDER   ######################################

router.get('/order-list',authController.checkIfAdmin,orderController.listOrder);
router.route('/order-info/:id').get(authController.checkIfAdmin,orderController.orderInfo)
// router.get('/status-not-cancel/:id',authController.checkIfAdmin,orderController.statusNotCancelled);
// router.get('/status-cancel/:id',authController.checkIfAdmin,orderController.statusCancelled);
router.route('/statusChange').patch(authController.checkIfAdmin,orderController.statusChange)

//##################  COUPON  ######################################
router.route('/add-coupon')
.get(authController.checkIfAdmin,couponController.Coupon)
.post(authController.checkIfAdmin,couponController.addCoupon)
router.route('/list-coupon')
.get(authController.checkIfAdmin,couponController.listCoupon)

router.route('/coupon-edit')
.get(authController.checkIfAdmin,couponController.editCoupon)
//patch
.post(authController.checkIfAdmin,couponController.editTheCoupon)

router.get('/coupon-delete/:id',authController.checkIfAdmin,couponController.deletecoupon);

//#################  BANNER  #######################################
router.route('/list-banner')
.get(authController.checkIfAdmin,bannerController.listBannerPage)
router.route('/delete-banner/:id')
.get(authController.checkIfAdmin,bannerController.deleteBanner)

router.route('/add-banner')
.get(authController.checkIfAdmin,bannerController.addBannerPage)
.post(authController.checkIfAdmin,bannerController.uploadBannerImage,bannerController.resizeBannerImage,bannerController.addBanner)

router.route('/edit-banner/:id')
.get(authController.checkIfAdmin,bannerController.editBannerpage)
.post(authController.checkIfAdmin,bannerController.uploadBannerImage,bannerController.resizeBannerImage,bannerController.updateBanner)

//#################  REVIEW  #######################################

router.route('/review').get(authController.checkIfAdmin,reviewController.review)
router.route('/review-delete/:id').get(authController.checkIfAdmin,reviewController.deleteReview)

module.exports = router