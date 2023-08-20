const User = require('./../model/userModel');
const UserVerification = require('./../model/userVerification');
const catchAsync = require('../Ulti/catchAsync');
const AppError = require('../Ulti/appError');
const Email = require('../Ulti/email');
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.nextTick.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  if (!user.verified) {
    user.verified = true;
    user
      .save({ validateBeforeSave: false })
      .then(() => {
        return res.status(200).render('verified', {
          title: 'Welcome to Natours',
          token,
          user,
        });
      })
      .catch((err) => {
        console.log('ana 7mar');
        console.log(err.stack);
        console.log(err.message);
      });
  } else {
    res.status(statusCode).json({
      status: 'success',
      token,
      user,
    });
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    verified: false,
  });
  const uniqueString = uuidv4() + newUser._id;

  await UserVerification.create({
    id: newUser._id,
    uniqueString,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 3,
  });

  const Url = `${req.protocol}://${req.get('host')}/verifyEmail/${
    newUser._id
  }/${uniqueString}`;

  await new Email(newUser, Url).verifyEmail();
  res.status(200).json({
    status: 'pending',
    message: 'Verify Your Email',
    user: newUser._id,
  });
  // createSendToken(newUser, 201, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  // getting id and uniStr from params
  // getting user
  // getting userVer by the id passed if not found
  // unvalid id passed return error
  //  checking for exipring time
  //  if its expired
  // ***  we delete both user and verUser from db
  // validat the uniStr if its valid we set the user verifed to true and assign a token and delete the userVer
  // if not we repeat step ***
  const { id, uniqueString } = req.params;
  const userVerification = await UserVerification.findOne({ id });
  const user = await User.findOne({ _id: id });
  if (!userVerification && user) {
    return next(new AppError('You already verified Your Account', 409));
    // return res.status(200).json({
    //   status: 'success',
    //   message: 'you are signed In now welcome to our App',
    // });
  }

  if (!userVerification) {
    next(new AppError('Invalid User Id. Not found', 404));
  }
  if (Date.now() > userVerification.expiresAt) {
    await UserVerification.findOneAndDelete({ id });
    await User.findOneAndDelete({ _id: id });
    return next(
      new AppError('link has expired. please try signing up again', 410)
    );
  }
  if (
    !(await userVerification.compareUniqueStr(
      uniqueString,
      userVerification.uniqueString
    ))
  ) {
    await UserVerification.findOneAndDelete({ id });
    await User.findOneAndDelete({ _id: id });
    return next(
      new AppError('unvalid Token. please try signing up again', 401)
    );
  }
  // user.verified = true;
  // await user.save({ validateBeforeSave: false });
  await userVerification.deleteOne({ id });
  const Url = `${req.protocol}://${req.get('host')}/Me`;
  await new Email(user, Url).sendWelcome();
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('enter your email and password', 400));
  ///
  console.log(email);
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('incorrect email or password', 401));
  }

  if (!user?.verified) {
    await UserVerification.findOneAndDelete({ id: user._id });
    await User.findOneAndDelete({ _id: user._id });
    return next(
      new AppError(
        " You havn't verified your email. please sign up again ",
        401
      )
    );
  }
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('incorrect email or password', 401));

  createSendToken(user, 200, res);
});
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) getting token and check if it's there
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    console.log(` yeah i am here`);
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are not logged in! please log in to get access', 401)
    );

  // console.log(token);

  // 2) Token Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) check if user still exists

  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(new AppError('User no longer exists! please login again', 401));

  // 4) check if user changed password after the token was issued
  if (freshUser.changedPassword(decoded.iat)) {
    return next(
      new AppError('Your password has been changed! Please login again', 401)
    );
  }
  // Grant access to protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  console.log(req.user);
  // console.log(req.user);
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  console.log('didnt make it  i guess');
  console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued

      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }
      console.log(`almost there`);

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      console.log(`hi its me rdrd i got to this point`, res.locals);

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `You don't have the permission to perform this action`,
          403
        )
      );
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get the user by his email and check their existance

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('there is no user with that email', 404));

  if (!user.verified) {
    await UserVerification.findOneAndDelete({ id: user._id });
    await User.findOneAndDelete({ _id: user._id });
    return next(
      new AppError(
        " You havn't verified your email. please sign up again ",
        401
      )
    );
  }

  // 2) create token to reset the password
  console.log('*********************************************');
  const token = user.createResetToken();
  console.log(token);
  await user.save({ validateBeforeSave: false });

  // 3) reset URL

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/resetPassword/${token}`;
  const resetURLAPI = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${token}`;

  try {
    // await sendEmail({
    //   email: req.body.email,
    //   subject: 'Your passwrd rest token  (valid for only 10 mins)',
    //   message,
    // });

    await new Email(user, resetURL, resetURLAPI).sendResetPass();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      // resetURL,
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('unexpected error please try again ', 500));
  }
});
exports.validateResetToken = catchAsync(async (req, res, next) => {
  const crtptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: crtptedToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new AppError('Invalid or expired token please try again ', 400)
    );
  req.user = user;
  next();
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) gettin token and hashing it
  // 2) gettin the user via the hashed token and check for existance and expires token date

  // const crtptedToken = crypto
  //   .createHash('sha256')
  //   .update(req.params.token)
  //   .digest('hex');

  // const user = await User.findOne({
  //   resetPasswordToken: crtptedToken,
  //   resetPasswordTokenExpires: { $gt: Date.now() },
  // });

  // if (!user)
  //   return next(
  //     new AppError('Invalid or expired token please try again ', 400)
  //   );

  // 3 ) update the new password AND save it
  // await validateResetToken(req, res, next);

  const crtptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: crtptedToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new AppError('Invalid or expired token please try again ', 400)
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const cryptedPass = user.password;
  console.log(req.body.oldPassword, user.password);
  //
  console.log(
    !(await user.correctPassword(req.body.oldPassword, user.password))
  );
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('Your current password is wrong ', 401));
  }
  //
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
