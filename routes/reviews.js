import express from 'express';
import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
} from '../controllers/reviewController.js';
import { auth, restrictTo } from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(auth, restrictTo('user'), createReview);

router
  .route('/:id')
  .patch(updateReview)
  .delete(auth, restrictTo('admin'), deleteReview);

export default router;
