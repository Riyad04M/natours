const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../model/tourModel');
const Review = require('./../../model/reviewModel');
const User = require('./../../model/userModel');
const fs = require('fs');

// console.log(process);
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log(`connected to db`);
  });
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
console.log(reviews.length);

const importData = async () => {
  try {
    await Tour.create(tours);
    // await Review.create(reviews);
    // await User.create(users, { validateBeforeSave: false });

    console.log('documents added successfuly');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('Tours deleted successfuly');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
