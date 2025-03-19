// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    query,
    where,
    writeBatch,
    serverTimestamp,
    Timestamp
} = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Helper functions
const generatePhone = () => {
    return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
};

const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// Constants
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const relationships = ['Mother', 'Father', 'Grandmother', 'Grandfather', 'Guardian'];
const allergies = ['Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Bee Stings', 'None'];
const medications = ['None', 'Epinephrine', 'Inhaler', 'Antihistamine'];
const medicalConditions = ['None', 'Asthma', 'Eczema', 'Diabetes', 'Seizures'];

// Main function to complete database setup
async function completeSetup() {
    try {
        console.log("Starting database completion setup...");

        // Get the first organization
        const organizationsSnapshot = await getDocs(collection(db, 'organizations'));
        if (organizationsSnapshot.empty) {
            console.error('No organizations found. Please run the init-firebase-database.js script first.');
            return;
        }

        const organizationDoc = organizationsSnapshot.docs[0];
        const organizationId = organizationDoc.id;
        console.log(`Found organization: ${organizationId}`);

        // Get existing users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (users.length === 0) {
            console.error('No users found. Please run the populate-test-data.js script first.');
            return;
        }

        console.log(`Found ${users.length} users`);

        // Get admin user
        const adminUser = users.find(user => {
            const email = user.email;
            return email && email.includes('admin') || email.includes('davis');
        });

        if (!adminUser) {
            console.error('No admin user found.');
            return;
        }

        console.log(`Found admin user: ${adminUser.email}`);

        // Get teacher users
        const teacherUsers = users.filter(user => {
            const email = user.email;
            return email && (email.includes('teacher') || email.includes('johnson') || email.includes('smith'));
        });

        console.log(`Found ${teacherUsers.length} teacher users`);

        // Get parent users
        const parentUsers = users.filter(user => {
            const email = user.email;
            return email && (email.includes('parent') ||
                email.includes('martinez') ||
                email.includes('anderson') ||
                email.includes('thomas'));
        });

        console.log(`Found ${parentUsers.length} parent users`);

        // 1. Update organization with more details
        await updateOrganization(organizationId);

        // 2. Create student guardians
        await createStudentGuardians(organizationId, parentUsers);

        // 3. Create staff documents
        await createStaffDocuments(organizationId);

        // 4. Create class enrollments
        await createClassEnrollments(organizationId);

        // 5. Create curriculum resources
        await createCurriculumResources(organizationId);

        // 6. Create detailed attendance records
        await createDetailedAttendance(organizationId, teacherUsers[0]?.id);

        console.log("Database setup completed successfully!");

    } catch (error) {
        console.error("Error completing database setup:", error);
    }
}

// Update organization with more details
async function updateOrganization(orgId) {
    try {
        console.log("Updating organization details...");

        const orgRef = doc(db, 'organizations', orgId);
        await setDoc(orgRef, {
            name: "Sunshine Preschool",
            address: {
                street: "123 Education Lane",
                city: "Learnville",
                state: "CA",
                zip: "90210",
                country: "USA"
            },
            phone: "(555) 123-4567",
            email: "info@sunshinepreschool.edu",
            website: "www.sunshinepreschool.edu",
            logo: "https://ui-avatars.com/api/?name=Sunshine+Preschool&background=random",
            settings: {
                operatingHours: {
                    monday: { open: "7:30 AM", close: "6:00 PM" },
                    tuesday: { open: "7:30 AM", close: "6:00 PM" },
                    wednesday: { open: "7:30 AM", close: "6:00 PM" },
                    thursday: { open: "7:30 AM", close: "6:00 PM" },
                    friday: { open: "7:30 AM", close: "6:00 PM" }
                },
                ageGroups: ["Infant (0-1)", "Toddler (1-2)", "Preschool (3-4)", "Pre-K (4-5)"],
                academicYearStart: Timestamp.fromDate(new Date(2023, 7, 15)), // August 15, 2023
                academicYearEnd: Timestamp.fromDate(new Date(2024, 5, 15))    // June 15, 2024
            },
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });

        console.log("Organization details updated successfully");

    } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
    }
}

// Create student guardians
async function createStudentGuardians(orgId, parentUsers) {
    try {
        console.log("Creating student guardians...");

        // Get all students
        const studentsSnapshot = await getDocs(collection(db, `organizations/${orgId}/students`));
        const students = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (students.length === 0) {
            console.log("No students found to create guardians for");
            return;
        }

        console.log(`Found ${students.length} students`);

        // Create guardians for each student
        const batch = writeBatch(db);

        for (const student of students) {
            // Find matching parents by last name or assign random ones
            let assignedParents = [];
            const matchingParents = parentUsers.filter(parent => {
                const parentName = parent.displayName || '';
                return parentName.includes(student.lastName);
            });

            if (matchingParents.length > 0) {
                assignedParents = matchingParents;
            } else {
                // Assign 1-2 random parents
                const numParents = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < numParents; i++) {
                    const randomParent = getRandomElement(parentUsers);
                    if (!assignedParents.includes(randomParent)) {
                        assignedParents.push(randomParent);
                    }
                }
            }

            // Create guardian records
            for (const parent of assignedParents) {
                const guardianRef = doc(db, `organizations/${orgId}/students/${student.id}/guardians`, parent.id);
                batch.set(guardianRef, {
                    userId: parent.id,
                    relationship: getRandomElement(relationships),
                    isPrimary: assignedParents.indexOf(parent) === 0, // First parent is primary
                    pickupAuthorized: true,
                    emergencyContact: true,
                    contactPriority: assignedParents.indexOf(parent) + 1
                });
            }

            console.log(`Created guardians for student: ${student.firstName} ${student.lastName}`);
        }

        await batch.commit();
        console.log("Student guardians created successfully");

    } catch (error) {
        console.error("Error creating student guardians:", error);
        throw error;
    }
}

// Create staff documents
async function createStaffDocuments(orgId) {
    try {
        console.log("Creating staff documents...");

        // Get all staff members
        const staffSnapshot = await getDocs(collection(db, `organizations/${orgId}/staff`));
        const staffMembers = staffSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (staffMembers.length === 0) {
            console.log("No staff members found to create documents for");
            return;
        }

        console.log(`Found ${staffMembers.length} staff members`);

        // Create documents for each staff member
        const batch = writeBatch(db);

        for (const staff of staffMembers) {
            // Create 1-3 documents for each staff member
            const numDocs = Math.floor(Math.random() * 3) + 1;

            const documents = [
                {
                    name: "Employment Contract",
                    type: "application/pdf",
                    url: "https://example.com/contract.pdf",
                    uploadedAt: Timestamp.fromDate(randomDate(new Date(2022, 0, 1), new Date()))
                },
                {
                    name: "Teaching Certification",
                    type: "application/pdf",
                    url: "https://example.com/certification.pdf",
                    uploadedAt: Timestamp.fromDate(randomDate(new Date(2022, 0, 1), new Date()))
                },
                {
                    name: "Background Check",
                    type: "application/pdf",
                    url: "https://example.com/background.pdf",
                    uploadedAt: Timestamp.fromDate(randomDate(new Date(2022, 0, 1), new Date()))
                }
            ];

            // Update staff record with documents
            const staffRef = doc(db, `organizations/${orgId}/staff`, staff.id);
            batch.update(staffRef, {
                documents: documents.slice(0, numDocs),
                updatedAt: serverTimestamp()
            });

            console.log(`Created documents for staff member: ${staff.firstName} ${staff.lastName}`);
        }

        await batch.commit();
        console.log("Staff documents created successfully");

    } catch (error) {
        console.error("Error creating staff documents:", error);
        throw error;
    }
}

// Create class enrollments
async function createClassEnrollments(orgId) {
    try {
        console.log("Creating class enrollments...");

        // Get all classes
        const classesSnapshot = await getDocs(collection(db, `organizations/${orgId}/classes`));
        const classes = classesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (classes.length === 0) {
            console.log("No classes found to create enrollments for");
            return;
        }

        console.log(`Found ${classes.length} classes`);

        // Get all students
        const studentsSnapshot = await getDocs(collection(db, `organizations/${orgId}/students`));
        const students = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (students.length === 0) {
            console.log("No students found to enroll in classes");
            return;
        }

        // Create enrollments for each class
        const batch = writeBatch(db);

        for (const classInfo of classes) {
            // Find students in the appropriate age group
            const eligibleStudents = students.filter(student => student.ageGroup === classInfo.ageGroup);

            if (eligibleStudents.length === 0) {
                console.log(`No eligible students found for class: ${classInfo.name}`);
                continue;
            }

            // Enroll students in the class
            for (const student of eligibleStudents) {
                const enrollmentRef = doc(db, `organizations/${orgId}/classes/${classInfo.id}/enrollments`, student.id);
                batch.set(enrollmentRef, {
                    studentId: student.id,
                    enrollmentDate: Timestamp.fromDate(new Date(2023, 7, 15)), // August 15, 2023
                    status: "active",
                    notes: ""
                });
            }

            console.log(`Created enrollments for class: ${classInfo.name} (${eligibleStudents.length} students)`);
        }

        await batch.commit();
        console.log("Class enrollments created successfully");

    } catch (error) {
        console.error("Error creating class enrollments:", error);
        throw error;
    }
}

// Create curriculum resources
async function createCurriculumResources(orgId) {
    try {
        console.log("Creating curriculum resources...");

        // Get all curriculum items
        const curriculumSnapshot = await getDocs(collection(db, `organizations/${orgId}/curriculum`));
        const curriculumItems = curriculumSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (curriculumItems.length === 0) {
            console.log("No curriculum items found to create resources for");
            return;
        }

        console.log(`Found ${curriculumItems.length} curriculum items`);

        // Create resources for each curriculum item
        const batch = writeBatch(db);

        for (const item of curriculumItems) {
            // Create 1-3 resources for each curriculum item
            const resources = [
                {
                    name: "Lesson Plan",
                    type: "application/pdf",
                    url: "https://example.com/lesson_plan.pdf",
                    uploadedAt: Timestamp.fromDate(randomDate(new Date(2023, 0, 1), new Date()))
                },
                {
                    name: "Activity Worksheet",
                    type: "application/pdf",
                    url: "https://example.com/worksheet.pdf",
                    uploadedAt: Timestamp.fromDate(randomDate(new Date(2023, 0, 1), new Date()))
                },
                {
                    name: "Visual Aids",
                    type: "application/pdf",
                    url: "https://example.com/visual_aids.pdf",
                    uploadedAt: Timestamp.fromDate(randomDate(new Date(2023, 0, 1), new Date()))
                }
            ];

            // Update curriculum item with resources
            const curriculumRef = doc(db, `organizations/${orgId}/curriculum`, item.id);
            batch.update(curriculumRef, {
                documents: resources.slice(0, Math.floor(Math.random() * 3) + 1),
                updatedAt: serverTimestamp()
            });

            console.log(`Created resources for curriculum item: ${item.title}`);
        }

        await batch.commit();
        console.log("Curriculum resources created successfully");

    } catch (error) {
        console.error("Error creating curriculum resources:", error);
        throw error;
    }
}

// Create detailed attendance records
async function createDetailedAttendance(orgId, teacherId) {
    try {
        console.log("Creating detailed attendance records...");

        // Get all classes
        const classesSnapshot = await getDocs(collection(db, `organizations/${orgId}/classes`));
        const classes = classesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (classes.length === 0) {
            console.log("No classes found to create attendance for");
            return;
        }

        // Create attendance for the last 10 days
        const batch = writeBatch(db);

        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (const classInfo of classes) {
                // Get enrollments for this class
                const enrollmentsSnapshot = await getDocs(collection(db, `organizations/${orgId}/classes/${classInfo.id}/enrollments`));
                const enrollments = enrollmentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (enrollments.length === 0) {
                    console.log(`No enrollments found for class: ${classInfo.name}`);
                    continue;
                }

                // Create attendance record
                const attendanceData = {};

                for (const enrollment of enrollments) {
                    const isPresent = Math.random() > 0.2; // 80% chance of attendance

                    attendanceData[enrollment.studentId] = {
                        status: isPresent ? "present" : (Math.random() > 0.5 ? "absent" : "excused"),
                        arrivalTime: isPresent ? Timestamp.fromDate(new Date(date.setHours(8, Math.floor(Math.random() * 30)))) : null,
                        departureTime: isPresent ? Timestamp.fromDate(new Date(date.setHours(15, 30 + Math.floor(Math.random() * 30)))) : null,
                        notes: isPresent ? "" : "Parent notified"
                    };
                }

                const attendanceRef = doc(db, `organizations/${orgId}/attendance/${dateStr}/classes`, classInfo.id);
                batch.set(attendanceRef, {
                    date: Timestamp.fromDate(date),
                    classId: classInfo.id,
                    students: attendanceData,
                    recordedBy: teacherId || "system",
                    updatedBy: teacherId || "system",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                console.log(`Created attendance record for class: ${classInfo.name} on ${dateStr}`);
            }
        }

        await batch.commit();
        console.log("Detailed attendance records created successfully");

    } catch (error) {
        console.error("Error creating detailed attendance records:", error);
        throw error;
    }
}

// Run the script
completeSetup()
    .then(() => {
        console.log("Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 