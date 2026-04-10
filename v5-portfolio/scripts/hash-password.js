const crypto = require('crypto');

const password = 'SamCloud2024';
const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('\n=== ADMIN ACCOUNT ===\n');
console.log('Email: graphstats.pro@gmail.com');
console.log('Password: SamCloud2024');
console.log('SHA-256 Hash:', hash);
console.log('\n=== FIRESTORE DOCUMENT ===\n');
console.log(JSON.stringify({
  email: 'graphstats.pro@gmail.com',
  password: hash,
  created_at: new Date().toISOString()
}, null, 2));
console.log('');
