import Author from '../models/authorModel.js';

// GET /authors
export const getAuthors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Author.countDocuments();
    const authors = await Author.find().skip(startIndex).limit(limit);

    res.status(200).json({
      success: true,
      count: authors.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: authors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /authors
export const createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /authors/:id
export const updateAuthor = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Author ID format' });
    }

    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    res.status(200).json({ success: true, data: author });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// DELETE /authors/:id
export const deleteAuthor = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Author ID format' });
    }

    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
