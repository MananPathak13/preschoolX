/**
 * This script creates a test user with admin privileges.
 * 
 * Usage:
 * node scripts/create-test-user.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const {
    getAuth,
    createUserWithEmailAndPassword
} = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Admin user data
const adminUser = {
    email: 'admin@example.com',
    password: 'Admin123!'
};

/**
 * Create a test user with admin privileges
 */
async function createTestUser() {
    try {
        console.log('Creating test user...');

        // Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            adminUser.email,
            adminUser.password
        );
        console.log(`Created test user ${adminUser.email} in Auth`);
        console.log(`You can login with:`);
        console.log(`Email: ${adminUser.email}`);
        console.log(`Password: ${adminUser.password}`);
    } catch (error) {
        console.error(`Error creating test user:`, error);

        // If the user already exists, just print the login credentials
        if (error.code === 'auth/email-already-in-use') {
            console.log(`Test user ${adminUser.email} already exists`);
            console.log(`You can login with:`);
            console.log(`Email: ${adminUser.email}`);
            console.log(`Password: ${adminUser.password}`);
        }
    }
}

// Run the script
createTestUser().catch((error) => {
    console.error('Error creating test user:', error);
    process.exit(1);
}).finally(() => {
    process.exit(0);
}); 