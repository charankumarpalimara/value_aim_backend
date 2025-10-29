import { sequelize } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runSuggestionsMigration = async () => {
  try {
    console.log('🔄 Starting suggestions table migration...');
    console.log('📡 Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Read the SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'CREATE_SUGGESTIONS_TABLE.sql'),
      'utf8'
    );

    // Remove comments and split by semicolon
    const cleanedSQL = sqlFile
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.toUpperCase().startsWith('USE') &&
        !stmt.toUpperCase().startsWith('SHOW') &&
        !stmt.toUpperCase().startsWith('DESCRIBE')
      );

    console.log(`\n📋 Found ${statements.length} SQL statement(s) to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`\n📝 [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
        try {
          await sequelize.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          throw err;
        }
      }
    }
    
    console.log('\n✅ All SQL statements executed successfully!');
    console.log('📋 Verifying table structure...');
    
    // Verify the table was created
    try {
      const [tables] = await sequelize.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'suggestions'"
      );
      
      if (tables && tables.length > 0) {
        console.log('✅ Table "suggestions" exists in database');
        
        // Show table structure
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
      } else {
        console.log('❌ Table "suggestions" was not created');
        console.log('💡 Checking all tables in database...');
        const [allTables] = await sequelize.query('SHOW TABLES');
        console.log('Available tables:', allTables);
      }
    } catch (verifyError) {
      console.error('❌ Error verifying table:', verifyError.message);
    }
    
    // Close the connection
    await sequelize.close();
    console.log('\n✅ Migration completed successfully!');
    console.log('🎉 You can now start your server with: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
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

runSuggestionsMigration();

