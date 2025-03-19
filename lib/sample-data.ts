import { db } from "@/lib/firebase";
import { generateTemporaryPassword } from "@/lib/utils";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";

export async function generateSampleData(organizationId: string) {
    // Sample staff members
    const staffCollection = collection(db, `organizations/${organizationId}/staff`);
    await addDoc(staffCollection, {
        email: "lead.teacher@example.com",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "Lead Teacher",
        status: "pending",
        temporaryPassword: generateTemporaryPassword(),
        createdAt: Timestamp.now(),
    });

    await addDoc(staffCollection, {
        email: "assistant@example.com",
        firstName: "Michael",
        lastName: "Chen",
        role: "Assistant Teacher",
        status: "pending",
        temporaryPassword: generateTemporaryPassword(),
        createdAt: Timestamp.now(),
    });

    // Sample programs
    const programsCollection = collection(db, `organizations/${organizationId}/programs`);
    const toddlerProgram = await addDoc(programsCollection, {
        name: "Toddler Program",
        ageRange: "18-36 months",
        description: "A nurturing environment for toddlers to explore and learn through play",
        capacity: 12,
        schedule: "Monday-Friday, 8:00 AM - 3:00 PM",
        createdAt: Timestamp.now(),
    });

    const preschoolProgram = await addDoc(programsCollection, {
        name: "Preschool Program",
        ageRange: "3-5 years",
        description: "Comprehensive early education focusing on social, emotional, and cognitive development",
        capacity: 15,
        schedule: "Monday-Friday, 8:00 AM - 3:00 PM",
        createdAt: Timestamp.now(),
    });

    // Sample students
    const studentsCollection = collection(db, `organizations/${organizationId}/students`);
    await addDoc(studentsCollection, {
        firstName: "Emma",
        lastName: "Smith",
        dateOfBirth: Timestamp.fromDate(new Date(2022, 1, 15)), // 2 years old
        programId: toddlerProgram.id,
        guardians: [
            {
                firstName: "John",
                lastName: "Smith",
                relationship: "Father",
                email: "john.smith@example.com",
                phone: "555-0123",
            }
        ],
        allergies: [],
        notes: "Loves music and dancing",
        startDate: Timestamp.now(),
        createdAt: Timestamp.now(),
    });

    await addDoc(studentsCollection, {
        firstName: "Lucas",
        lastName: "Garcia",
        dateOfBirth: Timestamp.fromDate(new Date(2020, 6, 20)), // 3.5 years old
        programId: preschoolProgram.id,
        guardians: [
            {
                firstName: "Maria",
                lastName: "Garcia",
                relationship: "Mother",
                email: "maria.garcia@example.com",
                phone: "555-0124",
            }
        ],
        allergies: ["Peanuts"],
        notes: "Enjoys art and storytelling",
        startDate: Timestamp.now(),
        createdAt: Timestamp.now(),
    });
} 