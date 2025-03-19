"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import firebaseServices from "@/lib/firebase-services";

export default function StudentRegistrationStatusPage({ params }: { params: { organizationId: string; studentId: string } }) {
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
                description: "Failed to load registration status",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "text-yellow-500";
            case "approved":
                return "text-green-500";
            case "rejected":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Under Review";
            case "approved":
                return "Approved";
            case "rejected":
                return "Rejected";
            default:
                return "Unknown";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Registration Status</h1>
                                <p className="text-blue-100 mt-1">
                                    Check the status of your child's registration
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm">
                                    Registration Date: {format(student?.registrationDate?.toDate(), "PPP")}
                                </p>
                                <Progress value={100} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Information</CardTitle>
                                <CardDescription>
                                    Registration status for {student?.firstName} {student?.lastName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Status Overview */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium">Current Status</h3>
                                            <p className={`text-lg font-semibold ${getStatusColor(student?.registrationStatus)}`}>
                                                {getStatusText(student?.registrationStatus)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Registration ID</p>
                                            <p className="font-mono">{student?.id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Registration Progress */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Registration Progress</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Initial Information</p>
                                                <p className="text-sm text-muted-foreground">Basic student details</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Guardian Information</p>
                                                <p className="text-sm text-muted-foreground">Parent/guardian details</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Emergency Contacts</p>
                                                <p className="text-sm text-muted-foreground">Emergency contact information</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Program Selection</p>
                                                <p className="text-sm text-muted-foreground">Program and schedule preferences</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Medical Information</p>
                                                <p className="text-sm text-muted-foreground">Health and medical details</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Documents</p>
                                                <p className="text-sm text-muted-foreground">Required documentation</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Terms and Conditions</p>
                                                <p className="text-sm text-muted-foreground">Policy acceptance</p>
                                            </div>
                                            <div className="text-green-500">✓</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Staff Review</p>
                                                <p className="text-sm text-muted-foreground">Application review process</p>
                                            </div>
                                            <div className={getStatusColor(student?.registrationStatus)}>
                                                {student?.registrationStatus === "pending" ? "⏳" : student?.registrationStatus === "approved" ? "✓" : "✗"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Staff Notes */}
                                {student?.reviewNotes && (
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Staff Notes</h3>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-800">{student.reviewNotes}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push("/")}
                                        className="bg-white hover:bg-gray-50"
                                    >
                                        Return to Home
                                    </Button>
                                    {student?.registrationStatus === "rejected" && (
                                        <Button
                                            onClick={() => router.push(`/register/student/${params.organizationId}`)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Start New Registration
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 