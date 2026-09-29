import express from 'express';

const app = express();

// Middleware
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Book & Author REST API' });
});

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

export default app;
