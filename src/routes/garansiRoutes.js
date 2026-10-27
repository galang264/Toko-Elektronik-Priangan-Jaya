const r = require('express').Router();
const c = require('../controllers/garansiController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth);
r.post('/', allow('pelanggan'), c.ajukan);
r.patch('/:id/klaim', allow('karyawan'), c.klaim);

module.exports = r;