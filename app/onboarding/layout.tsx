import { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';

interface OnboardingLayoutProps {
    children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted">
            <div className="container max-w-3xl mx-auto py-8">
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter">
                            Welcome to PreschoolPro
                        </h1>
                        <p className="text-muted-foreground">
                            Let's get your preschool set up in just a few steps
                        </p>
                    </div>
                    <div className="bg-card rounded-lg shadow-lg p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
} 