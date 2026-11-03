const r = require('express').Router();

// Express 5: req.body bisa undefined bila request tanpa body
r.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

r.use('/auth', require('./authRoutes'));
r.use('/users', require('./userRoutes'));
r.use('/produk', require('./produkRoutes'));
r.use('/supplier', require('./supplierRoutes'));
r.use('/pengadaan', require('./pengadaanRoutes'));
r.use('/transaksi', require('./transaksiRoutes'));
r.use('/pembayaran', require('./pembayaranRoutes'));
r.use('/nota', require('./notaRoutes'));
r.use('/garansi', require('./garansiRoutes'));
r.use('/laporan', require('./laporanRoutes'));

module.exports = r;