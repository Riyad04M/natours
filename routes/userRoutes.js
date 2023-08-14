const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const multer = require('multer');

const router = express.Router();

// AUTHENTECATION ROUTES
router.route('/signup').post(authController.signup);
router.route('/verifyEmail').get(authController.verifyEmail);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);

router.route('/changePassword').patch(authController.updatePassword);

router.route('/Me').get(userController.getMe, userController.getUser);
router
  .route('/updateMe')
  .patch(
    userController.uploadUserImage,
    userController.resizeUserImage,
    userController.updateMe
  );
router.route('/deleteMe').delete(userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
