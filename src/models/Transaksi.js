const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Transaksi', {
  ID_transaksi: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total_harga: { type: DataTypes.DOUBLE, defaultValue: 0 },
  status: { type: DataTypes.ENUM('pending', 'lunas', 'batal'), defaultValue: 'pending' },
}, { tableName: 'transaksi' });