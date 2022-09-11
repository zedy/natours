import UserModel from '../models/user.js';
import catchAsync from '../utils/errorCatch.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

const cookieOpts = {
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  //secure: true, //only over https
  httpOnly: true
};

const signToken = (id) => {
  return jwt.sign(
    { id },
    'love-me-with-all-ff-your-heart-engelbert-humperdinck',
    {
      expiresIn: '90d',
    }
  );
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Permission denied', 403));
    }

    next();
  };
};

const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const newUser = await UserModel.create({
    name,
    email,
    password,
    confirmPassword,
  });

  const token = signToken(newUser._id);

  res.cookie('jwt', token, cookieOpts);

  res.status(200).json({
    token,
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Missing email or password', 400));
  }

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('incorect pass or email', 404));
  }

  const correct = await user.correctPassword(password, user.password);

  if (!correct) {
    return next(new AppError('incorect pass or email', 401));
  }

  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOpts);

  res.status(200).json({
    status: 'success',
    token,
  });
});

const auth = catchAsync(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('unauthorized access', 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    'love-me-with-all-ff-your-heart-engelbert-humperdinck'
  );
  const user = await UserModel.findById(decoded.id);

  if (!user) {
    return next(new AppError("the token isn't valid anymore"));
  }

  // const pwdChanged = user.changedPwdAfter(decoded.iat);

  // if (!pwdChanged) {
  //   return next(new AppError('please log out and log back in', 401));
  // }

  req.user = user;

  next();
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await UserModel.findOne({ passwordResetToken: hashedToken });

  if (!user) {
    return next(new AppError('No user or bad token', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOpts);

  res.status(200).json({
    token,
    status: 'success',
    data: {
      user,
    },
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:3000/api/user/resetPassword/${resetToken}`;
  const message = `Forgot your password? Click here ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      message,
      subject: 'Password reset',
    });

    res.status(200).json({ status: 'success', message: 'email sent' });
  } catch (e) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Uknown error sending email', 500));
  }
});

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select('+password');

  if (!await user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Password mismatch', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
});

export { updatePassword, signUp, logIn, auth, restrictTo, resetPassword, forgotPassword };
