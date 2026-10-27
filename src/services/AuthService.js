const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const HttpError = require('../utils/HttpError');

exports.registrasi = async ({ nama, email, username, password, role }) => {
  if (!password) throw new HttpError('Password wajib diisi');
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ nama, email, username, password: hash, role });
  return { ID_user: user.ID_user, nama: user.nama, username: user.username, role: user.role };
};

exports.login = async ({ username, password }) => {
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new HttpError('Username atau password salah', 401);
  const token = jwt.sign({ id: user.ID_user, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { token, user: { ID_user: user.ID_user, nama: user.nama, role: user.role } };
};

exports.lupaPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new HttpError('Email tidak ditemukan', 404);
  const token = crypto.randomBytes(20).toString('hex');
  await user.update({ resetToken: token, resetExpire: new Date(Date.now() + 3600 * 1000) });
  return { resetToken: token };
};

exports.resetPassword = async (token, passwordBaru) => {
  const user = await User.findOne({ where: { resetToken: token, resetExpire: { [Op.gt]: new Date() } } });
  if (!user) throw new HttpError('Token tidak valid / kadaluarsa');
  await user.update({ password: await bcrypt.hash(passwordBaru, 10), resetToken: null, resetExpire: null });
};