/**
 * Firebase Database Initialization Script
 * 
 * This script initializes the basic database structure for PreschoolPro
 * including creating an organization, admin user, and setting permissions.
 * 
 * Usage:
 * 1. Ensure Firebase credentials are set in .env.local
 * 2. Run: node scripts/init-firebase-database.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    doc,
    setDoc,
    collection,
    writeBatch,
    serverTimestamp
} = require('firebase/firestore');
const {
    getAuth,
    createUserWithEmailAndPassword
} = require('firebase/auth');

// Firebase configuration from environment variables
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

// Organization ID to create
const ORG_ID = "preschool_" + Date.now();

// Admin user info
const ADMIN_USER = {
    email: "admin@example.com",
    password: "Admin123!"
};

/**
 * Initialize the database structure
 */
async function initializeDatabase() {
    try {
        console.log("Starting database initialization...");
        console.log(`Creating organization with ID: ${ORG_ID}`);

        // 1. Create organization document
        const orgData = {
            name: "ABC Preschool",
            address: {
                street: "123 Main Street",
                city: "Anytown",
                state: "CA",
                zip: "90210",
                country: "USA"
            },
            phone: "(555) 123-4567",
            email: "contact@abcpreschool.com",
            website: "https://abcpreschool.com",
            settings: {
                operatingHours: {
                    monday: { open: "08:00", close: "17:00" },
                    tuesday: { open: "08:00", close: "17:00" },
                    wednesday: { open: "08:00", close: "17:00" },
                    thursday: { open: "08:00", close: "17:00" },
                    friday: { open: "08:00", close: "17:00" },
                    saturday: { open: "", close: "" },
                    sunday: { open: "", close: "" }
                },
                ageGroups: ["Toddlers (2-3)", "Preschool (3-4)", "Pre-K (4-5)"]
            },
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, "organizations", ORG_ID), orgData);
        console.log("✓ Organization created successfully");

        // 2. Create admin user
        console.log(`Creating admin user: ${ADMIN_USER.email}`);
        let userId;

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                ADMIN_USER.email,
                ADMIN_USER.password
            );
            userId = userCredential.user.uid;
            console.log(`✓ Admin user created with ID: ${userId}`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log("✓ Admin user already exists");
                console.log("⚠ Using hardcoded admin ID for demonstration. In a real app, you would query for the user.");
                userId = "admin123"; // In a real app, you would query for this
            } else {
                throw error;
            }
        }

        // 3. Create user document
        const userData = {
            email: ADMIN_USER.email,
            displayName: "Admin User",
            phoneNumber: "(555) 987-6543",
            organizations: [ORG_ID],
            defaultOrganization: ORG_ID,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
        };

        await setDoc(doc(db, "users", userId), userData);
        console.log("✓ User document created");

        // 4. Create organization membership for admin
        const membershipData = {
            userId: userId,
            role: "admin",
            department: "Administration",
            title: "Director",
            joinDate: serverTimestamp(),
            status: "active",
            permissions: {
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
                help: { view: true, create: true, edit: true, delete: true }
            },
            lastAccess: serverTimestamp()
        };

        await setDoc(doc(db, "organizations", ORG_ID, "members", userId), membershipData);
        console.log("✓ Admin membership created");

        // 5. Create a batch for sample data
        const batch = writeBatch(db);

        // 6. Add sample class
        const classData = {
            name: "Sunshine Room",
            ageGroup: "Preschool (3-4)",
            description: "A bright and fun environment for preschoolers to learn and play.",
            capacity: 15,
            assignedTeachers: [userId], // Admin as teacher for demo
            schedule: {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true
            },
            room: "Room 101",
            active: true,
            academicYear: "2024-2025",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const classRef = doc(db, "organizations", ORG_ID, "classes", "class_" + Date.now());
        batch.set(classRef, classData);

        // 7. Add sample curriculum item
        const curriculumData = {
            title: "Colors and Shapes",
            description: "Introduction to basic colors and shapes through interactive activities.",
            ageGroup: "Preschool (3-4)",
            subject: "Art & Recognition",
            duration: 45,
            objectives: [
                "Recognize and name primary colors",
                "Identify basic shapes (circle, square, triangle)",
                "Practice fine motor skills through coloring"
            ],
            materials: [
                "Colored construction paper",
                "Safety scissors",
                "Glue sticks",
                "Shape templates"
            ],
            activities: [
                {
                    name: "Color Matching Game",
                    description: "Match color cards to corresponding objects",
                    duration: 15,
                    instructions: "Spread colored cards and objects on table. Have children match them."
                },
                {
                    name: "Shape Collage",
                    description: "Create a collage using different shapes",
                    duration: 20,
                    instructions: "Cut out various shapes and have children create pictures by gluing them on paper."
                }
            ],
            createdBy: userId,
            status: "approved",
            tags: ["colors", "shapes", "art", "recognition"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const curriculumRef = doc(db, "organizations", ORG_ID, "curriculum", "curriculum_" + Date.now());
        batch.set(curriculumRef, curriculumData);

        // 8. Commit the batch
        await batch.commit();
        console.log("✓ Sample class and curriculum created");

        console.log("\n✅ Database initialization complete!");
        console.log("\nYou can now use the following credentials to log in:");
        console.log(`Email: ${ADMIN_USER.email}`);
        console.log(`Password: ${ADMIN_USER.password}`);
        console.log(`Organization: ${ORG_ID}`);

    } catch (error) {
        console.error("❌ Error initializing database:", error);
    }
}

// Run the initialization
initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    }); 