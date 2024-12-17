const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const servicesRouter = require('./routes/services');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/skillsupply', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/users', usersRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});