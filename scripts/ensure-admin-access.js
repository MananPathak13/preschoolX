// This script ensures that admin users have proper access in the database
// Run this script with: node scripts/ensure-admin-access.js

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    getDocs
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config();

// =====================================================================
// Firebase Configuration
// =====================================================================
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// =====================================================================
// Admin Users to Ensure Access For
// =====================================================================
const adminUsers = [
    {
        email: 'newadmin@preschoolpro.com',
        password: process.env.NEW_ADMIN_PASSWORD || 'defaultpassword123!',
        displayName: 'New Admin'
    }
];

// =====================================================================
// Default Admin Permissions
// =====================================================================
const defaultAdminPermissions = {
    students: { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true, delete: true },
    guardians: { view: true, create: true, edit: true, delete: true },
    classes: { view: true, create: true, edit: true, delete: true },
    attendance: { view: true, create: true, edit: true, delete: true },
    calendar: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    permissions: { view: true, create: true, edit: true, delete: true }
};

// =====================================================================
// Main Function to Ensure Admin Access
// =====================================================================
async function ensureAdminAccess() {
    try {
        console.log('Starting admin access script with Firebase config:', {
            projectId: firebaseConfig.projectId,
            authDomain: firebaseConfig.authDomain
        });

        for (const adminUser of adminUsers) {
            console.log(`Ensuring access for ${adminUser.email}...`);

            let userId;
            try {
                // Try to create new user first
                const userCredential = await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
                userId = userCredential.user.uid;
                console.log(`Created new user: ${adminUser.email} (${userId})`);
            } catch (error) {
                console.log(`Error creating user: ${error.code} - ${error.message}`);

                if (error.code === 'auth/email-already-in-use') {
                    // If user exists, sign in instead
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, adminUser.email, adminUser.password);
                        userId = userCredential.user.uid;
                        console.log(`Signed in existing user: ${adminUser.email} (${userId})`);
                    } catch (signInError) {
                        console.error(`Failed to sign in: ${signInError.code} - ${signInError.message}`);
                        throw signInError;
                    }
                } else {
                    throw error;
                }
            }

            // Check if user exists in users collection
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                console.log(`Creating user document for ${adminUser.email}`);
                await setDoc(userRef, {
                    email: adminUser.email,
                    displayName: adminUser.displayName,
                    organizations: [] // Will be populated below
                });
            }

            // Get all organizations
            const orgsRef = collection(db, 'organizations');
            const orgsSnapshot = await getDocs(orgsRef);

            if (orgsSnapshot.empty) {
                console.log('No organizations found. Creating a default organization...');

                // Create a default organization
                const defaultOrgRef = doc(collection(db, 'organizations'));
                await setDoc(defaultOrgRef, {
                    name: 'PreschoolPro Organization',
                    createdAt: new Date(),
                    createdBy: userId
                });

                // Add user as admin member
                const memberRef = doc(db, `organizations/${defaultOrgRef.id}/members`, userId);
                await setDoc(memberRef, {
                    email: adminUser.email,
                    role: 'admin',
                    permissions: defaultAdminPermissions,
                    addedAt: new Date()
                });

                // Update user's organizations
                await setDoc(userRef, { organizations: [defaultOrgRef.id] }, { merge: true });

                console.log(`Created organization ${defaultOrgRef.id} and added ${adminUser.email} as admin`);
            } else {
                // Update user's organizations and ensure admin access in each
                const userOrgs = [];

                for (const orgDoc of orgsSnapshot.docs) {
                    const orgId = orgDoc.id;
                    userOrgs.push(orgId);

                    // Check if user is already a member
                    const memberRef = doc(db, `organizations/${orgId}/members`, userId);
                    const memberDoc = await getDoc(memberRef);

                    if (!memberDoc.exists()) {
                        console.log(`Adding ${adminUser.email} as admin to organization ${orgId}`);
                        await setDoc(memberRef, {
                            email: adminUser.email,
                            role: 'admin',
                            permissions: defaultAdminPermissions,
                            addedAt: new Date()
                        });
                    } else {
                        // Ensure admin role and permissions
                        console.log(`Updating ${adminUser.email} to admin role in organization ${orgId}`);
                        await setDoc(memberRef, {
                            role: 'admin',
                            permissions: defaultAdminPermissions
                        }, { merge: true });
                    }
                }

                // Update user's organizations
                await setDoc(userRef, { organizations: userOrgs }, { merge: true });
                console.log(`Updated ${adminUser.email} with organizations: ${userOrgs.join(', ')}`);
            }
        }

        console.log('Admin access ensured successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error ensuring admin access:', error);
        process.exit(1);
    }
}

// Initialize Firebase
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Run the script
ensureAdminAccess(); 