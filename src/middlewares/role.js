const HttpError = require('../utils/HttpError');

module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new HttpError('Akses ditolak', 403);
  next();
};