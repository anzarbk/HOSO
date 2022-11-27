const express=require('express')
const router=express.Router()
const authController = require('../controllers/authController')
const commonController = require('../controllers/commonControllers')
const prodController = require('../controllers/prodController')
const catgController = require('../controllers/catgControllers')

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
// authController.checkIfAdmin,
prodController.renderEditprod);
router.post('/product-edit',authController.checkIfAdmin,prodController.uploadProductPic,prodController.resizeProductPic,prodController.editProduct);
router.get('/product-delete/:id',authController.checkIfAdmin,prodController.deleteProduct);


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

// router.get('/user-profile',commonController.renderProfileUSer);
// router.get('/user-profile',commonController.renderProfileUSer);
// router.get('/user-profile',commonController.renderProfileUSer);
// router.get('/user-profile',commonController.renderProfileUSer);


//#################  REVIEW  #######################################

//router.get('/user-profile',commonController.renderProfileUSer);

module.exports = router