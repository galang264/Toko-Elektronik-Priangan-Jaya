const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Produk', {
  ID_produk: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_produk: { type: DataTypes.STRING, allowNull: false },
  kategori: DataTypes.STRING,
  harga: { type: DataTypes.DOUBLE, allowNull: false },
  stok: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'produk' });