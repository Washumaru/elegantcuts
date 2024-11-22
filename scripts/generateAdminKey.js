#!/usr/bin/env node

import { nanoid } from 'nanoid';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createSpinner } from 'nanospinner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateAdminKey() {
  const keyId = nanoid(8).toUpperCase();
  return `ADM-${keyId}-${Date.now()}`;
}

async function storeAdminKey(key) {
  const spinner = createSpinner('Generating admin key...').start();
  
  try {
    const keysPath = join(__dirname, '..', 'data');
    const filePath = join(keysPath, 'admin-keys.json');
    
    // Create data directory if it doesn't exist
    await fs.mkdir(keysPath, { recursive: true });
    
    // Check for existing unused keys
    let existingKeys = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      existingKeys = JSON.parse(data);
      
      const hasUnusedKey = existingKeys.some(k => !k.used);
      if (hasUnusedKey) {
        spinner.error({ text: '❌ Ya existe una clave de administrador sin usar' });
        process.exit(1);
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      existingKeys = [];
    }
    
    const newKey = {
      key,
      createdAt: Date.now(),
      used: false
    };
    
    // Save the new key
    await fs.writeFile(filePath, JSON.stringify([newKey], null, 2));
    
    spinner.success({ text: '✨ Admin key generated successfully!' });
    
    console.log('\n=== ADMIN KEY GENERATED ===');
    console.log('\nYour admin key is:');
    console.log('\x1b[32m%s\x1b[0m', key);
    console.log('\nThis key:');
    console.log('- Can only be used once');
    console.log('- Will be marked as used after first login');
    console.log('- Should be kept secure');
    console.log('\nUse this key to access the admin panel at /admin-login');
    console.log('===========================\n');
    
    return true;
  } catch (error) {
    spinner.error({ text: '❌ Error generating admin key' });
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Execute the script
const key = generateAdminKey();
await storeAdminKey(key);