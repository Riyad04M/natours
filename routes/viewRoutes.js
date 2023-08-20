const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get(
  '/verifyEmail/:id/:uniqueString',
  authController.verifyEmail,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/forgotMyPassword', viewsController.getForgotPassForm);
router.get(
  '/resetPassword/:token',
  authController.validateResetToken,
  viewsController.getResetForm
);

router.get('/me', authController.protect, viewsController.getAccount);

// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );

module.exports = router;
