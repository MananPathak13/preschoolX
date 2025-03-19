"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';

const organizationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'Province/State is required'),
        zip: z.string().min(5, 'ZIP/Postal code must be at least 5 characters'),
        country: z.string().min(1, 'Country is required'),
    }),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    description: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function OrganizationForm({ organizationId }: { organizationId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: {
                street: '',
                city: '',
                state: '',
                zip: '',
                country: '',
            },
            website: '',
            description: '',
        },
    });

    async function onSubmit(data: OrganizationFormValues) {
        try {
            setIsLoading(true);

            // Update organization document
            await setDoc(doc(db, 'organizations', organizationId), {
                ...data,
                onboardingStatus: 'staff-setup',
                active: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            toast({
                title: "Organization details saved",
                description: "Let's set up your staff members next."
            });

            // Navigate to staff setup
            router.push(`/onboarding/${organizationId}/staff-setup`);
        } catch (error) {
            console.error('Error saving organization:', error);
            toast({
                title: 'Error',
                description: 'Failed to save organization details. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Organization Name</FormLabel>
                            <FormControl>
                                <Input className="border-gray-200" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">Organization Email</FormLabel>
                                <FormControl>
                                    <Input className="border-gray-200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">Organization Phone</FormLabel>
                                <FormControl>
                                    <Input className="border-gray-200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Street Address</FormLabel>
                            <FormControl>
                                <Input className="border-gray-200" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">City</FormLabel>
                                <FormControl>
                                    <Input className="border-gray-200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">Province/State</FormLabel>
                                <FormControl>
                                    <Input className="border-gray-200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="address.zip"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">ZIP/Postal Code</FormLabel>
                                <FormControl>
                                    <Input className="border-gray-200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">Country</FormLabel>
                                <FormControl>
                                    <Input className="border-gray-200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Website (Optional)</FormLabel>
                            <FormControl>
                                <Input className="border-gray-200" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="resize-none border-gray-200"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Continue to Staff Setup'}
                </Button>
            </form>
        </Form>
    );
} 