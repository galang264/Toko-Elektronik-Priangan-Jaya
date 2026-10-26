const r = require('express').Router();
const c = require('../controllers/notaController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.post('/:transaksiId', auth, allow('karyawan'), c.cetak);

module.exports = r;