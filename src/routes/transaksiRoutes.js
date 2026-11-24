const r = require('express').Router();
const c = require('../controllers/transaksiController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth);

// Karyawan dan pelanggan boleh membuat transaksi
r.post('/', allow('karyawan', 'pelanggan'), c.buat);

// Pelanggan hanya melihat transaksinya sendiri.
// Karyawan dan owner dapat melihat seluruh transaksi.
r.get('/', allow('pelanggan', 'karyawan', 'owner'), c.daftar);

r.get('/:id/status', allow('pelanggan', 'karyawan', 'owner'), c.lihatStatus);

module.exports = r;