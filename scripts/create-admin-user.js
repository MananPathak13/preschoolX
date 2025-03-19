/**
 * This script creates an admin user for testing the admin dashboard.
 * 
 * Usage:
 * node scripts/create-admin-user.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    doc,
    getDoc,
    setDoc
} = require('firebase/firestore');
const {
    getAuth,
    createUserWithEmailAndPassword,
    signOut
} = require('firebase/auth');

// Initialize Firebase with hardcoded config
const firebaseConfig = {
    apiKey: "AIzaSyBd-7ATJVk9bI0sW0YMiyIH8iGYSM0gVM4",
    authDomain: "preschool-36825.firebaseapp.com",
    projectId: "preschool-36825",
    storageBucket: "preschool-36825.appspot.com",
    messagingSenderId: "79255845087",
    appId: "1:79255845087:web:c35f06712012c6bc52d16a",
    measurementId: "G-C6ZQQBGL0M4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Organization ID
const organizationId = "preschool_1741128159500";

// Admin user details
const adminDetails = {
    email: "admin2@preschoolpro.com", // Using admin2 to avoid conflict with existing admin
    password: "Admin123!",
    displayName: "Admin User",
    role: "admin"
};

// Default permissions for admin role
const adminPermissions = {
    students: { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true, delete: true },
    curriculum: { view: true, create: true, edit: true, delete: true },
    attendance: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    permissions: { view: true, create: true, edit: true, delete: true }
};

// Function to create a new admin user and add them to the organization
async function createAdminUser(email, password, displayName) {
    try {
        // Check if organization exists
        const orgRef = doc(db, `organizations/${organizationId}`);
        const orgDoc = await getDoc(orgRef);

        if (!orgDoc.exists()) {
            console.error(`Organization with ID ${organizationId} does not exist.`);
            return null;
        }

        console.log(`Organization found: ${orgDoc.data().name}`);

        // Create the user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(`Admin user created with UID: ${user.uid}`);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            displayName: displayName,
            organizations: [organizationId],
            defaultOrganization: organizationId,
            createdAt: new Date(),
            lastLoginAt: new Date()
        });
        console.log(`Admin user document created in Firestore`);

        // Add user as an admin of the organization
        const memberRef = doc(db, `organizations/${organizationId}/members/${user.uid}`);
        await setDoc(memberRef, {
            userId: user.uid,
            role: "admin",
            joinDate: new Date(),
            status: "active",
            permissions: adminPermissions,
            lastAccess: new Date()
        });
        console.log(`User added as admin to organization`);

        // Sign out the admin account
        await signOut(auth);

        return {
            uid: user.uid,
            email: email,
            role: "admin",
            organization: {
                id: organizationId,
                name: orgDoc.data().name
            }
        };
    } catch (error) {
        console.error("Error creating admin user:", error);
        return null;
    }
}

// Create the admin user
async function createAdmin() {
    try {
        console.log(`Creating admin user with email: ${adminDetails.email}`);

        const user = await createAdminUser(
            adminDetails.email,
            adminDetails.password,
            adminDetails.displayName
        );

        if (user) {
            console.log("\nAdmin user created successfully:");
            console.log(user);
            console.log("\nAdmin login credentials:");
            console.log(`Email: ${adminDetails.email}`);
            console.log(`Password: ${adminDetails.password}`);
        } else {
            console.log("Failed to create admin user.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

// Run the script
createAdmin()
    .then(() => {
        console.log("Script completed");
        process.exit(0);
    })
    .catch(error => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 