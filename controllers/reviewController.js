import catchAsync from '../utils/errorCatch.js';
import ReviewModel from '../models/review.js';
import { deleteOne, updateOne, getOne } from './handlerFactory.js';

const getAllReviews = catchAsync(async (req, res, next) => {
  let filter;
  const id = req.params.tourId;

  if (id) {
    filter = {
      tour: id
    }
  }

  const reviews = await ReviewModel.find(filter);

	res.status(200).json({
		status: 'success',
		data: {
			reviews
		}
	})
});

const createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params;
  } 
  
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

	const review = await new ReviewModel(req.body);
  review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const deleteReview = deleteOne(ReviewModel);

const updateReview = updateOne(ReviewModel);

const getReview = getOne(ReviewModel);

export { createReview, getAllReviews, deleteReview, updateReview, getReview };
