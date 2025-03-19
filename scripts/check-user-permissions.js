const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    doc,
    getDoc
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
const db = getFirestore(app);

// Organization ID
const organizationId = "preschool_1741128159500";

// User ID to check (admin2 user)
const userId = "hiCTRduCjwVAGAxEH9lrnxGy8zw2";

async function checkUserPermissions() {
    try {
        console.log(`Checking permissions for user ${userId} in organization ${organizationId}`);

        // Get the user document
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            console.error(`User with ID ${userId} does not exist.`);
            return;
        }

        console.log("User document:");
        console.log(userDoc.data());

        // Get the organization membership document
        const memberDoc = await getDoc(doc(db, `organizations/${organizationId}/members/${userId}`));
        if (!memberDoc.exists()) {
            console.error(`User is not a member of organization ${organizationId}`);
            return;
        }

        console.log("\nOrganization membership:");
        console.log(memberDoc.data());

        // Check specific permissions
        const memberData = memberDoc.data();
        console.log("\nPermissions check:");

        if (memberData.role) {
            console.log(`Role: ${memberData.role}`);
        }

        if (memberData.permissions) {
            console.log("Permissions:");
            Object.entries(memberData.permissions).forEach(([module, actions]) => {
                console.log(`  ${module}:`, actions);
            });
        } else {
            console.log("No permissions found in the membership document");
        }

    } catch (error) {
        console.error("Error checking permissions:", error);
    }
}

// Run the script
checkUserPermissions()
    .then(() => {
        console.log("\nScript completed");
        process.exit(0);
    })
    .catch(error => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 