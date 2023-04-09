const mongoose = require('mongoose');
const {Schema } = mongoose;
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
  });
  
  const User = mongoose.model('User', userSchema);
  
  const saveVerificationToken = async (email, token) => {
    const user = await User.findOne({ email });
    user.verificationToken = token;
    await user.save();
  };
module.exports = mongoose.model('user',userSchema);