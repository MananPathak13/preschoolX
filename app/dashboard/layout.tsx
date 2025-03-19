"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { SideNavigation } from "@/components/SideNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for mobile and desktop */}
      <SideNavigation className="w-full md:w-64 flex-shrink-0" />

      {/* Main content area with proper spacing */}
      <div className="flex-1 md:pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}