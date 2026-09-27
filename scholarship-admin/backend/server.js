require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const studentApplicationRoutes = require('./routes/studentApplicationRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin', authRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/student', studentApplicationRoutes);
app.use('/api', applicationRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Scholarship admin API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
