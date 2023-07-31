const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
// router.param('id', tourController.checkId);

router.use('/:tourId/reviews', reviewRouter);

router.route('/stats').get(tourController.tourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/top-5-cheapest')
  .get(tourController.alisingTopTours, tourController.getAllTours);

router.route('/').get(tourController.getAllTours).post(
  authController.protect,
  authController.restrictTo('admin'),

  tourController.addTour
);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

module.exports = router;
