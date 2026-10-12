import express from 'express';
import rateLimit from 'express-rate-limit';
import authorRoutes from './routes/authorRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './utils/errors.js';
import cors from 'cors';

const app = express();
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use(limiter);
app.use(express.json({ limit: '10kb' }));

// Validate Content-Type header for requests with body (POST, PUT), exempting multipart upload
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    if (req.path.startsWith('/upload') && req.is('multipart/form-data')) {
      return next();
    }
    if (!req.is('application/json')) {
      return next(new AppError('Content-Type must be application/json', 400));
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
app.use('/upload', uploadRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
