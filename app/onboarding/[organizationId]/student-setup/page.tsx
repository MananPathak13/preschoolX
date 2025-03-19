"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface Guardian {
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phone: string;
}

interface Student {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    guardians: Guardian[];
    allergies: string[];
    notes: string;
}

export default function StudentSetup({
    params,
}: {
    params: { organizationId: string };
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [currentStudent, setCurrentStudent] = useState<Student>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        guardians: [{
            firstName: '',
            lastName: '',
            relationship: '',
            email: '',
            phone: '',
        }],
        allergies: [],
        notes: '',
    });
    const router = useRouter();
    const { toast } = useToast();

    const addStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStudent.firstName || !currentStudent.lastName || !currentStudent.dateOfBirth) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const studentsCollection = collection(db, `organizations/${params.organizationId}/students`);
            await addDoc(studentsCollection, {
                ...currentStudent,
                allergies: currentStudent.allergies.filter(Boolean),
                startDate: serverTimestamp(),
                createdAt: serverTimestamp(),
            });

            setStudents([...students, currentStudent]);
            setCurrentStudent({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                guardians: [{
                    firstName: '',
                    lastName: '',
                    relationship: '',
                    email: '',
                    phone: '',
                }],
                allergies: [],
                notes: '',
            });

            toast({
                title: "Student added",
                description: "The student has been added successfully",
            });
        } catch (error) {
            console.error('Error adding student:', error);
            toast({
                title: "Error",
                description: "Failed to add student",
                variant: "destructive",
            });
        }
    };

    async function onContinue() {
        try {
            setIsLoading(true);

            // If no students were added, generate sample data
            if (students.length === 0) {
                const sampleStudents = [
                    {
                        firstName: "Emma",
                        lastName: "Smith",
                        dateOfBirth: "2022-02-15",
                        guardians: [{
                            firstName: "John",
                            lastName: "Smith",
                            relationship: "Father",
                            email: "john.smith@example.com",
                            phone: "555-0123",
                        }],
                        allergies: [],
                        notes: "Loves music and dancing",
                    },
                    {
                        firstName: "Lucas",
                        lastName: "Garcia",
                        dateOfBirth: "2020-07-20",
                        guardians: [{
                            firstName: "Maria",
                            lastName: "Garcia",
                            relationship: "Mother",
                            email: "maria.garcia@example.com",
                            phone: "555-0124",
                        }],
                        allergies: ["Peanuts"],
                        notes: "Enjoys art and storytelling",
                    },
                ];

                const studentsCollection = collection(db, `organizations/${params.organizationId}/students`);
                for (const student of sampleStudents) {
                    await addDoc(studentsCollection, {
                        ...student,
                        startDate: serverTimestamp(),
                        createdAt: serverTimestamp(),
                    });
                }
            }

            // Update organization status
            await setDoc(doc(db, 'organizations', params.organizationId), {
                onboardingStatus: 'terms-acceptance',
                updatedAt: serverTimestamp(),
            }, { merge: true });

            toast({
                title: "Moving to final step",
                description: "Let's review and accept the terms and conditions."
            });

            router.push(`/onboarding/${params.organizationId}/terms-acceptance`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error',
                description: 'Failed to proceed to next step. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-900">Student Information</h2>
                <p className="text-sm text-gray-600">
                    Add your students now or proceed with sample data.
                </p>
            </div>

            <form onSubmit={addStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        placeholder="First Name"
                        value={currentStudent.firstName}
                        onChange={(e) => setCurrentStudent({ ...currentStudent, firstName: e.target.value })}
                    />
                    <Input
                        placeholder="Last Name"
                        value={currentStudent.lastName}
                        onChange={(e) => setCurrentStudent({ ...currentStudent, lastName: e.target.value })}
                    />
                </div>
                <Input
                    type="date"
                    placeholder="Date of Birth"
                    value={currentStudent.dateOfBirth}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, dateOfBirth: e.target.value })}
                />

                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Guardian Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="Guardian First Name"
                            value={currentStudent.guardians[0].firstName}
                            onChange={(e) => setCurrentStudent({
                                ...currentStudent,
                                guardians: [{
                                    ...currentStudent.guardians[0],
                                    firstName: e.target.value
                                }]
                            })}
                        />
                        <Input
                            placeholder="Guardian Last Name"
                            value={currentStudent.guardians[0].lastName}
                            onChange={(e) => setCurrentStudent({
                                ...currentStudent,
                                guardians: [{
                                    ...currentStudent.guardians[0],
                                    lastName: e.target.value
                                }]
                            })}
                        />
                    </div>
                    <Input
                        placeholder="Relationship to Student"
                        value={currentStudent.guardians[0].relationship}
                        onChange={(e) => setCurrentStudent({
                            ...currentStudent,
                            guardians: [{
                                ...currentStudent.guardians[0],
                                relationship: e.target.value
                            }]
                        })}
                    />
                    <Input
                        type="email"
                        placeholder="Guardian Email"
                        value={currentStudent.guardians[0].email}
                        onChange={(e) => setCurrentStudent({
                            ...currentStudent,
                            guardians: [{
                                ...currentStudent.guardians[0],
                                email: e.target.value
                            }]
                        })}
                    />
                    <Input
                        placeholder="Guardian Phone"
                        value={currentStudent.guardians[0].phone}
                        onChange={(e) => setCurrentStudent({
                            ...currentStudent,
                            guardians: [{
                                ...currentStudent.guardians[0],
                                phone: e.target.value
                            }]
                        })}
                    />
                </div>

                <Input
                    placeholder="Allergies (comma-separated)"
                    value={currentStudent.allergies.join(', ')}
                    onChange={(e) => setCurrentStudent({
                        ...currentStudent,
                        allergies: e.target.value.split(',').map(s => s.trim())
                    })}
                />
                <Textarea
                    placeholder="Additional Notes"
                    value={currentStudent.notes}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, notes: e.target.value })}
                />
                <Button type="submit" variant="outline">Add Student</Button>
            </form>

            {students.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Added Students:</h3>
                    <ul className="space-y-2">
                        {students.map((student, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {student.firstName} {student.lastName} - Guardian: {student.guardians[0].firstName} {student.guardians[0].lastName}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/students')}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                    I'll do this later
                </Button>
                <Button
                    onClick={onContinue}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isLoading ? 'Saving...' : 'Continue to Terms & Conditions'}
                </Button>
            </div>
        </div>
    );
} 