"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StudentDocuments } from "@/components/students/student-documents";
import { useToast } from "@/components/ui/use-toast";
import firebaseServices from "@/lib/firebase-services";

export default function StudentDocumentsPage({ params }: { params: { organizationId: string; studentId: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStudent();
    }, [params.studentId]);

    const loadStudent = async () => {
        try {
            const studentData = await firebaseServices.getStudent(params.organizationId, params.studentId);
            setStudent(studentData);
        } catch (error) {
            console.error("Error loading student:", error);
            toast({
                title: "Error",
                description: "Failed to load student information",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocumentsComplete = async () => {
        try {
            await firebaseServices.updateStudent(params.organizationId, params.studentId, {
                registrationStep: 2,
                updatedAt: new Date(),
            });

            // Redirect to the next step
            router.push(`/register/student/${params.organizationId}/${params.studentId}/review`);
        } catch (error) {
            console.error("Error updating registration step:", error);
            toast({
                title: "Error",
                description: "Failed to update registration progress",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Required Documents</h1>
                                <p className="text-blue-100 mt-1">
                                    Please upload the required documents for {student?.firstName} {student?.lastName}'s registration
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm">Step 2 of 9</p>
                                <Progress value={22} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Required Documents</CardTitle>
                                <CardDescription>
                                    Please upload the following documents to complete the registration process:
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2 mb-6">
                                    <li>Birth Certificate</li>
                                    <li>Immunization Records</li>
                                    <li>Medical Records (if applicable)</li>
                                    <li>Any other relevant documents</li>
                                </ul>

                                <StudentDocuments
                                    orgId={params.organizationId}
                                    studentId={params.studentId}
                                />

                                <div className="mt-6 flex justify-end">
                                    <Button
                                        onClick={handleDocumentsComplete}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Continue to Next Step
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 