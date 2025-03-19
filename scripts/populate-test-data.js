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
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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

// Dummy data generators
const generatePhone = () => {
    return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
};

const generateEmail = (firstName, lastName, domain = 'example.com') => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// Constants for dummy data
const ageGroups = ['Infant (0-1)', 'Toddler (1-2)', 'Preschool (3-4)', 'Pre-K (4-5)'];
const subjects = ['Language', 'Math', 'Science', 'Art', 'Music', 'Physical Education', 'Social Studies'];
const staffTitles = ['Lead Teacher', 'Assistant Teacher', 'Director', 'Administrative Assistant', 'Caregiver', 'Curriculum Specialist'];
const departments = ['Administration', 'Education', 'Care', 'Operations'];
const classRooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Gym', 'Playground', 'Art Studio'];
const allergies = ['Peanuts', 'Dairy', 'Eggs', 'Gluten', 'Bee Stings', 'Latex', 'None'];
const medications = ['None', 'Epinephrine', 'Inhaler', 'Antihistamine'];
const medicalConditions = ['None', 'Asthma', 'Eczema', 'Diabetes', 'Seizures', 'ADHD'];
const relationships = ['Mother', 'Father', 'Grandmother', 'Grandfather', 'Guardian', 'Aunt', 'Uncle'];
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const qualifications = [
    { degree: 'Bachelor of Education', institution: 'State University', year: 2018 },
    { degree: 'Master of Early Childhood Education', institution: 'Education College', year: 2020 },
    { degree: 'Child Development Associate', institution: 'Community College', year: 2019 },
    { degree: 'Bachelor of Psychology', institution: 'Private University', year: 2017 }
];
const certifications = [
    { name: 'CPR & First Aid', issuedBy: 'Red Cross', issuedDate: new Date(2022, 1, 15), expiryDate: new Date(2024, 1, 15) },
    { name: 'Child Care Professional', issuedBy: 'Child Care Institute', issuedDate: new Date(2021, 3, 10), expiryDate: new Date(2023, 3, 10) },
    { name: 'Special Needs Education', issuedBy: 'Education Board', issuedDate: new Date(2022, 5, 20), expiryDate: new Date(2024, 5, 20) }
];
const specialties = ['Infant Care', 'Montessori Method', 'Special Needs', 'Bilingual Education', 'Music', 'Art', 'STEM'];

// Generate staff members
const staffData = [
    { firstName: 'Sarah', lastName: 'Johnson', role: 'teacher', department: 'Education', title: 'Lead Teacher' },
    { firstName: 'Michael', lastName: 'Smith', role: 'teacher', department: 'Education', title: 'Assistant Teacher' },
    { firstName: 'Emily', lastName: 'Davis', role: 'admin', department: 'Administration', title: 'Director' },
    { firstName: 'David', lastName: 'Wilson', role: 'staff', department: 'Operations', title: 'Administrative Assistant' },
    { firstName: 'Jennifer', lastName: 'Brown', role: 'teacher', department: 'Education', title: 'Curriculum Specialist' },
    { firstName: 'Robert', lastName: 'Taylor', role: 'staff', department: 'Care', title: 'Caregiver' }
];

// Generate students
const studentData = [
    { firstName: 'Emma', lastName: 'Martinez', dob: new Date(2019, 4, 12), gender: 'Female', ageGroup: 'Preschool (3-4)' },
    { firstName: 'Noah', lastName: 'Anderson', dob: new Date(2018, 7, 23), gender: 'Male', ageGroup: 'Pre-K (4-5)' },
    { firstName: 'Olivia', lastName: 'Thomas', dob: new Date(2020, 1, 5), gender: 'Female', ageGroup: 'Toddler (1-2)' },
    { firstName: 'Liam', lastName: 'Jackson', dob: new Date(2019, 10, 15), gender: 'Male', ageGroup: 'Preschool (3-4)' },
    { firstName: 'Ava', lastName: 'White', dob: new Date(2020, 3, 30), gender: 'Female', ageGroup: 'Toddler (1-2)' },
    { firstName: 'William', lastName: 'Harris', dob: new Date(2018, 6, 18), gender: 'Male', ageGroup: 'Pre-K (4-5)' },
    { firstName: 'Sophia', lastName: 'Martin', dob: new Date(2019, 2, 9), gender: 'Female', ageGroup: 'Preschool (3-4)' },
    { firstName: 'James', lastName: 'Thompson', dob: new Date(2020, 5, 22), gender: 'Male', ageGroup: 'Toddler (1-2)' },
    { firstName: 'Isabella', lastName: 'Garcia', dob: new Date(2018, 9, 14), gender: 'Female', ageGroup: 'Pre-K (4-5)' },
    { firstName: 'Benjamin', lastName: 'Moore', dob: new Date(2019, 8, 7), gender: 'Male', ageGroup: 'Preschool (3-4)' }
];

// Generate parents
const parentData = [
    { firstName: 'John', lastName: 'Martinez', role: 'parent' },
    { firstName: 'Maria', lastName: 'Martinez', role: 'parent' },
    { firstName: 'Paul', lastName: 'Anderson', role: 'parent' },
    { firstName: 'Lisa', lastName: 'Thomas', role: 'parent' },
    { firstName: 'Kevin', lastName: 'Jackson', role: 'parent' },
    { firstName: 'Amanda', lastName: 'White', role: 'parent' },
    { firstName: 'Daniel', lastName: 'Harris', role: 'parent' },
    { firstName: 'Jessica', lastName: 'Martin', role: 'parent' },
    { firstName: 'Carlos', lastName: 'Thompson', role: 'parent' },
    { firstName: 'Angela', lastName: 'Garcia', role: 'parent' },
    { firstName: 'Steven', lastName: 'Moore', role: 'parent' }
];

// Generate classes
const classData = [
    { name: 'Sunshine Toddlers', ageGroup: 'Toddler (1-2)', room: 'Room A' },
    { name: 'Busy Bees', ageGroup: 'Preschool (3-4)', room: 'Room B' },
    { name: 'Future Leaders', ageGroup: 'Pre-K (4-5)', room: 'Room C' }
];

// Generate curriculum items
const curriculumData = [
    {
        title: 'Colors and Shapes',
        description: 'Introduction to basic colors and shapes through interactive activities',
        ageGroup: 'Toddler (1-2)',
        subject: 'Art',
        duration: 30,
        objectives: ['Identify primary colors', 'Recognize basic shapes', 'Develop fine motor skills'],
        materials: ['Colored paper', 'Crayons', 'Shape cutouts', 'Glue sticks'],
        activities: [
            { name: 'Color Sorting', description: 'Sort objects by color', duration: 10, instructions: 'Provide colored objects and have children sort them by color.' },
            { name: 'Shape Matching', description: 'Match shapes to outlines', duration: 10, instructions: 'Have children match shape cutouts to their outlines on paper.' }
        ]
    },
    {
        title: 'Alphabet Adventures',
        description: 'Learning the alphabet through stories, songs, and hands-on activities',
        ageGroup: 'Preschool (3-4)',
        subject: 'Language',
        duration: 45,
        objectives: ['Recognize letters A-M', 'Associate letters with sounds', 'Practice letter writing'],
        materials: ['Alphabet cards', 'Letter tracing worksheets', 'Picture books', 'Letter blocks'],
        activities: [
            { name: 'Letter Hunt', description: 'Find hidden letters around the classroom', duration: 15, instructions: 'Hide letter cards around the room and have children find them.' },
            { name: 'Alphabet Song', description: 'Sing the alphabet song with motions', duration: 10, instructions: 'Lead children in singing the alphabet song with corresponding hand motions.' }
        ]
    },
    {
        title: 'Counting to 10',
        description: 'Introduction to numbers and counting through games and activities',
        ageGroup: 'Preschool (3-4)',
        subject: 'Math',
        duration: 40,
        objectives: ['Count objects from 1-10', 'Recognize written numbers', 'Understand one-to-one correspondence'],
        materials: ['Number cards', 'Counting bears', 'Ten frames', 'Dice'],
        activities: [
            { name: 'Counting Bears', description: 'Count and sort colored bears', duration: 15, instructions: 'Have children count out specific numbers of bears and sort by color.' },
            { name: 'Number Hop', description: 'Hop on numbered floor spots', duration: 15, instructions: 'Place number cards on the floor and have children hop to each number in order.' }
        ]
    },
    {
        title: 'Weather and Seasons',
        description: 'Learning about different types of weather and the four seasons',
        ageGroup: 'Pre-K (4-5)',
        subject: 'Science',
        duration: 60,
        objectives: ['Identify different types of weather', 'Understand seasonal changes', 'Make weather observations'],
        materials: ['Weather chart', 'Season posters', 'Weather books', 'Art supplies'],
        activities: [
            { name: 'Weather Watch', description: 'Observe and record daily weather', duration: 10, instructions: 'Have children observe the weather outside and update the classroom weather chart.' },
            { name: 'Seasons Sorting', description: 'Sort pictures by season', duration: 15, instructions: 'Provide pictures of different seasons and have children sort them into categories.' }
        ]
    }
];

// Main function to add data to an existing organization
async function populateTestData() {
    try {
        // Get the first organization
        const organizationsSnapshot = await getDocs(collection(db, 'organizations'));
        if (organizationsSnapshot.empty) {
            console.error('No organizations found. Please run the init-firebase-database.js script first.');
            return;
        }

        const organizationDoc = organizationsSnapshot.docs[0];
        const organizationId = organizationDoc.id;
        console.log(`Found organization: ${organizationId}`);

        // Create staff users and profiles
        const staffMembers = [];
        for (const staff of staffData) {
            try {
                // Create auth user
                const email = generateEmail(staff.firstName, staff.lastName);
                const password = 'Password123!';

                let userId;
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    userId = userCredential.user.uid;
                    console.log(`Created auth user: ${email} with ID: ${userId}`);
                } catch (error) {
                    if (error.code === 'auth/email-already-in-use') {
                        console.log(`User ${email} already exists, skipping auth creation`);
                        // For demo purposes, we'll generate a fake user ID
                        userId = `existing-${staff.firstName.toLowerCase()}-${Date.now()}`;
                    } else {
                        throw error;
                    }
                }

                // Create user document
                await setDoc(doc(db, 'users', userId), {
                    email: email,
                    displayName: `${staff.firstName} ${staff.lastName}`,
                    photoURL: `https://ui-avatars.com/api/?name=${staff.firstName}+${staff.lastName}&background=random`,
                    phoneNumber: generatePhone(),
                    organizations: [organizationId],
                    defaultOrganization: organizationId,
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp()
                });

                // Create organization membership
                const memberRef = doc(db, `organizations/${organizationId}/members`, userId);
                await setDoc(memberRef, {
                    userId: userId,
                    role: staff.role,
                    department: staff.department,
                    title: staff.title,
                    joinDate: serverTimestamp(),
                    status: 'active',
                    permissions: getDefaultPermissions(staff.role),
                    lastAccess: serverTimestamp()
                });

                // Create staff profile
                const staffRef = doc(db, `organizations/${organizationId}/staff`, userId);
                await setDoc(staffRef, {
                    userId: userId,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    hireDate: serverTimestamp(),
                    position: staff.title,
                    qualifications: [getRandomElement(qualifications)],
                    certifications: [getRandomElement(certifications)],
                    specialties: [getRandomElement(specialties)],
                    bio: `${staff.firstName} ${staff.lastName} is an experienced educator passionate about early childhood development.`,
                    status: 'active',
                    contractType: getRandomElement(['fullTime', 'partTime', 'temporary', 'contract']),
                    schedule: daysOfWeek.reduce((acc, day) => {
                        acc[day] = { start: '8:00 AM', end: '4:00 PM' };
                        return acc;
                    }, {}),
                    documents: [],
                    emergencyContact: {
                        name: 'Emergency Contact',
                        relationship: 'Spouse',
                        phone: generatePhone()
                    },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                staffMembers.push({
                    id: userId,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    role: staff.role,
                    title: staff.title
                });

                console.log(`Created staff member: ${staff.firstName} ${staff.lastName}`);
            } catch (error) {
                console.error(`Error creating staff member ${staff.firstName} ${staff.lastName}:`, error);
            }
        }

        // Create classes
        const classes = [];
        for (const classInfo of classData) {
            // Filter teachers by age group
            const eligibleTeachers = staffMembers.filter(s => s.role === 'teacher');
            const assignedTeachers = eligibleTeachers.slice(0, 2).map(t => t.id);
            const assistants = staffMembers.filter(s => s.title.includes('Assistant')).map(a => a.id);

            const classRef = doc(collection(db, `organizations/${organizationId}/classes`));
            await setDoc(classRef, {
                name: classInfo.name,
                ageGroup: classInfo.ageGroup,
                description: `A ${classInfo.ageGroup} class focused on development through play and exploration.`,
                capacity: 12,
                assignedTeachers: assignedTeachers,
                assignedStaff: assistants,
                schedule: daysOfWeek.reduce((acc, day) => {
                    acc[day] = true;
                    return acc;
                }, {}),
                room: classInfo.room,
                active: true,
                academicYear: '2023-2024',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            classes.push({
                id: classRef.id,
                name: classInfo.name,
                ageGroup: classInfo.ageGroup
            });

            console.log(`Created class: ${classInfo.name}`);
        }

        // Create parent users
        const parents = [];
        for (const parent of parentData) {
            try {
                const email = generateEmail(parent.firstName, parent.lastName);
                const password = 'Password123!';

                let userId;
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    userId = userCredential.user.uid;
                    console.log(`Created parent user: ${email} with ID: ${userId}`);
                } catch (error) {
                    if (error.code === 'auth/email-already-in-use') {
                        console.log(`User ${email} already exists, skipping auth creation`);
                        // For demo purposes, we'll generate a fake user ID
                        userId = `existing-${parent.firstName.toLowerCase()}-${Date.now()}`;
                    } else {
                        throw error;
                    }
                }

                // Create user document
                await setDoc(doc(db, 'users', userId), {
                    email: email,
                    displayName: `${parent.firstName} ${parent.lastName}`,
                    photoURL: `https://ui-avatars.com/api/?name=${parent.firstName}+${parent.lastName}&background=random`,
                    phoneNumber: generatePhone(),
                    organizations: [organizationId],
                    defaultOrganization: organizationId,
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp()
                });

                // Create organization membership
                const memberRef = doc(db, `organizations/${organizationId}/members`, userId);
                await setDoc(memberRef, {
                    userId: userId,
                    role: 'parent',
                    joinDate: serverTimestamp(),
                    status: 'active',
                    permissions: getDefaultPermissions('parent'),
                    lastAccess: serverTimestamp()
                });

                parents.push({
                    id: userId,
                    firstName: parent.firstName,
                    lastName: parent.lastName
                });

                console.log(`Created parent: ${parent.firstName} ${parent.lastName}`);
            } catch (error) {
                console.error(`Error creating parent ${parent.firstName} ${parent.lastName}:`, error);
            }
        }

        // Create students and link to parents
        const students = [];
        const batch = writeBatch(db);

        for (let i = 0; i < studentData.length; i++) {
            const student = studentData[i];
            const studentRef = doc(collection(db, `organizations/${organizationId}/students`));

            // Link to appropriate class based on age group
            const studentClass = classes.find(c => c.ageGroup === student.ageGroup);

            // Find a matching parent by last name if possible
            let assignedParents = [];
            const matchingParents = parents.filter(p => p.lastName === student.lastName);
            if (matchingParents.length > 0) {
                assignedParents = matchingParents;
            } else {
                // Or assign random parents
                assignedParents = [getRandomElement(parents)];
            }

            batch.set(studentRef, {
                firstName: student.firstName,
                lastName: student.lastName,
                fullName: `${student.firstName} ${student.lastName}`,
                dateOfBirth: Timestamp.fromDate(student.dob),
                gender: student.gender,
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zip: '90210',
                    country: 'USA'
                },
                photo: `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`,
                enrollmentDate: Timestamp.fromDate(new Date(2023, 7, 15)),
                exitDate: null,
                status: 'active',
                ageGroup: student.ageGroup,
                medicalInfo: {
                    allergies: [getRandomElement(allergies)],
                    medications: [getRandomElement(medications)],
                    conditions: [getRandomElement(medicalConditions)],
                    doctorName: 'Dr. Smith',
                    doctorPhone: generatePhone(),
                    emergencyContact: {
                        name: `${assignedParents[0].firstName} ${assignedParents[0].lastName}`,
                        phone: generatePhone(),
                        relationship: getRandomElement(relationships)
                    }
                },
                notes: 'Student is adjusting well to the classroom environment.',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Create guardian relationship for each assigned parent
            for (const parent of assignedParents) {
                const guardianRef = doc(db, `organizations/${organizationId}/students/${studentRef.id}/guardians`, parent.id);
                batch.set(guardianRef, {
                    userId: parent.id,
                    relationship: parent.lastName === student.lastName ? getRandomElement(['Mother', 'Father']) : 'Guardian',
                    isPrimary: true,
                    pickupAuthorized: true,
                    emergencyContact: true,
                    contactPriority: 1
                });
            }

            // Create class enrollment
            if (studentClass) {
                const enrollmentRef = doc(db, `organizations/${organizationId}/classes/${studentClass.id}/enrollments`, studentRef.id);
                batch.set(enrollmentRef, {
                    studentId: studentRef.id,
                    enrollmentDate: Timestamp.fromDate(new Date(2023, 7, 15)),
                    status: 'active',
                    notes: ''
                });
            }

            students.push({
                id: studentRef.id,
                firstName: student.firstName,
                lastName: student.lastName,
                ageGroup: student.ageGroup,
                class: studentClass ? studentClass.id : null
            });

            console.log(`Prepared student: ${student.firstName} ${student.lastName}`);
        }

        await batch.commit();
        console.log('Created all students and enrollments');

        // Create curriculum items
        for (const curriculum of curriculumData) {
            // Assign to a random teacher
            const teacher = staffMembers.find(staff => staff.role === 'teacher');

            const curriculumRef = doc(collection(db, `organizations/${organizationId}/curriculum`));
            await setDoc(curriculumRef, {
                title: curriculum.title,
                description: curriculum.description,
                ageGroup: curriculum.ageGroup,
                subject: curriculum.subject,
                duration: curriculum.duration,
                objectives: curriculum.objectives,
                materials: curriculum.materials,
                activities: curriculum.activities.map(activity => ({
                    name: activity.name,
                    description: activity.description,
                    duration: activity.duration,
                    instructions: activity.instructions
                })),
                assessments: [
                    { name: 'Participation', criteria: 'Active engagement in activities' },
                    { name: 'Skill Development', criteria: 'Progress in meeting learning objectives' }
                ],
                documents: [],
                createdBy: teacher ? teacher.id : staffMembers[0].id,
                targetDate: Timestamp.fromDate(randomDate(new Date(2023, 8, 1), new Date(2023, 11, 31))),
                status: getRandomElement(['draft', 'approved', 'completed']),
                tags: [curriculum.subject, curriculum.ageGroup],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log(`Created curriculum item: ${curriculum.title}`);
        }

        // Create attendance records for the last 5 days
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Create attendance for each class
            for (const classInfo of classes) {
                // Get students in this class
                const classStudents = students.filter(s => s.class === classInfo.id);

                if (classStudents.length === 0) continue;

                const attendanceData = {};
                classStudents.forEach(student => {
                    const isPresent = Math.random() > 0.2; // 80% chance of attendance
                    attendanceData[student.id] = {
                        status: isPresent ? 'present' : (Math.random() > 0.5 ? 'absent' : 'excused'),
                        arrivalTime: isPresent ? Timestamp.fromDate(new Date(date.setHours(8, Math.floor(Math.random() * 30)))) : null,
                        departureTime: isPresent ? Timestamp.fromDate(new Date(date.setHours(15, 30 + Math.floor(Math.random() * 30)))) : null,
                        notes: ''
                    };
                });

                const teacher = staffMembers.find(staff => staff.role === 'teacher');

                const attendanceRef = doc(db, `organizations/${organizationId}/attendance/${dateStr}/classes`, classInfo.id);
                await setDoc(attendanceRef, {
                    date: Timestamp.fromDate(date),
                    classId: classInfo.id,
                    students: attendanceData,
                    recordedBy: teacher ? teacher.id : staffMembers[0].id,
                    updatedBy: teacher ? teacher.id : staffMembers[0].id,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                console.log(`Created attendance record for ${classInfo.name} on ${dateStr}`);
            }
        }

        console.log('All test data has been populated successfully!');
        console.log('\nCredentials for testing:');

        // Output credentials for each role
        const adminStaff = staffMembers.find(staff => staff.role === 'admin');
        if (adminStaff) {
            console.log(`\nAdmin User: ${generateEmail(adminStaff.firstName, adminStaff.lastName)}`);
            console.log('Password: Password123!');
        }

        const teacher = staffMembers.find(staff => staff.role === 'teacher');
        if (teacher) {
            console.log(`\nTeacher User: ${generateEmail(teacher.firstName, teacher.lastName)}`);
            console.log('Password: Password123!');
        }

        if (parents.length > 0) {
            console.log(`\nParent User: ${generateEmail(parents[0].firstName, parents[0].lastName)}`);
            console.log('Password: Password123!');
        }

    } catch (error) {
        console.error('Error populating test data:', error);
    }
}

// Get default permissions based on role
function getDefaultPermissions(role) {
    switch (role) {
        case 'admin':
            return {
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
            };
        case 'teacher':
            return {
                students: { view: true, create: false, edit: true, delete: false },
                staff: { view: true, create: false, edit: false, delete: false },
                curriculum: { view: true, create: true, edit: true, delete: false },
                messages: { view: true, create: true, edit: true, delete: true },
                attendance: { view: true, create: true, edit: true, delete: false },
                reports: { view: true, create: true, edit: false, delete: false },
                analytics: { view: true, create: false, edit: false, delete: false },
                billing: { view: false, create: false, edit: false, delete: false },
                settings: { view: true, create: false, edit: false, delete: false },
                permissions: { view: false, create: false, edit: false, delete: false },
                help: { view: true, create: true, edit: false, delete: false }
            };
        case 'staff':
            return {
                students: { view: true, create: false, edit: false, delete: false },
                staff: { view: true, create: false, edit: false, delete: false },
                curriculum: { view: true, create: false, edit: false, delete: false },
                messages: { view: true, create: true, edit: true, delete: false },
                attendance: { view: true, create: true, edit: true, delete: false },
                reports: { view: true, create: false, edit: false, delete: false },
                analytics: { view: false, create: false, edit: false, delete: false },
                billing: { view: false, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                permissions: { view: false, create: false, edit: false, delete: false },
                help: { view: true, create: false, edit: false, delete: false }
            };
        case 'parent':
            return {
                students: { view: true, create: false, edit: false, delete: false },
                staff: { view: true, create: false, edit: false, delete: false },
                curriculum: { view: true, create: false, edit: false, delete: false },
                messages: { view: true, create: true, edit: false, delete: false },
                attendance: { view: true, create: false, edit: false, delete: false },
                reports: { view: true, create: false, edit: false, delete: false },
                analytics: { view: false, create: false, edit: false, delete: false },
                billing: { view: true, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                permissions: { view: false, create: false, edit: false, delete: false },
                help: { view: true, create: false, edit: false, delete: false }
            };
        default:
            return {
                students: { view: false, create: false, edit: false, delete: false },
                staff: { view: false, create: false, edit: false, delete: false },
                curriculum: { view: false, create: false, edit: false, delete: false },
                messages: { view: false, create: false, edit: false, delete: false },
                attendance: { view: false, create: false, edit: false, delete: false },
                reports: { view: false, create: false, edit: false, delete: false },
                analytics: { view: false, create: false, edit: false, delete: false },
                billing: { view: false, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                permissions: { view: false, create: false, edit: false, delete: false },
                help: { view: true, create: false, edit: false, delete: false }
            };
    }
}

// Run the script
populateTestData()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 