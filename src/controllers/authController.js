const AuthService = require('../services/AuthService');

exports.registrasi = async (req, res) => {
  const user = await AuthService.registrasi(req.body);
  res.status(201).json({ message: 'Registrasi Berhasil', user });
};

exports.login = async (req, res) => res.json(await AuthService.login(req.body));

exports.lupaPassword = async (req, res) => res.json(await AuthService.lupaPassword(req.body.email));

exports.resetPassword = async (req, res) => {
  await AuthService.resetPassword(req.body.token, req.body.passwordBaru);
  res.json({ message: 'Password berhasil diubah' });
};

// Fitur Logout Baru
exports.logout = (req, res) => {
    try {
        res.clearCookie('token'); 
        return res.status(200).json({ 
            success: true, 
            message: "Berhasil logout." 
        });
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan pada server saat logout." });
    }
};