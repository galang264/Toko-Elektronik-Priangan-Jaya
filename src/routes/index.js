const r = require('express').Router();

r.use('/auth', require('./authRoutes'));
r.use('/produk', require('./produkRoutes'));
r.use('/supplier', require('./supplierRoutes'));
r.use('/pengadaan', require('./pengadaanRoutes'));
r.use('/transaksi', require('./transaksiRoutes'));
r.use('/pembayaran', require('./pembayaranRoutes'));
r.use('/nota', require('./notaRoutes'));
r.use('/garansi', require('./garansiRoutes'));
r.use('/laporan', require('./laporanRoutes'));

module.exports = r;