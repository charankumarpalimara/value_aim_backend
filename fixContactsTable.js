import { sequelize } from './config/db.js';

const fixContactsTable = async () => {
  try {
    console.log('🔧 Starting contacts table fix...');
    console.log('📡 Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('\n⚠️  WARNING: This will drop the existing contacts table and recreate it!');
    console.log('⚠️  Any existing data in the contacts table will be lost.\n');
    
    // Drop existing table
    console.log('🗑️  Dropping existing contacts table...');
    await sequelize.query('DROP TABLE IF EXISTS contacts');
    console.log('✅ Old table dropped');
    
    // Create new table with correct structure
    console.log('\n📝 Creating contacts table...');
    await sequelize.query(`
      CREATE TABLE contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
        adminNotes TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (userId),
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table created successfully!');
    
    // Verify the table was created
    console.log('\n📋 Verifying table structure...');
    const [columns] = await sequelize.query('DESCRIBE contacts');
    console.log('\n📊 Table Structure:');
    console.table(columns);
    
    // Show indexes
    const [indexes] = await sequelize.query('SHOW INDEX FROM contacts');
    console.log('\n🔑 Indexes:');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Non_unique: idx.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'
    })));
    
    // Close the connection
    await sequelize.close();
    console.log('\n✅ Fix completed successfully!');
    console.log('🎉 Your contacts table is now ready to use!');
    console.log('💡 You can now test the contact form feature in your app.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('Error details:', error);
    
    // Close the connection
    try {
      await sequelize.close();
    } catch (e) {
      // Ignore closing errors
    }
    
    process.exit(1);
  }
};

fixContactsTable();

