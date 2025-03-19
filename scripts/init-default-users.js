/**
 * This script initializes default users with proper permissions in Firebase.
 * Run this script once to set up initial users for testing.
 * 
 * Usage:
 * node scripts/init-default-users.js
 */

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    doc,
    setDoc,
    collection,
    getDocs,
    query,
    where
} = require('firebase/firestore');
const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
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
const db = getFirestore(app);

// Default permissions for different roles
const defaultPermissions = {
    admin: {
        // Admins have full access to everything
        students: { view: true, create: true, edit: true, delete: true },
        staff: { view: true, create: true, edit: true, delete: true },
        curriculum: { view: true, create: true, edit: true, delete: true },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
        billing: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        permissions: { view: true, create: true, edit: true, delete: true },
        help: { view: true, create: true, edit: true, delete: true },
    },
    teacher: {
        // Teachers have limited access
        students: { view: true, create: false, edit: true, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: true, edit: true, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: false },
        reports: { view: true, create: true, edit: false, delete: false },
        analytics: { view: true, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
    },
    staff: {
        // Staff have very limited access
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
    },
    parent: {
        // Parents only see their children's information
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: false, edit: false, delete: false },
        reports: { view: false, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        billing: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
    },
};

// Default users to create
const defaultUsers = [
    {
        email: 'admin@preschoolpro.com',
        password: 'Admin123!',
        role: 'admin',
        name: 'Admin User',
        department: 'Administration',
    },
    {
        email: 'teacher@preschoolpro.com',
        password: 'Teacher123!',
        role: 'teacher',
        name: 'Teacher User',
        department: 'Pre-K',
    },
    {
        email: 'staff@preschoolpro.com',
        password: 'Staff123!',
        role: 'staff',
        name: 'Staff User',
        department: 'Support',
    },
    {
        email: 'parent@preschoolpro.com',
        password: 'Parent123!',
        role: 'parent',
        name: 'Parent User',
        department: 'N/A',
    },
];

/**
 * Create a user in Firebase Auth and Firestore with proper permissions
 */
async function createUser(userData) {
    try {
        // Check if user already exists in Auth
        try {
            await signInWithEmailAndPassword(auth, userData.email, userData.password);
            console.log(`User ${userData.email} already exists in Auth`);
        } catch (error) {
            // If user doesn't exist, create them
            if (error.code === 'auth/user-not-found') {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    userData.email,
                    userData.password
                );
                console.log(`Created user ${userData.email} in Auth`);

                // Get the user ID
                const uid = userCredential.user.uid;

                // Create user document in Firestore
                await setDoc(doc(db, 'users', uid), {
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    department: userData.department,
                    permissions: defaultPermissions[userData.role],
                    createdAt: new Date().toISOString(),
                });

                console.log(`Created user ${userData.email} in Firestore with ${userData.role} permissions`);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
    }
}

/**
 * Initialize all default users
 */
async function initializeDefaultUsers() {
    console.log('Initializing default users...');

    for (const userData of defaultUsers) {
        await createUser(userData);
    }

    console.log('Default users initialized successfully');
    process.exit(0);
}

// Run the initialization
initializeDefaultUsers().catch((error) => {
    console.error('Error initializing default users:', error);
    process.exit(1);
}); 