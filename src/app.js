import express from 'express';
import authorRoutes from './routes/authorRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
