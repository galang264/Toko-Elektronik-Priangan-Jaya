const r = require('express').Router();

r.use('/auth', require('./authRoutes'));

module.exports = r;