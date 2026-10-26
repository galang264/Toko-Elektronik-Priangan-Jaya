const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Laporan', {
  ID_laporan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jenis_laporan: { type: DataTypes.ENUM('penjualan', 'stok'), allowNull: false },
  periode: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'laporan' });