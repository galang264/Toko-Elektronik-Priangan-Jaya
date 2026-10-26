const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Garansi', {
  ID_garansi: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_akhir: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('aktif', 'diklaim', 'kadaluarsa'), defaultValue: 'aktif' },
}, { tableName: 'garansi' });