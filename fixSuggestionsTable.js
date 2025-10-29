import { sequelize } from './config/db.js';

const fixSuggestionsTable = async () => {
  try {
    console.log('🔧 Starting suggestions table fix...');
    console.log('📡 Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('\n⚠️  WARNING: This will drop the existing suggestions table and recreate it!');
    console.log('⚠️  Any existing data in the suggestions table will be lost.\n');
    
    // Drop existing table
    console.log('🗑️  Dropping existing suggestions table...');
    await sequelize.query('DROP TABLE IF EXISTS suggestions');
    console.log('✅ Old table dropped');
    
    // Create new table with correct column names
    console.log('\n📝 Creating suggestions table with correct column names...');
    await sequelize.query(`
      CREATE TABLE suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        suggestion TEXT NULL,
        attachment_path VARCHAR(500) NULL,
        attachment_name VARCHAR(255) NULL,
        attachment_size INT NULL,
        status ENUM('pending', 'reviewed', 'implemented', 'rejected') DEFAULT 'pending',
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table created successfully!');
    
    // Verify the table was created
    console.log('\n📋 Verifying table structure...');
    const [columns] = await sequelize.query('DESCRIBE suggestions');
    console.log('\n📊 Table Structure:');
    console.table(columns);
    
    // Show indexes
    const [indexes] = await sequelize.query('SHOW INDEX FROM suggestions');
    console.log('\n🔑 Indexes:');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Non_unique: idx.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'
    })));
    
    // Close the connection
    await sequelize.close();
    console.log('\n✅ Fix completed successfully!');
    console.log('🎉 Your suggestions table is now ready to use!');
    console.log('💡 You can now test the suggestions feature in your app.');
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

fixSuggestionsTable();

