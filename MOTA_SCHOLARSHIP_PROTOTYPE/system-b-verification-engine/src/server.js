require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static developer/demo dashboard (Section 13)
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes (Section 11)
app.use('/api', apiRoutes);

// Fallback index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server if not imported
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` System B: AI-Assisted Scholarship Verification Engine`);
    console.log(` Ministry of Tribal Affairs (MoTA) Prototype`);
    console.log(`----------------------------------------------------`);
    console.log(` REST API Base: http://localhost:${PORT}/api`);
    console.log(` Health Check : http://localhost:${PORT}/api/health`);
    console.log(` Test UI      : http://localhost:${PORT}/`);
    console.log(` Decision Rule: Non-autonomous AI; Final officer sign-off`);
    console.log(`====================================================`);
  });
}

module.exports = app;
