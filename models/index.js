import User from './User.js';
import Company from './Company.js';
import Service from './Service.js';

// Define associations
User.hasOne(Company, {
  foreignKey: 'userId',
  as: 'company'
});

Company.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Service, {
  foreignKey: 'userId',
  as: 'services'
});

Service.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export { User, Company, Service };
