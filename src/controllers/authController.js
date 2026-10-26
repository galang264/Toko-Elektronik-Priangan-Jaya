const AuthService = require('../services/AuthService');

exports.registrasi = async (req, res) => res.status(201).json(await AuthService.registrasi(req.body));
exports.login = async (req, res) => res.json(await AuthService.login(req.body));
exports.lupaPassword = async (req, res) => res.json(await AuthService.lupaPassword(req.body.email));
exports.resetPassword = async (req, res) => {
  await AuthService.resetPassword(req.body.token, req.body.passwordBaru);
  res.json({ message: 'Password berhasil diubah' });
};