"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // This ensures we only run client-side code after hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Only redirect if we're on the client and not loading
        if (isClient && !loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router, isClient]);

    // Don't render anything during server-side rendering to prevent hydration errors
    if (!isClient) {
        return null;
    }

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    // If not authenticated and not loading, don't render children (will redirect in useEffect)
    if (!user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Redirecting to login...</p>
            </div>
        );
    }

    // If authenticated, render children
    return <>{children}</>;
} 