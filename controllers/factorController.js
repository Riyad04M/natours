const catchAsync = require('./../Ulti/catchAsync');
const AppError = require('./../Ulti/appError');
const ApiFeatures  = require('./../Ulti/apiFeatures')

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(204).json({
      status: 'succes',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(Object.keys(req.body))
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No docment found with that ID', 404));
    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No tour found with that ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // filtering the eviews for specific Tour
    let filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;
    // querying
    console.log(req.query);
    const docFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    //Excute query

    const doc = await docFeatures.query.populate('guides');

    // query.sort().select().limit().skip()
    // const q2uery = Tour.find()
    //   .where('page')
    //   .equals(7)
    //   .where('difficulty')
    //   .equals('easy');

    // send response

    res.status(200).json({
      status: 'success',
      results: doc.length,
      timeRequested: req.requestTime,
      data: {
        doc,
      },
    });
  });
