import express from 'express';
import {
  getMonthlyPlan,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getToursNearby,
  getTourStats,
} from '../controllers/toursController.js';
import { auth, restrictTo } from '../controllers/authController.js';
import reviewRouter from '../routes/reviews.js';

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// // middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

// router.param('id', (req, res, next, val) => {
//   console.log(`id is ${val}`);
//   next();
// });

router.route('/tours-nearby').get(getToursNearby);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/stats').get(getTourStats);

router.route('/').get(getAllTours).post(auth, restrictTo('admin'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(auth, restrictTo('admin'), updateTour)
  .delete(auth, restrictTo('admin'), deleteTour);


export default router;
