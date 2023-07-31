const Tour = require('./../model/tourModel');
const factor = require('./factorController');
const ApiFeatures = require('./../Ulti/apiFeatures');
const catchAsync = require('./../Ulti/catchAsync');
const AppError = require('../Ulti/appError');

const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }

  cb(new AppError('Not an image! please upload only images. ', 400), false);
};

const uploadImage = multer({ fileFilter, storage });

exports.uploadTourImages = uploadImage.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `img-tour-${req.user._id}-${Date.now()}.jpeg`;
  req.body.images = [];
  // 1) resize imageCover
  console.log('hi mam', req.files.imageCover[0]);
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) resize images

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `img-tour-${req.user._id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.alisingTopTours = (req, res, next) => {
  console.log(req.query);
  req.query.limit = '5';
  req.query.sort = '-price,-ratingsAverage';
  req.query.ratingsAverage = { gte: '4.5' };
  console.log(req.query);
  next();
};

exports.getAllTours = factor.getAll(Tour);
exports.getTour = factor.getOne(Tour, { path: 'reviews' });
exports.addTour = factor.createOne(Tour);
exports.updateTour = factor.updateOne(Tour);
exports.deleteTour = factor.deleteOne(Tour);

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numTourStarts: { $sum: 1 },
        tourName: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { month: 1 } },
  ]);
  res.status(200).json({
    status: 'succes',
    results: plan.length,
    data: plan,
  });
});

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // { $match: { price: { $gte: 697 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        highestPrice: { $max: '$price' },
        lowestPrice: { $min: '$price' },
      },
    },
    { $sort: { avgRating: 1 } },
    // { $match: { _id: { $ne: 'easy' } } },
  ]);

  res.status(200).json({
    status: 'succes',
    data: stats,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide the latutide and the longitude in the format lat,lng',
        400
      )
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(distance, latlng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(lng, lat);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide the latutide and the longitude in the format lat,lng',
        400
      )
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: distances,
  });
});
