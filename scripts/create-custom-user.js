const { initializeApp } = require('firebase/app');
const {
    getAuth,
    createUserWithEmailAndPassword,
    signOut
} = require('firebase/auth');
const {
    getFirestore,
    doc,
    getDoc,
    setDoc
} = require('firebase/firestore');
const readline = require('readline');

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

// Default permissions for different roles
const rolePermissions = {
    admin: {
        students: { view: true, create: true, edit: true, delete: true },
        staff: { view: true, create: true, edit: true, delete: true },
        curriculum: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        permissions: { view: true, create: true, edit: true, delete: true }
    },
    teacher: {
        students: { view: true, create: true, edit: true, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: true, edit: true, delete: false },
        attendance: { view: true, create: true, edit: true, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false }
    },
    parent: {
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        attendance: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false }
    }
};

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt for input
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Function to create a new user and add them to the organization
async function createOrganizationUser(email, password, displayName, role) {
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
        console.log(`User created with UID: ${user.uid}`);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            displayName: displayName,
            organizations: [organizationId],
            defaultOrganization: organizationId,
            createdAt: new Date(),
            lastLoginAt: new Date()
        });
        console.log(`User document created in Firestore`);

        // Add user as a member of the organization
        const memberRef = doc(db, `organizations/${organizationId}/members/${user.uid}`);
        await setDoc(memberRef, {
            userId: user.uid,
            role: role,
            joinDate: new Date(),
            status: "active",
            permissions: rolePermissions[role] || rolePermissions.teacher,
            lastAccess: new Date()
        });
        console.log(`User added as ${role} to organization`);

        // Sign out the admin account
        await signOut(auth);

        return {
            uid: user.uid,
            email: email,
            role: role,
            organization: {
                id: organizationId,
                name: orgDoc.data().name
            }
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

// Main function to get user input and create user
async function main() {
    try {
        console.log("Create a new user for organization: " + organizationId);

        const email = await prompt("Enter email: ");
        const password = await prompt("Enter password (min 6 characters): ");
        const displayName = await prompt("Enter display name: ");

        console.log("\nAvailable roles:");
        console.log("1. admin");
        console.log("2. teacher");
        console.log("3. parent");

        const roleChoice = await prompt("Select role (1-3): ");

        let role;
        switch (roleChoice) {
            case "1": role = "admin"; break;
            case "2": role = "teacher"; break;
            case "3": role = "parent"; break;
            default: role = "teacher";
        }

        console.log(`\nCreating user with role: ${role}`);

        const user = await createOrganizationUser(email, password, displayName, role);

        if (user) {
            console.log("\nUser created successfully:");
            console.log(user);
            console.log("\nLogin credentials:");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } else {
            console.log("Failed to create user.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        rl.close();
    }
}

// Run the script
main()
    .then(() => {
        console.log("Script completed");
        process.exit(0);
    })
    .catch(error => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 