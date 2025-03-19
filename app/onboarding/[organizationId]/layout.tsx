"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, onSnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Progress } from '@/components/ui/progress';

type OnboardingStatus =
    | 'organization-details'
    | 'staff-setup'
    | 'programs-setup'
    | 'student-setup'
    | 'terms-acceptance'
    | 'complete';

interface Organization {
    onboardingStatus: OnboardingStatus;
}

const ONBOARDING_STEPS: { [key in OnboardingStatus]: { title: string; progress: number } } = {
    'organization-details': { title: 'Organization Details', progress: 20 },
    'staff-setup': { title: 'Staff Setup', progress: 40 },
    'programs-setup': { title: 'Programs & Classes', progress: 60 },
    'student-setup': { title: 'Student Information', progress: 80 },
    'terms-acceptance': { title: 'Terms & Conditions', progress: 100 },
    'complete': { title: 'Complete', progress: 100 },
};

export default function OnboardingLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { organizationId: string };
}) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<OnboardingStatus>('organization-details');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Subscribe to organization status changes
        const unsubscribe = onSnapshot(
            doc(db, 'organizations', params.organizationId),
            (snapshot: DocumentSnapshot<DocumentData>) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as Organization;
                    setStatus(data.onboardingStatus);

                    // If onboarding is complete, redirect to dashboard
                    if (data.onboardingStatus === 'complete') {
                        router.push('/dashboard');
                    }

                    // Redirect to correct step if needed
                    const currentStep = pathname.split('/').pop();
                    if (currentStep !== data.onboardingStatus && data.onboardingStatus !== 'complete') {
                        router.push(`/onboarding/${params.organizationId}/${data.onboardingStatus}`);
                    }
                }
            }
        );

        return () => unsubscribe();
    }, [user, params.organizationId, router, pathname]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {ONBOARDING_STEPS[status].title}
                        </h1>
                        <p className="text-gray-600">
                            Step {Math.ceil(ONBOARDING_STEPS[status].progress / 20)} of 5
                        </p>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${ONBOARDING_STEPS[status].progress}%` }}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
} 