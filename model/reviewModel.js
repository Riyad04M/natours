const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, `you can't post empty comment`],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, `You can't post a comment without a rating`],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
  this.populate({path : 'user' ,select : '-email'});
  next();
});
reviewsSchema.statics.calcRatingsAvg = async function (tourId) {
  console.log(tourId);
  const stats = await Review.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};
reviewsSchema.post('save', function () {
  this.constructor.calcRatingsAvg(this.tour);
});
reviewsSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();

  next();
});
reviewsSchema.post(/^findOneAnd/, async function () {
  await this.rev.constructor.calcRatingsAvg(this.rev.tour);
});
const Review = mongoose.model('Review', reviewsSchema);
module.exports = Review;
