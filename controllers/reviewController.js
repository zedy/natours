import AppError from '../utils/appError.js';
import catchAsync from '../utils/errorCatch.js';
import ReviewModel from '../models/review.js';

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await ReviewModel.find();

	res.status(200).json({
		status: 'success',
		data: {
			reviews
		}
	})
});

const createReview = catchAsync(async (req, res, next) => {
	const review = await new ReviewModel(req.body);
  review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export { createReview, getAllReviews };
