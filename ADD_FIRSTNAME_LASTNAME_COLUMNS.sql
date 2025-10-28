-- Add firstName and lastName columns to users table
-- This migration adds the new columns while preserving existing data

-- Add first_name column (snake_case for Sequelize)
ALTER TABLE users ADD COLUMN first_name VARCHAR(255) NULL;

-- Add last_name column (snake_case for Sequelize)
ALTER TABLE users ADD COLUMN last_name VARCHAR(255) NULL;

-- Update existing records to split the name field into first_name and last_name
-- This is a basic split on the first space - you may want to customize this logic
UPDATE users 
SET 
  first_name = CASE 
    WHEN name IS NOT NULL AND name != '' THEN 
      CASE 
        WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM 1 FOR POSITION(' ' IN name) - 1)
        ELSE name
      END
    ELSE NULL
  END,
  last_name = CASE 
    WHEN name IS NOT NULL AND name != '' AND POSITION(' ' IN name) > 0 THEN 
      SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE NULL
  END
WHERE name IS NOT NULL AND name != '';

-- Optional: You can also update the name field to be constructed from first_name and last_name
-- UPDATE users 
-- SET name = CONCAT(first_name, ' ', last_name)
-- WHERE first_name IS NOT NULL AND last_name IS NOT NULL;
