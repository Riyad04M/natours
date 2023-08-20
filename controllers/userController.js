const catchAsync = require('../Ulti/catchAsync');
const User = require('../model/userModel');
const factor = require('./factorController');
const AppError = require('../Ulti/appError');
const multer = require('multer');
const sharp = require('sharp');
const { findOne } = require('../model/tourModel');
const filterFields = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

////

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `img-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }

  cb(new AppError('Not an image! please upload only images. ', 400), false);
};

//git comment

const uploadImage = multer({ fileFilter, storage });
exports.uploadUserImage = uploadImage.single('photo');
exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `img-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.getAllUsers = factor.getAll(User);
exports.getUser = factor.getOne(User);
exports.updateUser = factor.updateOne(User);
exports.deleteUser = factor.deleteOne(User);

exports.getMe = (req, res, next) => {
  console.log(req.user);
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const filterdObj = filterFields(req.body, 'name', 'email', 'password');
  console.log(filterdObj);

  const user = await User.findOne(req.user._id).select('+password');
  if (!filterdObj.password) {
    return next(new AppError('please enter your current password'));
  }
  if (!(await user.correctPassword(filterdObj.password, user.password))) {
    return next(new AppError('incorrect password'));
  }

  const newData = { email: filterdObj.email, name: filterdObj.name };
  if (req.file) {
    newData.photo = req.file?.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });

  // if(req.body.password)
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
