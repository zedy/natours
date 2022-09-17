import UserModel from '../models/user.js';
import catchAsync from '../utils/errorCatch.js';
import AppError from '../utils/appError.js';

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const opts = {
    new: true,
    runValidators: true
  };
  const data = Object.keys(req.body)
    .filter(key => key === 'name' || key === 'email')
    .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
  }, {});
  const user = await UserModel.findByIdAndUpdate(req.user.id, data, opts);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const data = {
    active: false
  };

  await UserModel.findByIdAndUpdate(req.user.id, data);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export { getAllUsers, updateUser, deleteUser };