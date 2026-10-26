const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Supplier', {
  ID_supplier: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_supplier: { type: DataTypes.STRING, allowNull: false },
  kontak: DataTypes.STRING,
}, { tableName: 'supplier' });