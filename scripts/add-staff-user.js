// This script adds a new staff or teacher user to the system
// Run this script with: node scripts/add-staff-user.js

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs
} = require('firebase/firestore');
const {
    getAuth,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} = require('firebase/auth');
const readline = require('readline');

// =====================================================================
// IMPORTANT: Replace this with your Firebase configuration from Firebase Console
// Go to: Project Settings > General > Your apps > SDK setup and configuration
// =====================================================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Default permissions for different roles
const defaultPermissions = {
    teacher: {
        students: { view: true, create: true, edit: true, delete: false },
        guardians: { view: true, create: true, edit: true, delete: false },
        classes: { view: true, create: true, edit: true, delete: false },
        attendance: { view: true, create: true, edit: true, delete: false },
        calendar: { view: true, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false }
    },
    staff: {
        students: { view: true, create: false, edit: false, delete: false },
        guardians: { view: true, create: false, edit: false, delete: false },
        classes: { view: true, create: false, edit: false, delete: false },
        attendance: { view: true, create: false, edit: false, delete: false },
        calendar: { view: true, create: false, edit: false, delete: false },
        reports: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false }
    }
};

// Function to prompt user for input
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function addStaffUser() {
    try {
        console.log('=== Add New Staff/Teacher User ===\n');

        // Get user information
        const email = await prompt('Enter email address: ');
        const fullName = await prompt('Enter full name: ');
        const role = await prompt('Enter role (teacher/staff): ');
        const tempPassword = await prompt('Enter temporary password: ');

        if (!['teacher', 'staff'].includes(role.toLowerCase())) {
            console.error('Error: Role must be either "teacher" or "staff"');
            rl.close();
            return;
        }

        // Get organization
        const orgsRef = collection(db, 'organizations');
        const orgsSnapshot = await getDocs(orgsRef);

        if (orgsSnapshot.empty) {
            console.error('Error: No organizations found');
            rl.close();
            return;
        }

        console.log('\nAvailable organizations:');
        orgsSnapshot.docs.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.data().name} (${doc.id})`);
        });

        const orgIndex = parseInt(await prompt('\nSelect organization (enter number): ')) - 1;

        if (orgIndex < 0 || orgIndex >= orgsSnapshot.docs.length) {
            console.error('Error: Invalid organization selection');
            rl.close();
            return;
        }

        const orgDoc = orgsSnapshot.docs[orgIndex];
        const orgId = orgDoc.id;
        const orgName = orgDoc.data().name;

        console.log(`\nCreating user for ${orgName}...`);

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        const userId = userCredential.user.uid;

        console.log(`User created in Firebase Auth: ${userId}`);

        // Create user document in users collection
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            email: email,
            displayName: fullName,
            organizations: [orgId],
            createdAt: new Date()
        });

        console.log('User document created in users collection');

        // Add user as member in organization
        const memberRef = doc(db, `organizations/${orgId}/members`, userId);
        await setDoc(memberRef, {
            email: email,
            fullName: fullName,
            role: role.toLowerCase(),
            permissions: defaultPermissions[role.toLowerCase()],
            addedAt: new Date()
        });

        console.log(`User added as ${role} in organization ${orgName}`);

        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent');

        console.log('\n=== User Added Successfully ===');
        console.log(`Email: ${email}`);
        console.log(`Name: ${fullName}`);
        console.log(`Role: ${role}`);
        console.log(`Organization: ${orgName}`);
        console.log('\nThe user will need to reset their password via the email that was sent.');

        rl.close();
    } catch (error) {
        console.error('Error adding user:', error);
        rl.close();
    }
}

// Run the script
addStaffUser(); 