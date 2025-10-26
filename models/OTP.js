import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  otp: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('login', 'signup', 'accountCreation', 'resetPassword'),
    defaultValue: 'login'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'otps',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

export default OTP;
