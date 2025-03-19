import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateTemporaryPassword } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';

const staffMemberSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'teacher', 'staff']),
    department: z.string().min(1, 'Department is required'),
    title: z.string().min(1, 'Job title is required'),
});

const staffSetupSchema = z.object({
    staffMembers: z.array(staffMemberSchema).min(1, 'At least one staff member is required'),
});

type StaffSetupFormValues = z.infer<typeof staffSetupSchema>;

export function StaffSetupForm({ organizationId }: { organizationId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<StaffSetupFormValues>({
        resolver: zodResolver(staffSetupSchema),
        defaultValues: {
            staffMembers: [
                {
                    name: '',
                    email: '',
                    role: 'admin',
                    department: '',
                    title: '',
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'staffMembers',
    });

    async function onSubmit(data: StaffSetupFormValues) {
        try {
            setIsLoading(true);
            const batch = writeBatch(db);

            // Create staff members and send invites
            for (const staffMember of data.staffMembers) {
                const tempPassword = generateTemporaryPassword();

                // Create user document
                const userRef = doc(collection(db, 'users'));
                batch.set(userRef, {
                    email: staffMember.email,
                    displayName: staffMember.name,
                    organizations: [organizationId],
                    defaultOrganization: organizationId,
                    createdAt: serverTimestamp(),
                    lastLoginAt: null,
                });

                // Create organization member document
                const memberRef = doc(db, 'organizations', organizationId, 'members', userRef.id);
                batch.set(memberRef, {
                    userId: userRef.id,
                    role: staffMember.role,
                    department: staffMember.department,
                    title: staffMember.title,
                    joinDate: serverTimestamp(),
                    status: 'pending',
                    permissions: getDefaultPermissions(staffMember.role),
                });

                // Create pending invite
                const inviteRef = doc(db, 'organizations', organizationId, 'pendingInvites', userRef.id);
                batch.set(inviteRef, {
                    email: staffMember.email,
                    tempPassword,
                    role: staffMember.role,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    createdAt: serverTimestamp(),
                });
            }

            // Update organization status
            const orgRef = doc(db, 'organizations', organizationId);
            batch.update(orgRef, {
                onboardingStatus: 'programs-setup',
                updatedAt: serverTimestamp(),
            });

            await batch.commit();

            toast({
                title: 'Staff members added',
                description: 'Invitations will be sent to the staff members.',
            });

            // Navigate to programs setup
            router.push(`/onboarding/${organizationId}/programs`);
        } catch (error) {
            console.error('Error setting up staff:', error);
            toast({
                title: 'Error',
                description: 'Failed to set up staff members. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Staff Member {index + 1}</h3>
                                {index > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`staffMembers.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`staffMembers.${index}.email`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`staffMembers.${index}.role`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                    <SelectItem value="teacher">Teacher</SelectItem>
                                                    <SelectItem value="staff">Staff</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`staffMembers.${index}.department`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Administration" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`staffMembers.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Director" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        append({
                            name: '',
                            email: '',
                            role: 'staff',
                            department: '',
                            title: '',
                        })
                    }
                >
                    Add Another Staff Member
                </Button>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Continue to Programs Setup'}
                </Button>
            </form>
        </Form>
    );
}

function getDefaultPermissions(role: string) {
    switch (role) {
        case 'admin':
            return {
                students: { view: true, create: true, edit: true, delete: true },
                staff: { view: true, create: true, edit: true, delete: true },
                curriculum: { view: true, create: true, edit: true, delete: true },
                attendance: { view: true, create: true, edit: true, delete: true },
                settings: { view: true, create: true, edit: true, delete: true },
                permissions: { view: true, create: true, edit: true, delete: true },
            };
        case 'teacher':
            return {
                students: { view: true, create: false, edit: true, delete: false },
                staff: { view: true, create: false, edit: false, delete: false },
                curriculum: { view: true, create: true, edit: true, delete: false },
                attendance: { view: true, create: true, edit: true, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                permissions: { view: false, create: false, edit: false, delete: false },
            };
        default:
            return {
                students: { view: true, create: false, edit: false, delete: false },
                staff: { view: true, create: false, edit: false, delete: false },
                curriculum: { view: true, create: false, edit: false, delete: false },
                attendance: { view: true, create: true, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                permissions: { view: false, create: false, edit: false, delete: false },
            };
    }
} 