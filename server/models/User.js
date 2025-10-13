const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed for user:', this.email);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison for user:', this.email, 'Result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

// Add a method to get user info safely
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);