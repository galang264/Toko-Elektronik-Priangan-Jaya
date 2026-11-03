const path = require('path');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => res.redirect('/login.html'));
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;