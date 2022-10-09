import mongoose from 'mongoose';
import slugify from 'slugify';
import UserModel from '../models/user.js';

const { Schema, model } = mongoose;

const tourScheme = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Required field'],
      trim: true,
      minLength: 10,
      maxLength: 99,
    },
    rating: {
      type: Number,
      //required: [true, 'Required field'],
    },
    price: {
      type: Number,
      required: [true, 'Required field'],
    },
    duration: {
      type: Number,
      required: [true, 'Required field'],
    },
    maxGroupSize: Number,
    difficulty: {
      type: String,
      required: [true, 'Required field'],
    },
    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5,
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: Number,
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount should be lower than the price',
        validator: function (val) {
          return val < this.price;
        },
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    summary: String,
    description: {
      type: String,
      required: [true, 'Required field'],
      trim: true,
    },
    startDates: [Date],
    imageCover: String,
    images: [String],
    createAt: {
      type: Date,
      required: [true, 'Required field'],
      default: Date.now(),
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    updatedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourScheme.index({ price: 1 });
tourScheme.index({ slug: 1 });

tourScheme.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourScheme.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // on Review model the field which holds the Parents [this] ID
  localField: '_id'
});

// tourScheme.pre('save', async function (next) {
//   if (this.guides === [] || this.guides === '' || this.guides === undefined)
//     next();

//   const guidePromises = this.guides.map(
//     async (id) => await UserModel.findById(id)
//   );
//   const result = await Promise.all(guidePromises);

//   if (result) {
//     this.guides = result;
//   }

//   next();
// });

const TourModel = model('Tour', tourScheme);

export default TourModel;
