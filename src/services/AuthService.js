
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

const { User } = require('../models');
const HttpError = require('../utils/HttpError');
const { kirimEmail } = require('../utils/mailer');

const ALLOWED_ROLES = ['owner', 'karyawan', 'pelanggan'];

// =====================================
// VALIDASI REGISTRASI
// =====================================

const formatValid = ({ nama, email, username, password }) =>
  typeof nama === 'string' &&
  nama.trim().length >= 3 &&

  typeof email === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&

  typeof username === 'string' &&
  /^[a-zA-Z0-9_]{4,20}$/.test(username.trim()) &&

  typeof password === 'string' &&
  password.length >= 6;

// =====================================
// REGISTRASI PELANGGAN
// =====================================

exports.registrasi = async (data) => {
  if (!formatValid(data || {})) {
    throw new HttpError('Format Tidak Valid', 400);
  }

  const nama = data.nama.trim();
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim();
  const password = data.password;

  const ada = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email }
      ]
    }
  });

  if (ada) {
    throw new HttpError('User sudah terdaftar', 409);
  }

  try {
    const user = await User.create({
      nama,
      email,
      username,
      password: await bcrypt.hash(password, 10),
      role: 'pelanggan'
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

    console.error('Registrasi gagal:', error.message);

    throw new HttpError('Tidak Dapat Menyimpan Data', 500);
  }
};

// =====================================
// LOGIN
// =====================================

exports.login = async ({ username, password } = {}) => {
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    throw new HttpError('Username dan password wajib diisi', 400);
  }

  if (!process.env.JWT_SECRET) {
    throw new HttpError('Konfigurasi JWT_SECRET belum tersedia', 500);
  }

  const user = await User.findOne({
    where: {
      username: username.trim()
    }
  });

  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    throw new HttpError('Username/Password Salah', 401);
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    throw new HttpError('Role pengguna tidak valid', 403);
  }

  const token = jwt.sign(
    {
      id: user.ID_user,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  return {
    token,
    user: {
      ID_user: user.ID_user,
      nama: user.nama,
      username: user.username,
      role: user.role
    }
  };
};

// =====================================
// LUPA PASSWORD
// =====================================

exports.lupaPassword = async (email) => {
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new HttpError('Format email tidak valid', 400);
  }

  const user = await User.findOne({
    where: {
      email: email.trim().toLowerCase()
    }
  });

  if (!user) {
    throw new HttpError('Email tidak ditemukan', 404);
  }

  const token = crypto.randomBytes(32).toString('hex');

  await user.update({
    resetToken: token,
    resetExpire: new Date(Date.now() + 60 * 60 * 1000)
  });

  const appUrl = (
    process.env.APP_URL || 'http://localhost:3000'
  ).replace(/\/+$/, '');

  const link = `${appUrl}/reset-password.html?token=${token}`;

  await kirimEmail({
    to: user.email,

    subject: 'Reset Password - Toko Elektronik Priangan Jaya',

    text:
      `Halo ${user.nama}, buka link berikut untuk mengatur ulang ` +
      `password (berlaku 1 jam): ${link}`,

    html: `
      <p>Halo ${user.nama},</p>
      <p>
        Klik link berikut untuk mengatur ulang password.
        Link berlaku selama 1 jam.
      </p>
      <p>
        <a href="${link}">Reset Password</a>
      </p>
    `
  });

  return {
    message: 'Link reset password telah dikirim ke email'
  };
};

// =====================================
// RESET PASSWORD
// =====================================

exports.resetPassword = async (token, passwordBaru) => {
  if (
    typeof token !== 'string' ||
    !token.trim()
  ) {
    throw new HttpError('Token tidak valid', 400);
  }

  if (
    typeof passwordBaru !== 'string' ||
    passwordBaru.length < 6
  ) {
    throw new HttpError('Password minimal 6 karakter', 400);
  }

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetExpire: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    throw new HttpError('Token tidak valid atau kadaluarsa', 400);
  }

  await user.update({
    password: await bcrypt.hash(passwordBaru, 10),
    resetToken: null,
    resetExpire: null
  });

  return {
    message: 'Password berhasil diubah'
  };
};
