import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  interests: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  adjacencyExpansion: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  targetIndustry: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  functionType: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  targetSegment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  offerStatus: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'services'
});

export default Service;

