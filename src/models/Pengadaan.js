const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pengadaan = sequelize.define('Pengadaan', {
  ID_pengadaan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal_pesan: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  total_harga: { type: DataTypes.DOUBLE, defaultValue: 0 },
}, { tableName: 'pengadaan' });

const DetailPengadaan = sequelize.define('DetailPengadaan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jumlah: { type: DataTypes.INTEGER, allowNull: false },
  harga_satuan: { type: DataTypes.DOUBLE, allowNull: false },
}, { tableName: 'detail_pengadaan' });

module.exports = Pengadaan;
module.exports.DetailPengadaan = DetailPengadaan;