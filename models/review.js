import mongoose from 'mongoose';
import TourModel from '../models/tour.js';

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is required field'],
    },
    rating: {
      min: 1,
      max: 5,
      required: [true, 'Rating is a required field!'],
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1}, {
  unique: true
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this => model [as it's a static fn]
  const stats = await this.aggregate([
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: '$tour',
        noRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  console.log(stats);

  await TourModel.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].noRatings,
    ratingsQuantity: stats[0].avgRating
  });
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

const ReviewModel = model('Review', reviewSchema);

export default ReviewModel;
