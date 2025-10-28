-- Add firstName and lastName columns to users table
-- This migration adds the new columns while preserving existing data

-- Add firstName column
ALTER TABLE users ADD COLUMN firstName VARCHAR(255) NULL;

-- Add lastName column  
ALTER TABLE users ADD COLUMN lastName VARCHAR(255) NULL;

-- Update existing records to split the name field into firstName and lastName
-- This is a basic split on the first space - you may want to customize this logic
UPDATE users 
SET 
  firstName = CASE 
    WHEN name IS NOT NULL AND name != '' THEN 
      CASE 
        WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM 1 FOR POSITION(' ' IN name) - 1)
        ELSE name
      END
    ELSE NULL
  END,
  lastName = CASE 
    WHEN name IS NOT NULL AND name != '' AND POSITION(' ' IN name) > 0 THEN 
      SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE NULL
  END
WHERE name IS NOT NULL AND name != '';

-- Optional: You can also update the name field to be constructed from firstName and lastName
-- UPDATE users 
-- SET name = CONCAT(firstName, ' ', lastName)
-- WHERE firstName IS NOT NULL AND lastName IS NOT NULL;
