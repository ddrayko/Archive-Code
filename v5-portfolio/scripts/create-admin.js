// Script to create an admin account
// Usage: node scripts/create-admin.js <email> <password>

const crypto = require('crypto');

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password>');
    process.exit(1);
  }

  const hashedPassword = await hashPassword(password);
  const created_at = new Date().toISOString();

  console.log('\n=== Admin Account Details ===\n');
  console.log('Email:', email);
  console.log('Password Hash:', hashedPassword);
  console.log('Created At:', created_at);

  console.log('\n=== Firestore Document ===\n');
  console.log(JSON.stringify({ email, password: hashedPassword, created_at }, null, 2));

  console.log('\n=== Instructions ===\n');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project: docky-dev-fr');
  console.log('3. Open Firestore Database');
  console.log('4. Create or open the "admins" collection');
  console.log('5. Click "Add document"');
  console.log('6. Keep the auto-generated ID');
  console.log('7. Paste the JSON data shown above');
  console.log('');
}

main().catch(console.error);
