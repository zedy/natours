import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import TourModel from './models/tour.js';
import ReviewModel from './models/review.js';
import UserModel from './models/user.js';

dotenv.config({ path: './.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected'));

const toursData = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8')
);
const usersData = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);
const reviewsData = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);

const importData = async () => {
  try {
    await TourModel.create(toursData);
    await UserModel.create(usersData, { validateBeforeSave: false });
    await ReviewModel.create(reviewsData);
    console.log('Data imported');
  } catch (e) {
    throw e;
  }
};

const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    await UserModel.deleteMany();
    await ReviewModel.deleteMany();
    console.log('Data deleted');
  } catch (e) {
    throw e;
  }
}

await deleteData();
await importData();