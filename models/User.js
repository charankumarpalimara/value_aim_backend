import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidPassword(value) {
        if (this.provider === 'email' && !value) {
          throw new Error('Password is required for email provider');
        }
      }
    }
  },
  provider: {
    type: DataTypes.ENUM('email', 'google', 'microsoft', 'apple'),
    defaultValue: 'email'
  },
  providerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isFirstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hasCompletedOnboarding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  companyDetailsCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  serviceDetailsCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  plan: {
    type: DataTypes.ENUM('Free Plan', 'Pro Plan', 'Enterprise Plan'),
    defaultValue: 'Free Plan'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;

