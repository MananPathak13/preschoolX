"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddStudentForm } from "@/components/students/add-student-form";
import { toast } from "@/components/ui/use-toast";

interface OrganizationInfo {
    name: string;
    logo?: string;
}

export default function StudentRegistrationPage({
    params,
}: {
    params: { organizationId: string };
}) {
    const router = useRouter();
    const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch organization info
    useState(() => {
        const fetchOrganization = async () => {
            try {
                const orgDoc = await getDoc(doc(db, "organizations", params.organizationId));
                if (!orgDoc.exists()) {
                    toast({
                        title: "Organization not found",
                        description: "The organization you're trying to register with doesn't exist.",
                        variant: "destructive",
                    });
                    router.push("/");
                    return;
                }
                setOrganization({
                    name: orgDoc.data().name,
                    logo: orgDoc.data().logo,
                });
            } catch (error) {
                console.error("Error fetching organization:", error);
                toast({
                    title: "Error",
                    description: "Failed to load organization information. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrganization();
    }, [params.organizationId, router]);

    const handleRegistrationSuccess = () => {
        toast({
            title: "Registration Successful",
            description: "Your child has been added to the waitlist. The organization will review your application.",
        });
        // Optionally redirect to a thank you page or clear the form
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader className="text-center">
                        {organization?.logo && (
                            <img
                                src={organization.logo}
                                alt={organization.name}
                                className="h-16 mx-auto mb-4"
                            />
                        )}
                        <CardTitle className="text-2xl">Student Registration</CardTitle>
                        <CardDescription>
                            Register your child with {organization?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AddStudentForm
                            onSuccess={handleRegistrationSuccess}
                            mode="create"
                            isPublicRegistration={true}
                            organizationId={params.organizationId}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 