
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');

const ALLOWED_ROLES = ['owner', 'karyawan', 'pelanggan'];

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : null;

  if (!token) {
    return next(new HttpError('Token tidak ada', 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new HttpError('Konfigurasi JWT_SECRET belum tersedia', 500));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new HttpError('Token tidak valid atau sudah kedaluwarsa', 401));
  }

  if (
    !decoded ||
    !decoded.id ||
    !ALLOWED_ROLES.includes(decoded.role)
  ) {
    return next(new HttpError('Identitas atau role pengguna tidak valid', 403));
  }

  req.user = {
    id: decoded.id,
    role: decoded.role
  };

  next();
};
