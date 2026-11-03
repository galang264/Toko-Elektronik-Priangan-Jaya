const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const HttpError = require('../utils/HttpError');

const ATTR = ['ID_user', 'nama', 'email', 'username', 'role', 'createdAt'];

exports.buat = async (pembuat, { nama, email, username, password, role }) => {
  const boleh = pembuat.role === 'owner' ? ['karyawan', 'owner', 'pelanggan'] : ['pelanggan'];
  if (!boleh.includes(role)) throw new HttpError(`Role harus salah satu dari: ${boleh.join(', ')}`);
  if (typeof nama !== 'string' || nama.trim().length < 3) throw new HttpError('Nama minimal 3 karakter');
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError('Format email tidak valid');
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{4,20}$/.test(username)) throw new HttpError('Username 4-20 karakter (huruf, angka, _)');
  if (typeof password !== 'string' || password.length < 6) throw new HttpError('Password minimal 6 karakter');

  const ada = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
  if (ada) throw new HttpError('User sudah terdaftar', 409);

  const user = await User.create({
    nama: nama.trim(), email, username, role,
    password: await bcrypt.hash(password, 10),
  });
  return { ID_user: user.ID_user, nama: user.nama, username: user.username, role: user.role };
};

// owner boleh filter semua role, karyawan hanya melihat pelanggan
exports.daftar = (user, role) => {
  const filter = user.role === 'karyawan' ? 'pelanggan' : role;
  return User.findAll({
    where: filter ? { role: filter } : {},
    attributes: ATTR,
    order: [['ID_user', 'ASC']],
  });
};