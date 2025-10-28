import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '147.182.163.213',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'alanadmin',
      password: process.env.MYSQL_PASSWORD || 'Alantur@123',
      database: process.env.MYSQL_DATABASE || 'value_aim',
      multipleStatements: true
    });

    console.log('Connected to MySQL database successfully.');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'ADD_FIRSTNAME_LASTNAME_COLUMNS.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing migration...');
    
    // Execute the SQL
    await connection.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('The first_name and last_name columns have been added to the users table.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if columns already exist
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Columns already exist. No action needed.');
    } else {
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the migration
runMigration();

