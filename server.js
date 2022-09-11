import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config({ path: './.env'});

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

//server
const port = 3000;
app.listen(port, () => {
  console.log('Server started');
});