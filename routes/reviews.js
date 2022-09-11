import express from 'express';
import {
  getAllReviews,
  createReview,
} from '../controllers/reviewController.js';
import { auth, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/reviews')
  .get(getAllReviews)
  .post(auth, restrictTo('user'), createReview);

export default router;
