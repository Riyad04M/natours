const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./Ulti/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const errorController = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) global middlewares

// seting security http headers
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],

//       fontSrc: ["'self'", 'https:', 'data:'],

//       scriptSrc: ["'self'", 'unsafe-inline'],

//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],

//       scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

//       styleSrc: ["'self'", 'https:', 'unsafe-inline'],

//       connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
//     },
//   })
// );

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same API

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request please try again in an hour',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
// and limiting the amout of data that coming from the body

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// prefect place for doing data santization
// because we need to cleant the inputs after pasing the data from the body

// data sanitization aginst noSQL query injection
app.use(mongoSanitize());

// data sanitization aginst XSS atatcks
app.use(xss());

// preventing http parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serving statics files
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// app.all('*', (req, res, next) => {
//   res.status(404).json({
//     status: 'fail',
//     message: `can't find ${req.originalUrl} on this server`,
//   });
// });

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });
  
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);
module.exports = app;
