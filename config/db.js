import { Sequelize } from 'sequelize';

// Database configuration
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'value_aim',
  process.env.MYSQL_USER || 'alanadmin',
  process.env.MYSQL_PASSWORD || 'Alantur@123',
  {
    host: process.env.MYSQL_HOST || '147.182.163.213',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4', // Important for special characters
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4'
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected: Connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully.');
    
  } catch (error) {
    console.error('Unable to connect to MySQL database:', error.message);
    process.exit(1);
  }
};

export { sequelize, connectDB };

