const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError('Token tidak ada', 401);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    throw new HttpError('Token tidak valid', 401);
  }
};