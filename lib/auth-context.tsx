"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import firebaseServices from "@/lib/firebase-services";

// Define the organization interface
interface Organization {
    id: string;
    name: string;
    member?: {
        role: string;
        permissions?: Record<string, any>;
    };
}

// Define the shape of our auth context
interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
    organization: Organization | null;
    organizationLoading: boolean;
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

// Admin emails that should always have admin access
const adminEmails = [
    'admin@preschoolpro.com',
    'admin2@preschoolpro.com',
    'newadmin@preschoolpro.com'
];

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    organization: null,
    organizationLoading: true,
    signIn: async () => ({ user: null }),
    signUp: async () => ({ user: null }),
    signOut: async () => { },
    resetPassword: async () => { },
    refreshUserData: async () => { },
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: React.ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [organizationLoading, setOrganizationLoading] = useState(true);

    // Function to fetch user's organization
    const fetchUserOrganization = async (userId: string) => {
        try {
            setOrganizationLoading(true);
            console.log("Fetching organization for user:", userId);

            // Get user's organizations from Firebase
            const organizations = await firebaseServices.getUserOrganizations(userId);
            console.log("User organizations:", organizations);

            if (organizations.length > 0) {
                // Get the first organization's membership details
                const orgId = organizations[0].id;
                const membership = await firebaseServices.getUserMembership(orgId, userId);
                console.log("User membership:", membership);

                if (membership) {
                    // Special case for admin emails - force admin role
                    const userEmail = user?.email?.toLowerCase() || '';
                    const isAdminEmail = adminEmails.includes(userEmail) || userEmail.includes('admin@');

                    // Override role if admin email
                    const effectiveRole = isAdminEmail ? 'admin' : membership.role;

                    setOrganization({
                        id: orgId,
                        name: organizations[0].name,
                        member: {
                            role: effectiveRole,
                            permissions: membership.permissions || {}
                        }
                    });

                    console.log("Set organization with role:", effectiveRole);
                } else {
                    console.log("No membership found for user in organization");
                    // Create a default member entry for admin emails
                    const userEmail = user?.email?.toLowerCase() || '';
                    if (adminEmails.includes(userEmail) || userEmail.includes('admin@')) {
                        setOrganization({
                            id: orgId,
                            name: organizations[0].name,
                            member: {
                                role: 'admin',
                                permissions: {}
                            }
                        });
                        console.log("Created default admin membership for:", userEmail);
                    } else {
                        setOrganization({
                            id: orgId,
                            name: organizations[0].name
                        });
                    }
                }
            } else {
                console.log("No organizations found for user");
                setOrganization(null);
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            setOrganization(null);
        } finally {
            setOrganizationLoading(false);
        }
    };

    const refreshUserData = async () => {
        if (user) {
            try {
                const userRef = doc(db, `organizations/${user.uid}/users/${user.uid}`);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    useEffect(() => {
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch organization when user logs in
                await fetchUserOrganization(currentUser.uid);
                await refreshUserData();
            } else {
                setOrganization(null);
                setOrganizationLoading(false);
                setUserData(null);
            }
            setLoading(false);
        });

        // Clean up subscription
        return () => unsubscribe();
    }, []);

    // Sign in function
    const signIn = async (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Sign up function
    const signUp = async (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Sign out function
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setOrganization(null);
            setOrganizationLoading(true);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Reset password function
    const resetPassword = async (email: string) => {
        return sendPasswordResetEmail(auth, email);
    };

    // Context value
    const value = {
        user,
        userData,
        loading,
        organization,
        organizationLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUserData,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Protected route component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, organization, organizationLoading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || loading || organizationLoading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    if (!user) {
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }

    if (!organization) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">No Organization Access</h2>
                <p className="text-muted-foreground">Please contact your administrator to get access to an organization.</p>
            </div>
        </div>;
    }

    return <>{children}</>;
}; 