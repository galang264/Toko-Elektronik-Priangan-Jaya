const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('User', {
  ID_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('owner', 'karyawan', 'pelanggan'), defaultValue: 'pelanggan' },
  resetToken: DataTypes.STRING,
  resetExpire: DataTypes.DATE,
}, { tableName: 'users' });