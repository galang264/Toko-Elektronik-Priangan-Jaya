const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Pembayaran', {
  ID_pembayaran: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  metode_pembayaran: { type: DataTypes.STRING, allowNull: false },
  tanggal_bayar: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  jumlah_bayar: { type: DataTypes.DOUBLE, allowNull: false },
}, { tableName: 'pembayaran' });