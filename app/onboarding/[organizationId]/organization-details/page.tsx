"use client";

import { OrganizationForm } from '@/components/forms/organization-form';

export default function OrganizationDetails({
    params,
}: {
    params: { organizationId: string };
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-lg font-medium">Tell us about your organization</h2>
                <p className="text-sm text-muted-foreground">
                    This information will be used throughout the app and can be updated later in settings.
                </p>
            </div>

            <OrganizationForm organizationId={params.organizationId} />
        </div>
    );
} 