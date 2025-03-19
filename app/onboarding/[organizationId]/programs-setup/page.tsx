"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface Program {
    name: string;
    ageRange: string;
    description: string;
    capacity: number;
    schedule: string;
    startDate: string;
    endDate: string;
}

export default function ProgramsSetup({
    params,
}: {
    params: { organizationId: string };
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [currentProgram, setCurrentProgram] = useState<Program>({
        name: '',
        ageRange: '',
        description: '',
        capacity: 0,
        schedule: '',
        startDate: '',
        endDate: '',
    });
    const router = useRouter();
    const { toast } = useToast();

    const addProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProgram.name || !currentProgram.ageRange || !currentProgram.description ||
            !currentProgram.capacity || !currentProgram.startDate || !currentProgram.endDate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Validate dates
        const start = new Date(currentProgram.startDate);
        const end = new Date(currentProgram.endDate);
        if (end <= start) {
            toast({
                title: "Invalid Dates",
                description: "End date must be after start date",
                variant: "destructive",
            });
            return;
        }

        try {
            const programsCollection = collection(db, `organizations/${params.organizationId}/programs`);
            await addDoc(programsCollection, {
                ...currentProgram,
                createdAt: serverTimestamp(),
            });

            setPrograms([...programs, currentProgram]);
            setCurrentProgram({
                name: '',
                ageRange: '',
                description: '',
                capacity: 0,
                schedule: '',
                startDate: '',
                endDate: '',
            });

            toast({
                title: "Program added",
                description: "The program has been created successfully",
            });
        } catch (error) {
            console.error('Error adding program:', error);
            toast({
                title: "Error",
                description: "Failed to add program",
                variant: "destructive",
            });
        }
    };

    async function onContinue() {
        try {
            setIsLoading(true);

            // If no programs were added, generate sample data
            if (programs.length === 0) {
                const today = new Date();
                const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

                const samplePrograms = [
                    {
                        name: "Toddler Program",
                        ageRange: "18-36 months",
                        description: "A nurturing environment for toddlers to explore and learn through play",
                        capacity: 12,
                        schedule: "Monday-Friday, 8:00 AM - 3:00 PM",
                        startDate: today.toISOString().split('T')[0],
                        endDate: nextYear.toISOString().split('T')[0],
                    },
                    {
                        name: "Preschool Program",
                        ageRange: "3-5 years",
                        description: "Comprehensive early education focusing on social, emotional, and cognitive development",
                        capacity: 15,
                        schedule: "Monday-Friday, 8:00 AM - 3:00 PM",
                        startDate: today.toISOString().split('T')[0],
                        endDate: nextYear.toISOString().split('T')[0],
                    },
                ];

                const programsCollection = collection(db, `organizations/${params.organizationId}/programs`);
                for (const program of samplePrograms) {
                    await addDoc(programsCollection, {
                        ...program,
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
                title: "Moving to next step",
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
                <h2 className="text-lg font-medium text-gray-900">Programs & Classes</h2>
                <p className="text-sm text-gray-600">
                    Add your programs now or proceed with sample data.
                </p>
            </div>

            <form onSubmit={addProgram} className="space-y-4">
                <Input
                    placeholder="Program Name"
                    value={currentProgram.name}
                    onChange={(e) => setCurrentProgram({ ...currentProgram, name: e.target.value })}
                />
                <Input
                    placeholder="Age Range (e.g., 2-3 years)"
                    value={currentProgram.ageRange}
                    onChange={(e) => setCurrentProgram({ ...currentProgram, ageRange: e.target.value })}
                />
                <Textarea
                    placeholder="Program Description"
                    value={currentProgram.description}
                    onChange={(e) => setCurrentProgram({ ...currentProgram, description: e.target.value })}
                />
                <Input
                    type="number"
                    placeholder="Capacity"
                    value={currentProgram.capacity || ''}
                    onChange={(e) => setCurrentProgram({ ...currentProgram, capacity: parseInt(e.target.value) || 0 })}
                />
                <Input
                    placeholder="Schedule (e.g., Monday-Friday, 8:00 AM - 3:00 PM)"
                    value={currentProgram.schedule}
                    onChange={(e) => setCurrentProgram({ ...currentProgram, schedule: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                        <Input
                            type="date"
                            value={currentProgram.startDate}
                            onChange={(e) => setCurrentProgram({ ...currentProgram, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">End Date</label>
                        <Input
                            type="date"
                            value={currentProgram.endDate}
                            onChange={(e) => setCurrentProgram({ ...currentProgram, endDate: e.target.value })}
                        />
                    </div>
                </div>
                <Button type="submit" variant="outline">Add Program</Button>
            </form>

            {programs.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Added Programs:</h3>
                    <ul className="space-y-2">
                        {programs.map((program, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {program.name} - Ages: {program.ageRange}, Capacity: {program.capacity}
                                <br />
                                <span className="text-xs text-gray-500">
                                    {program.startDate} to {program.endDate}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex items-center justify-end pt-4">
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