const r = require('express').Router();
const c = require('../controllers/authController');

r.post('/register', c.registrasi);
r.post('/login', c.login);
r.post('/lupa-password', c.lupaPassword);
r.post('/reset-password', c.resetPassword);

module.exports = r;

// Impor controller di atas jika belum
const authController = require('../controllers/authController');

// Tambahkan rute POST
router.post('/logout', authController.logout);