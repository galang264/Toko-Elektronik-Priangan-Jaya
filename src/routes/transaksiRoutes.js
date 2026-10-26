const r = require('express').Router();
const c = require('../controllers/transaksiController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth);
r.post('/', allow('karyawan'), c.buat);
r.get('/:id/status', allow('pelanggan', 'karyawan', 'owner'), c.lihatStatus);

module.exports = r;