const express = require('express');
const cors = require('cors');
require('dotenv').config();

const setupDatabase = require('./setup/database');

const authRoutes = require('./routes/auth');
const influencerRoutes = require('./routes/influencers');
const companyRoutes = require('./routes/companies');

const app = express();


app.use(cors());
app.use(express.json());


setupDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/companies', companyRoutes);


app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});