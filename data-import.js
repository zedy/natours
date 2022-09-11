import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import TourModel from './models/tour.js';

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

const importData = async () => {
  try {
    await TourModel.create(toursData);
    console.log('Data imported');
  } catch (e) {
    throw e;
  }
};

const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    console.log('Data deleted');
  } catch (e) {
    throw e;
  }
}

await deleteData();
await importData();