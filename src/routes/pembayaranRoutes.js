const r = require('express').Router();
const c = require('../controllers/pembayaranController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.post('/', auth, allow('karyawan'), c.proses);

module.exports = r;