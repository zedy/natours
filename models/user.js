import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Err msg palceholder']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      message: 'Passwords do not match',
      validator: function(value) {
        return value === this.password
      }
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre(/^find/, function(next) {
  this.find({active: { $ne: false }});
  next();
});

// turn off this hook when importing users
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// turn off this hook when importing users
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
  }
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPwdAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const time = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return jwtTimestamp < time;
  } 

  return false;
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 600 * 1000;

  return resetToken;
}

const UserModel = model('User', userSchema);

export default UserModel;