const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');

// Firebase configuration (same project as client)
const firebaseConfig = {
  projectId: 'docky-dev-fr',
  // For Firebase Admin, full client keys are not required
};

const app = initializeApp({
  credential: cert({
    projectId: firebaseConfig.projectId,
    // For production Firebase Admin usage, provide a service account
    // For local development, use emulator/default credentials
  })
});

const db = getFirestore(app);

async function createAdmin() {
  try {
    const email = 'graphstats.pro@gmail.com';
    const password = 'SamCloud2024';

    // Generate password hash
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    console.log('\nCreating admin account...\n');
    console.log('Email:', email);
    console.log('Hash:', hashedPassword);

    const docRef = await db.collection('admins').add({
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    });

    console.log('\nAdmin account created successfully.');
    console.log('Document ID:', docRef.id);
    console.log('\nYou can now sign in at /admin');
    console.log('Email:', email);
    console.log('Password: SamCloud2024\n');
  } catch (error) {
    console.error('\nError while creating admin account:');
    console.error(error.message);
    console.log('\nMake sure that:');
    console.log('1. You are authenticated with Firebase (firebase login)');
    console.log('2. You have the required permissions');
    console.log('3. Firestore is enabled for this project\n');
  }

  process.exit(0);
}

createAdmin();
