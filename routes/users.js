import express from 'express';
import {
  auth,
  updatePassword,
  signUp,
  logIn,
  resetPassword,
  forgotPassword,
  restrictTo,
} from '../controllers/authController.js';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getUser
} from '../controllers/userController.js';

const router = express.Router();

router.get('/user/:id', getUser);
router.post('/user/signup', signUp);
router.post('/user/login', logIn);
router.post('/user/forgotPassword', forgotPassword);
router.patch('/user/resetPassword/:token', resetPassword);

// middleware
// add auth to all remaining routes
router.use(auth);

router.patch('/user/updatePassword', updatePassword);
router.patch('/user/updateUser', updateUser);

// middleware
// add role protection
router.use(restrictTo('admin'));

router.delete('/user/deleteUser', deleteUser);
router.route('/users').get(getAllUsers);

export default router;
