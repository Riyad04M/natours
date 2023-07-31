const AppError = require('../Ulti/appError');

const handleInvalidIdErr = (err) => {
  const message = `NO tour found with the id : ${err.value}`;
  return new AppError(message, 404);
};
const handleDuplicatePropsErr = (err) => {
  console.log(err);
  console.log(err.keyValue.name);
  const message = err.keyValue.name
    ? err.keyValue.name
    : err.keyValue.email + ' already exists!';
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      errStack: err.stack,
    });
  }
  console.log(err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err,req , res) => {
  // Operational, trusted error : send message to client
  console.log(req.originalUrl);
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        messageExist: err.messageExist,
        status: err.status,
        message: err.message,
      });
      // programming or other unkown error : don't leak error details
    }
    // console.error('💥Error', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong💥',
    });
  }
  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req ,res);
  else {
    if (err.name === 'CastError') err = handleInvalidIdErr(err);
    if (err.code === 11000) err = handleDuplicatePropsErr(err);
    if (err.name === 'ValidationError') err = new AppError(err.message, 400);
    if (err.name === 'JsonWebTokenError')
      err = new AppError('Invalid token! please login to get access', 401);
    if (err.name === 'TokenExpiredError')
      err = new AppError('Token has Expired! please login again', 401);

    sendErrorProd(err,req , res);
  }
};
