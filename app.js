//libs
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import tours from './routes/tours.js';
import users from './routes/users.js';
import reviews from './routes/reviews.js'
import AppError from './utils/appError.js';
import helmet from 'helmet';

// consts
const app = express();

// middleware
app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1h
  message: 'Too many requests! 1h timeout.'
});
app.use('/api', limiter);
app.use(morgan('dev')); // simple logger
app.use(express.json());

app.use((req, res, next) => {
  console.log('middleware test');
  next();  
});

// routes
app.use('/api/tours', tours);
app.use('/api', users);
app.use('/api/reviews', reviews);

app.all('*', (req, res, next) => {
  next(new AppError('Oh oh 404', 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
});

export default app;