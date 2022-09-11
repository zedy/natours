import express from 'express';
import { auth, updatePassword, signUp, logIn, resetPassword, forgotPassword } from '../controllers/authController.js';
import { getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// // middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.post('/user/signup', signUp);
router.post('/user/login', logIn);
router.post('/user/forgotPassword', forgotPassword);
router.patch('/user/resetPassword/:token', resetPassword);
router.patch('/user/updatePassword', auth, updatePassword);
router.patch('/user/updateUser', auth, updateUser);
router.delete('/user/deleteUser', auth, deleteUser);

router.route('/users')
  .get(getAllUsers);

export default router;