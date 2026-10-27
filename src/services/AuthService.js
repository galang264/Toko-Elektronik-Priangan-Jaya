const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const HttpError = require('../utils/HttpError');
const { kirimEmail } = require('../utils/mailer');

// validasiRegistrasi(): cek format semua field
const formatValid = ({ nama, email, username, password }) =>
  typeof nama === 'string' && nama.trim().length >= 3 &&
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
  typeof username === 'string' && /^[a-zA-Z0-9_]{4,20}$/.test(username) &&
  typeof password === 'string' && password.length >= 6;

exports.registrasi = async (data) => {
  if (!formatValid(data)) throw new HttpError('Format Tidak Valid', 400);
  const { nama, email, username, password } = data;

  // cekUserSudahAda()
  const ada = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
  if (ada) throw new HttpError('User sudah terdaftar', 409);

  // simpanDataUser()
  try {
    const user = await User.create({
      nama: nama.trim(), email, username,
      password: await bcrypt.hash(password, 10),
      role: 'pelanggan', // registrasi publik selalu menjadi pelanggan
    });
    return { ID_user: user.ID_user, nama: user.nama, username: user.username, role: user.role };
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') throw new HttpError('User sudah terdaftar', 409);
    console.error(e.message);
    throw new HttpError('Tidak Dapat Menyimpan Data', 500);
  }
};

exports.login = async ({ username, password }) => {
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new HttpError('Username/Password Salah', 401);
  const token = jwt.sign({ id: user.ID_user, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { token, user: { ID_user: user.ID_user, nama: user.nama, role: user.role } };
};

exports.lupaPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new HttpError('Email tidak ditemukan', 404);
  const token = crypto.randomBytes(20).toString('hex');
  await user.update({ resetToken: token, resetExpire: new Date(Date.now() + 3600 * 1000) });

  // kirimLinkReset(): link dikirim ke email user
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password.html?token=${token}`;
  await kirimEmail({
    to: user.email,
    subject: 'Reset Password - Toko Elektronik Priangan Jaya',
    text: `Halo ${user.nama}, buka link berikut untuk mengatur ulang password (berlaku 1 jam): ${link}`,
    html: `<p>Halo ${user.nama},</p><p>Klik link berikut untuk mengatur ulang password (berlaku 1 jam):</p><p><a href="${link}">${link}</a></p>`,
  });
  return { message: 'Link reset password telah dikirim ke email' };
};

exports.resetPassword = async (token, passwordBaru) => {
  const user = await User.findOne({ where: { resetToken: token, resetExpire: { [Op.gt]: new Date() } } });
  if (!user) throw new HttpError('Token tidak valid / kadaluarsa');
  await user.update({ password: await bcrypt.hash(passwordBaru, 10), resetToken: null, resetExpire: null });
};