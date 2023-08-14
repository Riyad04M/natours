const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const verificationSchema = new mongoose.Schema({
  id: String,
  uniqueString: String,
  createdAt: Date,
  expiresAt: Date,
});

verificationSchema.methods.compareUniqueStr = async function (
  unhashedUniqueStr,
  hashedUniqueStr
) {
  return await bcrypt.compare(unhashedUniqueStr, hashedUniqueStr);
};

verificationSchema.pre('save', async function (next) {
  this.uniqueString = await bcrypt.hash(this.uniqueString, 12);
  next();
});

const UserVerification = mongoose.model('UserVerification', verificationSchema);

module.exports = UserVerification;
