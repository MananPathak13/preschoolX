import { Metadata } from 'next';
import { ProgramsSetupForm } from '@/components/forms/programs-setup-form';

export const metadata: Metadata = {
    title: 'Programs Setup | PreschoolPro',
    description: 'Set up your programs and classes',
};

export default function ProgramsSetupPage({
    params,
}: {
    params: { organizationId: string };
}) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Programs & Classes</h2>
                <p className="text-muted-foreground">
                    Define your programs and set up classes within each program
                </p>
            </div>
            <ProgramsSetupForm organizationId={params.organizationId} />
        </div>
    );
} 