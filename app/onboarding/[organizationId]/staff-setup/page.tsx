"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { generateTemporaryPassword } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface StaffMember {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export default function StaffSetup({
    params,
}: {
    params: { organizationId: string };
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [currentStaff, setCurrentStaff] = useState<StaffMember>({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
    });
    const router = useRouter();
    const { toast } = useToast();

    const addStaffMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStaff.firstName || !currentStaff.lastName || !currentStaff.email || !currentStaff.role) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const userRef = doc(db, `organizations/${params.organizationId}/users`, currentStaff.email);
            const tempPassword = generateTemporaryPassword();

            // Set permissions based on role
            let permissions = {
                students: { view: true, create: false, edit: false, delete: false },
                staff: { view: true, create: false, edit: false, delete: false },
                programs: { view: true, create: false, edit: false, delete: false },
                attendance: { view: true, create: true, edit: true, delete: false },
            };

            if (currentStaff.role === 'admin') {
                permissions = {
                    students: { view: true, create: true, edit: true, delete: true },
                    staff: { view: true, create: true, edit: true, delete: true },
                    programs: { view: true, create: true, edit: true, delete: true },
                    attendance: { view: true, create: true, edit: true, delete: true },
                };
            } else if (currentStaff.role === 'teacher') {
                permissions = {
                    ...permissions,
                    students: { view: true, create: true, edit: true, delete: false },
                    attendance: { view: true, create: true, edit: true, delete: false },
                    programs: { view: true, create: false, edit: false, delete: false },
                };
            }

            await setDoc(userRef, {
                ...currentStaff,
                status: "pending",
                temporaryPassword: tempPassword,
                permissions,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setStaffMembers([...staffMembers, currentStaff]);
            setCurrentStaff({
                firstName: '',
                lastName: '',
                email: '',
                role: '',
            });

            toast({
                title: "Staff member added",
                description: "A temporary password will be sent to their email address.",
            });
        } catch (error) {
            console.error('Error adding staff member:', error);
            toast({
                title: "Error",
                description: "Failed to add staff member",
                variant: "destructive",
            });
        }
    };

    async function onContinue() {
        try {
            setIsLoading(true);

            // If no staff members were added, generate sample data
            if (staffMembers.length === 0) {
                const sampleStaff = [
                    {
                        email: "lead.teacher@example.com",
                        firstName: "Sarah",
                        lastName: "Johnson",
                        role: "teacher",
                    },
                    {
                        email: "admin@example.com",
                        firstName: "Michael",
                        lastName: "Chen",
                        role: "admin",
                    },
                ];

                for (const staff of sampleStaff) {
                    const userRef = doc(db, `organizations/${params.organizationId}/users`, staff.email);
                    const tempPassword = generateTemporaryPassword();
                    const permissions = staff.role === 'admin' ? {
                        students: { view: true, create: true, edit: true, delete: true },
                        staff: { view: true, create: true, edit: true, delete: true },
                        programs: { view: true, create: true, edit: true, delete: true },
                        attendance: { view: true, create: true, edit: true, delete: true },
                    } : {
                        students: { view: true, create: true, edit: true, delete: false },
                        staff: { view: true, create: false, edit: false, delete: false },
                        programs: { view: true, create: false, edit: false, delete: false },
                        attendance: { view: true, create: true, edit: true, delete: false },
                    };

                    await setDoc(userRef, {
                        ...staff,
                        status: "pending",
                        temporaryPassword: tempPassword,
                        permissions,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                }
            }

            // Update organization status
            await setDoc(doc(db, 'organizations', params.organizationId), {
                onboardingStatus: 'programs-setup',
                updatedAt: serverTimestamp(),
            }, { merge: true });

            toast({
                title: "Moving to next step",
                description: "Let's set up your programs and classes."
            });

            router.push(`/onboarding/${params.organizationId}/programs-setup`);
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
                <h2 className="text-lg font-medium text-gray-900">Staff Setup</h2>
                <p className="text-sm text-gray-600">
                    Add your staff members now or proceed with sample data.
                </p>
            </div>

            <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                    Staff members will receive a temporary password via email to access the system.
                </AlertDescription>
            </Alert>

            <form onSubmit={addStaffMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        placeholder="First Name"
                        value={currentStaff.firstName}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, firstName: e.target.value })}
                    />
                    <Input
                        placeholder="Last Name"
                        value={currentStaff.lastName}
                        onChange={(e) => setCurrentStaff({ ...currentStaff, lastName: e.target.value })}
                    />
                </div>
                <Input
                    type="email"
                    placeholder="Email"
                    value={currentStaff.email}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                />
                <Select
                    value={currentStaff.role}
                    onValueChange={(value) => setCurrentStaff({ ...currentStaff, role: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="staff">Other Staff</SelectItem>
                    </SelectContent>
                </Select>
                <Button type="submit" variant="outline">Add Staff Member</Button>
            </form>

            {staffMembers.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Added Staff Members:</h3>
                    <ul className="space-y-2">
                        {staffMembers.map((staff, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {staff.firstName} {staff.lastName} - {staff.role}
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
                    {isLoading ? 'Saving...' : 'Continue to Programs Setup'}
                </Button>
            </div>
        </div>
    );
} 