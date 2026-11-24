
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const HttpError = require('../utils/HttpError');

const ATTR = [
  'ID_user',
  'nama',
  'email',
  'username',
  'role',
  'createdAt'
];

const ALLOWED_ROLES = ['owner', 'karyawan', 'pelanggan'];

// =====================================
// MEMBUAT AKUN KARYAWAN
// HANYA OWNER
// =====================================

exports.buat = async (pembuat, data = {}) => {
  if (!pembuat || pembuat.role !== 'owner') {
    throw new HttpError('Hanya Owner yang dapat mengelola akun', 403);
  }

  const { nama, email, username, password, role } = data;

  // Owner hanya dapat membuat akun Karyawan.
  if (role !== 'karyawan') {
    throw new HttpError(
      'Owner hanya dapat membuat akun Karyawan',
      400
    );
  }

  // Validasi nama
  if (
    typeof nama !== 'string' ||
    nama.trim().length < 3
  ) {
    throw new HttpError('Nama minimal 3 karakter', 400);
  }

  // Validasi email
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new HttpError('Format email tidak valid', 400);
  }

  // Validasi username
  if (
    typeof username !== 'string' ||
    !/^[a-zA-Z0-9_]{4,20}$/.test(username.trim())
  ) {
    throw new HttpError(
      'Username 4-20 karakter (huruf, angka, underscore)',
      400
    );
  }

  // Validasi password
  if (
    typeof password !== 'string' ||
    password.length < 6
  ) {
    throw new HttpError('Password minimal 6 karakter', 400);
  }

  const namaBersih = nama.trim();
  const emailBersih = email.trim().toLowerCase();
  const usernameBersih = username.trim();

  // Cek duplikasi email dan username
  const ada = await User.findOne({
    where: {
      [Op.or]: [
        { username: usernameBersih },
        { email: emailBersih }
      ]
    }
  });

  if (ada) {
    throw new HttpError('User sudah terdaftar', 409);
  }

  try {
    const user = await User.create({
      nama: namaBersih,
      email: emailBersih,
      username: usernameBersih,
      password: await bcrypt.hash(password, 10),
      role: 'karyawan'
    });

    return {
      ID_user: user.ID_user,
      nama: user.nama,
      username: user.username,
      role: user.role
    };

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new HttpError('User sudah terdaftar', 409);
    }

    console.error('Gagal membuat akun Karyawan:', error.message);

    throw new HttpError('Tidak dapat menyimpan data pengguna', 500);
  }
};

// =====================================
// DAFTAR PENGGUNA
// HANYA OWNER
// =====================================

exports.daftar = async (user, role) => {
  if (!user || user.role !== 'owner') {
    throw new HttpError('Hanya Owner yang dapat melihat data pengguna', 403);
  }

  let where = {};

  if (role) {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new HttpError('Role tidak valid', 400);
    }

    where.role = role;
  }

  return User.findAll({
    where,
    attributes: ATTR,
    order: [['ID_user', 'ASC']]
  });
};
