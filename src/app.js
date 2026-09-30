import express from 'express';
import rateLimit from 'express-rate-limit';
import authorRoutes from './routes/authorRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { createError } from './utils/errors.js';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use(limiter);
app.use(express.json({ limit: '10kb' }));

// Check if body is parsed properly (prevents text/plain causing 500)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return next(createError(res, 400, 'Content-Type must be application/json'));
    }
  }
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Book Management API',
    docs: 'Please refer to the repository README or Postman collection for API documentation.'
  });
});

// Routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
