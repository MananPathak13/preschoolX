"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingRoot({
    params,
}: {
    params: { organizationId: string };
}) {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        async function checkOnboardingStatus() {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                const orgDoc = await getDoc(doc(db, 'organizations', params.organizationId));
                if (orgDoc.exists()) {
                    const data = orgDoc.data();
                    if (data.onboardingStatus === 'complete') {
                        router.push('/dashboard');
                    } else {
                        router.push(`/onboarding/${params.organizationId}/${data.onboardingStatus}`);
                    }
                }
            } catch (error) {
                console.error('Error checking onboarding status:', error);
            }
        }

        checkOnboardingStatus();
    }, [params.organizationId, router, user]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
        </div>
    );
} 