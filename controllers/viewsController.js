const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const catchAsync = require('../Ulti/catchAsync');
const AppError = require('../Ulti/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  // console.log(tour);
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  if (res.locals.user) {
    return res.redirect('/');
  }
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
exports.getSignupForm = (req, res) => {
  if (res.locals.user) {
    return res.redirect('/');
  }
  res.status(200).render('signup', {
    title: 'Log into your account',
  });
};
exports.getForgotPassForm = (req , res , next) => {
  res.status(200).render('forgotPassword' , {
    title : 'Forgot Your Password' , 
  })
}
exports.getResetForm = (req , res , next) => {

  res.status(200).render('resetPassword' , {
    title : 'Reset Your Password' , 
  })
}
exports.pendingReq = (req, res) => {
  console.log(req.body);
  if (!req.body.email) {
    console.log('hi mom');
  }

  res.status(200).render('pending', {
    title: 'pending',
  });
};

exports.getAccount = (req, res) => {
  console.log('anateexzz', req.user);
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
