import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { UserPermissions, UserRole } from "@/lib/permissions-context";

// Default permissions for different roles
export const defaultPermissions: Record<UserRole, UserPermissions> = {
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
    },
};

/**
 * Create a new user with default permissions based on role
 */
export async function createUserWithDefaultPermissions(
    userId: string,
    role: UserRole
) {
    try {
        const userRef = doc(db, "users", userId);

        // Check if user already exists
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            console.warn("User already exists, updating role only");
            await updateDoc(userRef, { role });
            return;
        }

        // Create new user with default permissions
        await setDoc(userRef, {
            role,
            permissions: defaultPermissions[role],
            createdAt: new Date().toISOString(),
        });

        console.log(`User ${userId} created with ${role} permissions`);
    } catch (error) {
        console.error("Error creating user with permissions:", error);
        throw error;
    }
}

/**
 * Update a user's role and reset to default permissions for that role
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
    try {
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
            role: newRole,
            permissions: defaultPermissions[newRole],
            updatedAt: new Date().toISOString(),
        });

        console.log(`User ${userId} updated to ${newRole} role`);
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
}

/**
 * Update specific permissions for a user
 */
export async function updateUserPermissions(
    userId: string,
    permissions: UserPermissions
) {
    try {
        const userRef = doc(db, "users", userId);

        // Get current user data
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const userData = userDoc.data();

        // Update permissions
        await updateDoc(userRef, {
            permissions: {
                ...userData.permissions,
                ...permissions,
            },
            updatedAt: new Date().toISOString(),
        });

        console.log(`Permissions updated for user ${userId}`);
    } catch (error) {
        console.error("Error updating user permissions:", error);
        throw error;
    }
}

/**
 * Get a user's permissions
 */
export async function getUserPermissions(userId: string) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const userData = userDoc.data();
        return {
            role: userData.role as UserRole,
            permissions: userData.permissions as UserPermissions,
        };
    } catch (error) {
        console.error("Error getting user permissions:", error);
        throw error;
    }
} 