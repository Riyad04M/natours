const Review = require('./../model/reviewModel');
const factor = require('./factorController');

exports.setTourUserIds = (req, res, next) => {
  req.body.user = req.user._id;
  req.body.tour = req.params.tourId;
  next();
};

exports.getAllReviews = factor.getAll(Review)
exports.getReview = factor.getOne(Review);
exports.addReview = factor.createOne(Review);
exports.deleteReview = factor.deleteOne(Review);
exports.updateReview = factor.updateOne(Review);
