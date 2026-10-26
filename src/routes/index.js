const r = require('express').Router();

r.use('/auth', require('./authRoutes'));
r.use('/produk', require('./produkRoutes'));
r.use('/supplier', require('./supplierRoutes'));
r.use('/pengadaan', require('./pengadaanRoutes'));
r.use('/transaksi', require('./transaksiRoutes'));

module.exports = r;