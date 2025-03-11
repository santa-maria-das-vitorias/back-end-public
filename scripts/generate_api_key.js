/**
 * API Key Generator
 * This script generates a secure random 50-character API key that can be used in the .env file.
 * Run with: node scripts/generate_api_key.js
 */

const crypto = require('crypto');

// Generate a random string of specified length using crypto
function generateSecureKey(length = 50) {
  // Use a mix of alphanumeric characters for the key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  // Create a byte array of the appropriate length
  const randomBytes = crypto.randomBytes(length);
  
  // Map random bytes to characters from our character set
  let result = '';
  for (let i = 0; i < length; i++) {
    // Use modulo to get a valid index for our character set
    const randomIndex = randomBytes[i] % chars.length;
    result += chars.charAt(randomIndex);
  }
  
  return result;
}

// Generate the key
const apiKey = generateSecureKey(50);

// Output the key with usage instructions
console.log('\x1b[32m%s\x1b[0m', '✅ API Key Successfully Generated!');
console.log('\x1b[36m%s\x1b[0m', '\nYour 50-character API key:');
console.log('\x1b[33m%s\x1b[0m', apiKey);
console.log('\x1b[36m%s\x1b[0m', '\nInstructions:');
console.log('1. Copy this key');
console.log('2. Open your .env file');
console.log('3. Set API_SECRET_KEY=', apiKey);
console.log('\nKeep this key secure and don\'t share it publicly.');
