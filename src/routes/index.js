const r = require('express').Router();

r.use('/auth', require('./authRoutes'));
r.use('/produk', require('./produkRoutes'));

module.exports = r;