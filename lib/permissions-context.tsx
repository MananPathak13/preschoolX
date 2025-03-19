"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase-config";
import { doc, getDoc } from "firebase/firestore";

// Define permission types
export type PermissionAction = "view" | "create" | "edit" | "delete";

export type ModulePermission = {
    [key in PermissionAction]?: boolean;
};

export type UserPermissions = {
    students?: ModulePermission;
    staff?: ModulePermission;
    curriculum?: ModulePermission;
    messages?: ModulePermission;
    attendance?: ModulePermission;
    reports?: ModulePermission;
    analytics?: ModulePermission;
    billing?: ModulePermission;
    settings?: ModulePermission;
    permissions?: ModulePermission;
    help?: ModulePermission;
    guardians?: ModulePermission;
    meals?: ModulePermission;
    calendar?: ModulePermission;
    dashboard?: ModulePermission;
    classes?: ModulePermission;
};

export type UserRole = "admin" | "teacher" | "staff" | "parent";

// Define context type
type PermissionsContextType = {
    userRole: UserRole | null;
    permissions: UserPermissions;
    isAdmin: boolean;
    hasPermission: (module: string, action: PermissionAction) => boolean;
    loading: boolean;
};

// Admin emails that should always have admin access
const adminEmails = [
    'admin@preschoolpro.com',
    'admin2@preschoolpro.com',
    'newadmin@preschoolpro.com'
];

// Create context with default values
const PermissionsContext = createContext<PermissionsContextType>({
    userRole: null,
    permissions: {},
    isAdmin: false,
    hasPermission: () => false,
    loading: true,
});

// Default permissions for different roles
const defaultPermissions: Record<UserRole, UserPermissions> = {
    admin: {
        // Admins have full access to everything
        students: { view: true, create: true, edit: true, delete: true },
        staff: { view: true, create: true, edit: true, delete: true },
        curriculum: { view: true, create: true, edit: true, delete: true },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
        billing: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        permissions: { view: true, create: true, edit: true, delete: true },
        help: { view: true, create: true, edit: true, delete: true },
        guardians: { view: true, create: true, edit: true, delete: true },
        meals: { view: true, create: true, edit: true, delete: true },
        calendar: { view: true, create: true, edit: true, delete: true },
        dashboard: { view: true, create: true, edit: true, delete: true },
        classes: { view: true, create: true, edit: true, delete: true },
    },
    teacher: {
        // Teachers have limited access
        students: { view: true, create: false, edit: true, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: true, edit: true, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: true, delete: false },
        reports: { view: true, create: true, edit: false, delete: false },
        analytics: { view: true, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
        guardians: { view: true, create: true, edit: true, delete: false },
        meals: { view: true, create: true, edit: true, delete: false },
        calendar: { view: true, create: true, edit: true, delete: false },
        dashboard: { view: true, create: false, edit: false, delete: false },
        classes: { view: true, create: true, edit: true, delete: false },
    },
    staff: {
        // Staff have very limited access
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: true, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        billing: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
        guardians: { view: true, create: false, edit: false, delete: false },
        meals: { view: true, create: true, edit: false, delete: false },
        calendar: { view: true, create: false, edit: false, delete: false },
        dashboard: { view: true, create: false, edit: false, delete: false },
        classes: { view: false, create: false, edit: false, delete: false },
    },
    parent: {
        // Parents only see their children's information
        students: { view: true, create: false, edit: false, delete: false },
        staff: { view: true, create: false, edit: false, delete: false },
        curriculum: { view: true, create: false, edit: false, delete: false },
        messages: { view: true, create: true, edit: true, delete: true },
        attendance: { view: true, create: false, edit: false, delete: false },
        reports: { view: false, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        billing: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        permissions: { view: false, create: false, edit: false, delete: false },
        help: { view: true, create: false, edit: false, delete: false },
        guardians: { view: false, create: false, edit: false, delete: false },
        meals: { view: true, create: false, edit: false, delete: false },
        calendar: { view: true, create: false, edit: false, delete: false },
        dashboard: { view: true, create: false, edit: false, delete: false },
        classes: { view: false, create: false, edit: false, delete: false },
    },
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const { user, loading: authLoading, organization, organizationLoading } = useAuth();
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [permissions, setPermissions] = useState<UserPermissions>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRoleAndPermissions = async () => {
            if (authLoading || organizationLoading) return;

            if (!user || !organization) {
                setUserRole(null);
                setPermissions({});
                setLoading(false);
                return;
            }

            try {
                // Special handling for admin emails
                const userEmail = user.email?.toLowerCase() || '';
                const isAdminEmail = adminEmails.includes(userEmail) || userEmail.includes('admin@');

                if (isAdminEmail) {
                    console.log(`Setting admin role and permissions for ${userEmail}`);
                    setUserRole('admin');
                    setPermissions(defaultPermissions.admin);
                    setLoading(false);
                    return;
                }

                // Get role and permissions from organization context
                if (organization.member?.role) {
                    const role = organization.member.role.toLowerCase() as UserRole;
                    setUserRole(role);

                    // If organization has permissions, use those
                    if (organization.member.permissions) {
                        setPermissions(organization.member.permissions as UserPermissions);
                    } else {
                        // Otherwise use default permissions for the role
                        setPermissions(defaultPermissions[role] || {});
                    }
                } else {
                    // If no role in organization, fetch from members collection
                    const memberDoc = await getDoc(doc(db, `organizations/${organization.id}/members/${user.uid}`));

                    if (memberDoc.exists()) {
                        const memberData = memberDoc.data();
                        const role = memberData.role.toLowerCase() as UserRole;
                        setUserRole(role);

                        // If member has permissions, use those
                        if (memberData.permissions) {
                            setPermissions(memberData.permissions as UserPermissions);
                        } else {
                            // Otherwise use default permissions for the role
                            setPermissions(defaultPermissions[role] || {});
                        }
                    } else {
                        // If member document doesn't exist, default to staff role
                        console.warn("Member document not found, defaulting to staff role");
                        setUserRole("staff");
                        setPermissions(defaultPermissions.staff);
                    }
                }
            } catch (error) {
                console.error("Error fetching user permissions:", error);
                // Default to minimal permissions on error
                setUserRole("staff");
                setPermissions(defaultPermissions.staff);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRoleAndPermissions();
    }, [user, authLoading, organization, organizationLoading]);

    // Check if user has permission for a specific action on a module
    const hasPermission = (module: string, action: PermissionAction): boolean => {
        if (!userRole) return false;

        // Admins have all permissions
        if (userRole === "admin") return true;

        // Check if the module exists in permissions
        const modulePermissions = permissions[module as keyof UserPermissions];
        if (!modulePermissions) return false;

        // Check if the action is allowed
        return !!modulePermissions[action];
    };

    return (
        <PermissionsContext.Provider
            value={{
                userRole,
                permissions,
                isAdmin: userRole === "admin",
                hasPermission,
                loading,
            }}
        >
            {children}
        </PermissionsContext.Provider>
    );
};

// Custom hook to use permissions
export const usePermissions = () => useContext(PermissionsContext);

// HOC to protect components based on permissions
export function withPermission(
    Component: React.ComponentType<any>,
    module: string,
    action: PermissionAction
) {
    return function ProtectedComponent(props: any) {
        const { hasPermission, loading } = usePermissions();

        if (loading) {
            return <div>Loading permissions...</div>;
        }

        if (!hasPermission(module, action)) {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You don't have permission to access this feature.
                    </p>
                </div>
            );
        }

        return <Component {...props} />;
    };
} 