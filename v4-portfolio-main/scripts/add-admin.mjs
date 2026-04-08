import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import crypto from 'crypto';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjmXMMafuPYkYi1GzrnucNJSjxypN2gYQ",
  authDomain: "docky-dev-fr.firebaseapp.com",
  projectId: "docky-dev-fr",
  storageBucket: "docky-dev-fr.firebasestorage.app",
  messagingSenderId: "548202839817",
  appId: "1:548202839817:web:832f713ae5135e41809dd8",
  measurementId: "G-KLXHVFYQYY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin() {
  try {
    const email = 'graphstats.pro@gmail.com';
    const password = 'SamCloud2024';

    // Generate password hash (same method as auth.ts)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    console.log('\nCreating admin account...\n');
    console.log('Email:', email);
    console.log('Hash:', hashedPassword);

    const docRef = await addDoc(collection(db, 'admins'), {
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    });

    console.log('\nAdmin account created successfully.');
    console.log('Document ID:', docRef.id);
    console.log('\nYou can now sign in at /admin');
    console.log('Email:', email);
    console.log('Password: SamCloud2024\n');

    process.exit(0);
  } catch (error) {
    console.error('\nError while creating admin account:');
    console.error(error);
    console.log('\nCheck the following:');
    console.log('1. Firestore is enabled in Firebase Console');
    console.log('2. Security rules allow write access');
    console.log('3. Firebase config is valid\n');
    process.exit(1);
  }
}

createAdmin();
