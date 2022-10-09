// models
import TourModel from '../models/tour.js';
import catchAsync from '../utils/errorCatch.js';
import { deleteOne, updateOne, getOne } from './handlerFactory.js';
import AppError from '../utils/appError.js';

const getAllTours = catchAsync(async (req, res) => {
  const query = req.query;
  const queryObj = { ...query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];

  excludedFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let toursQuery = TourModel.find(JSON.parse(queryStr));

  if (query.sort) {
    const sortBy = query.sort.split(',').join(' ');
    toursQuery = toursQuery.sort(query.sort);
  } else {
    toursQuery = toursQuery.sort('-createdAt');
  }

  if (query.fields) {
    const fields = query.fields.split(',').join(' ');
    toursQuery = toursQuery.select(fields);
  }

  const page = query.page * 1 || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  toursQuery.skip(skip).limit(limit);

  const tours = await toursQuery;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getTour = getOne(TourModel, { path: 'reviews' });

const updateTour = updateOne(TourModel);

const deleteTour = deleteOne(TourModel);

const createTour = catchAsync(async (req, res) => {
  const tour = await new TourModel(req.body);
  tour.save();

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const getTourStats = catchAsync(async (req, res) => {
  const stats = await TourModel.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.7 },
      },
    },
    {
      $group: {
        _id: null,
        avgRtng: { $avg: '$ratingsAverage' },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res) => {
  const { year } = req.params;

  const plan = await TourModel.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

const getToursNearby = catchAsync(async (req, res, next) => {
  const { distance, latitude, longitude } = req.body;

  if (!distance || !latitude || !longitude) {
    next(new AppError('Missing distance or geoSpec data', 400));
  }

  // geoLoc math stuff
  const rad = distance / 6378.1;

  const tour = await TourModel.find({
    startLocation: { $geoWithin: { $centerSphere: [[longitude, latitude], rad] } },
  });

  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

export {
  getMonthlyPlan,
  getTourStats,
  deleteTour,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  getToursNearby,
};
