
const r = require('express').Router();

const c = require('../controllers/userController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth);

// Hanya Owner yang dapat membuat akun Karyawan
r.post('/', allow('owner'), c.buat);

// Hanya Owner yang dapat melihat data pengguna
r.get('/', allow('owner'), c.daftar);

module.exports = r;
