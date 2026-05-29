const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../config/db');

async function fixDatabaseImages() {
  try {
    console.log('🌱 Checking products in database...');
    const res = await db.query('SELECT id, name, category, image FROM products');
    
    let updatedCount = 0;
    for (const row of res.rows) {
      const oldImage = row.image;
      if (oldImage && oldImage.includes('src/assets')) {
        // Normalize path: Replace '/src/assets/' or similar with '/images/'
        // and remove spaces, lowercase the filename
        let newImage = oldImage.replace(/\\/g, '/'); // normalize backslashes
        
        // Match the directory and the filename
        const parts = newImage.split('/');
        const filename = parts[parts.length - 1];
        
        const cleanFilename = filename.replace(/\s+/g, '').toLowerCase();
        newImage = `/images/${cleanFilename}`;
        
        console.log(`Updating product ID ${row.id} ("${row.name}"): ${oldImage} -> ${newImage}`);
        await db.query('UPDATE products SET image = $1 WHERE id = $2', [newImage, row.id]);
        updatedCount++;
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} products in the database!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Database migration error:', err);
    process.exit(1);
  }
}

fixDatabaseImages();
