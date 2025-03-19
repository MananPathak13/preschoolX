"use client";

import React from "react";
import { usePermissions, PermissionAction } from "@/lib/permissions-context";
import { Loader2 } from "lucide-react";

interface ProtectedPageProps {
    children: React.ReactNode;
    module: string;
    action: PermissionAction;
    fallback?: React.ReactNode;
}

export function ProtectedPage({
    children,
    module,
    action,
    fallback,
}: ProtectedPageProps) {
    const { hasPermission, loading } = usePermissions();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading permissions...</span>
            </div>
        );
    }

    if (!hasPermission(module, action)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="p-8 text-center border rounded-lg shadow-sm bg-card m-4">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                    You don't have permission to {action} {module}.
                </p>
                <p className="text-sm text-muted-foreground">
                    Please contact your administrator if you believe you should have access to this feature.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}

export function AccessDenied() {
    return (
        <div className="p-8 text-center border rounded-lg shadow-sm bg-card m-4">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
                You don't have permission to access this feature.
            </p>
            <p className="text-sm text-muted-foreground">
                Please contact your administrator if you believe you should have access to this feature.
            </p>
        </div>
    );
} 