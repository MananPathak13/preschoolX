const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    getDocs
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

async function listOrganizations() {
    try {
        console.log("Listing all organizations in Firestore...");

        const organizationsRef = collection(db, 'organizations');
        const snapshot = await getDocs(organizationsRef);

        if (snapshot.empty) {
            console.log("No organizations found in the database.");
            return;
        }

        console.log(`Found ${snapshot.size} organization(s):`);

        snapshot.forEach(doc => {
            console.log(`ID: ${doc.id}`);
            console.log(`Name: ${doc.data().name || 'No name'}`);
            console.log(`Active: ${doc.data().active}`);
            console.log('-----------------------------------');
        });

    } catch (error) {
        console.error("Error listing organizations:", error);
    }
}

// Run the script
listOrganizations()
    .then(() => {
        console.log("Script completed");
        process.exit(0);
    })
    .catch(error => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 