"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function StudentRegistrationSuccessPage({ params }: { params: { organizationId: string; studentId: string } }) {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page after 30 seconds
        const timeout = setTimeout(() => {
            router.push("/");
        }, 30000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
            <Card className="max-w-2xl w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">Registration Submitted Successfully!</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Thank you for registering your child with our preschool
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Your registration has been received and is currently under review. We will contact you soon with further information about your child's enrollment status.
                        </p>
                        <p className="text-muted-foreground">
                            You will receive a confirmation email shortly with a copy of your registration details.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Next Steps:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Review of your registration by our staff</li>
                                    <li>Document verification</li>
                                    <li>Enrollment confirmation</li>
                                </ul>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="bg-white hover:bg-gray-50"
                        >
                            Return to Home
                        </Button>
                        <Button
                            onClick={() => router.push(`/register/student/${params.organizationId}/${params.studentId}/status`)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Check Registration Status
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                        You will be automatically redirected to the home page in 30 seconds.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
} 