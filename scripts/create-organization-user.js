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
    setDoc,
    collection,
    arrayUnion,
    updateDoc
} = require('firebase/firestore');

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

// Organization ID from the command line
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

// Create users with different roles
async function createUsers() {
    try {
        // Create an admin user
        const adminUser = await createOrganizationUser(
            "admin@preschoolpro.com",
            "Admin123!",
            "Admin User",
            "admin"
        );

        // Create a teacher user
        const teacherUser = await createOrganizationUser(
            "teacher@preschoolpro.com",
            "Teacher123!",
            "Teacher User",
            "teacher"
        );

        // Create a parent user
        const parentUser = await createOrganizationUser(
            "parent@preschoolpro.com",
            "Parent123!",
            "Parent User",
            "parent"
        );

        console.log("\nCreated users:");
        console.log("Admin:", adminUser);
        console.log("Teacher:", teacherUser);
        console.log("Parent:", parentUser);

        console.log("\nTest credentials:");
        console.log("Admin: admin@preschoolpro.com / Admin123!");
        console.log("Teacher: teacher@preschoolpro.com / Teacher123!");
        console.log("Parent: parent@preschoolpro.com / Parent123!");

    } catch (error) {
        console.error("Error in createUsers:", error);
    }
}

// Run the script
createUsers()
    .then(() => {
        console.log("Script completed successfully");
        process.exit(0);
    })
    .catch(error => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 