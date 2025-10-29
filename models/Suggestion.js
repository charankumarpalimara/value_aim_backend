import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Suggestion = sequelize.define('Suggestion', {
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
    },
    onDelete: 'CASCADE'
  },
  suggestion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachmentPath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  attachmentName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  attachmentSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'implemented', 'rejected'),
    defaultValue: 'pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'suggestions',
  timestamps: true
});

export default Suggestion;

