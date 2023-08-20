const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { deepStrictEqual } = require('assert');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // this only works on create or save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
  active: { type: Boolean, default: true, select: false },
  verified: { type: Boolean, default: false },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log(this.password);
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  console.log(candidatePassword , userPassword)
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (jwtTimestamp) {
  if (this.passChangedAt) {
    // console.log(this.passChangedAt.getTime() / 1000 > jwtTimestamp);
    return this.passChangedAt.getTime() / 1000 > jwtTimestamp;
  }
  return false;
};
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
