import express from 'express';
import authorRoutes from './routes/authorRoutes.js';
import bookRoutes from './routes/bookRoutes.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Book & Author REST API' });
});

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

export default app;
