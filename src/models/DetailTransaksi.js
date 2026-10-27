const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('DetailTransaksi', {
  ID_detail: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jumlah: { type: DataTypes.INTEGER, allowNull: false },
  subtotal: { type: DataTypes.DOUBLE, allowNull: false },
}, { tableName: 'detail_transaksi' });