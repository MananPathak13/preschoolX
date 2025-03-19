import { Metadata } from 'next';
import { TermsForm } from '@/components/forms/terms-form';

export const metadata: Metadata = {
    title: 'Terms & Conditions | PreschoolPro',
    description: 'Review and accept terms and conditions',
};

export default function TermsPage({
    params,
}: {
    params: { organizationId: string };
}) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Terms & Conditions</h2>
                <p className="text-muted-foreground">
                    Please review and accept our terms and conditions
                </p>
            </div>
            <TermsForm organizationId={params.organizationId} />
        </div>
    );
} 