const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Nota', {
  ID_nota: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal_cetak: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'nota' });