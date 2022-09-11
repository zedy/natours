import express from 'express';
import {
  getMonthlyPlan,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
} from '../controllers/toursController.js';
import { auth, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// // middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.param('id', (req, res, next, val) => {
  console.log(`id is ${val}`);
  next();
});

router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/tours/stats').get(getTourStats);

router.route('/tours')
  .get(auth, getAllTours)
  .post(createTour);

router.route('/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(auth, restrictTo('admin'), deleteTour);

export default router;
