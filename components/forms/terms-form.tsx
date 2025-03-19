import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

const termsSchema = z.object({
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions to continue',
    }),
});

type TermsFormValues = z.infer<typeof termsSchema>;

export function TermsForm({ organizationId }: { organizationId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<TermsFormValues>({
        resolver: zodResolver(termsSchema),
        defaultValues: {
            acceptTerms: false,
        },
    });

    async function onSubmit(data: TermsFormValues) {
        try {
            setIsLoading(true);

            // Update organization document
            await setDoc(
                doc(db, 'organizations', organizationId),
                {
                    onboardingStatus: 'completed',
                    termsAccepted: true,
                    termsAcceptedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            toast({
                title: 'Setup complete!',
                description: 'Your preschool is now ready to use PreschoolPro.',
            });

            // Navigate to dashboard
            router.push(`/dashboard/${organizationId}`);
        } catch (error) {
            console.error('Error accepting terms:', error);
            toast({
                title: 'Error',
                description: 'Failed to complete setup. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                        <h3>Terms of Service</h3>
                        <p>
                            Welcome to PreschoolPro. By using our service, you agree to the following terms and conditions:
                        </p>

                        <h4>1. Service Description</h4>
                        <p>
                            PreschoolPro provides a cloud-based preschool management system that helps preschools manage their daily operations, including student records, staff management, attendance tracking, and parent communication.
                        </p>

                        <h4>2. User Accounts</h4>
                        <p>
                            You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                        </p>

                        <h4>3. Data Privacy</h4>
                        <p>
                            We take data privacy seriously. All student and staff information is encrypted and stored securely. We comply with relevant data protection regulations and never share personal information with third parties without consent.
                        </p>

                        <h4>4. Payment Terms</h4>
                        <p>
                            Service fees are billed monthly based on your subscription plan. Payments are non-refundable and automatically renewed unless cancelled.
                        </p>

                        <h4>5. Termination</h4>
                        <p>
                            Either party may terminate this agreement with 30 days written notice. Upon termination, you can export your data within 30 days.
                        </p>

                        <h4>6. Limitation of Liability</h4>
                        <p>
                            PreschoolPro is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.
                        </p>

                        <h4>7. Changes to Terms</h4>
                        <p>
                            We may modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
                        </p>
                    </div>
                </Card>

                <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    I accept the terms and conditions
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Completing Setup...' : 'Complete Setup'}
                </Button>
            </form>
        </Form>
    );
} 