require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const studentApplicationRoutes = require('./routes/studentApplicationRoutes');
const studentPortalRoutes = require('./routes/studentPortalRoutes');
const { UPLOAD_ROOT } = require('./controllers/studentUploadController');

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Documents uploaded from the student portal. File names are random and
// unguessable; see CHANGES.md before using this in production.
app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
    },
  })
);

app.use('/api/admin', authRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/student', studentPortalRoutes);
app.use('/api/student', studentApplicationRoutes);
app.use('/api', applicationRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Scholarship admin API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
