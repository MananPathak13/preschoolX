"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import firebaseServices from "@/lib/firebase-services";

export default function StudentReviewPage({ params }: { params: { organizationId: string; studentId: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await firebaseServices.updateStudent(params.organizationId, params.studentId, {
                registrationStep: 9,
                registrationCompleted: true,
                updatedAt: new Date(),
            });

            // Redirect to success page
            router.push(`/register/student/${params.organizationId}/${params.studentId}/success`);
        } catch (error) {
            console.error("Error submitting registration:", error);
            toast({
                title: "Error",
                description: "Failed to submit registration",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
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
                                <h1 className="text-2xl font-bold text-white">Review Registration</h1>
                                <p className="text-blue-100 mt-1">
                                    Please review all information before submitting the registration
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm">Step 9 of 9</p>
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
                                    Review all the information provided for {student?.firstName} {student?.lastName}'s registration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Student Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Student Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                                            <p>{student?.firstName} {student?.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                            <p>{format(student?.dateOfBirth?.toDate(), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                            <p>{student?.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                                            <p>{student?.nationality || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Guardian Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Primary Guardian</p>
                                            <p>{student?.guardian1?.firstName} {student?.guardian1?.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{student?.guardian1?.relationship}</p>
                                            <p>{student?.guardian1?.email}</p>
                                            <p>{student?.guardian1?.phone}</p>
                                        </div>
                                        {student?.guardian2 && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Secondary Guardian</p>
                                                <p>{student?.guardian2?.firstName} {student?.guardian2?.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{student?.guardian2?.relationship}</p>
                                                <p>{student?.guardian2?.email}</p>
                                                <p>{student?.guardian2?.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Emergency Contacts</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Primary Emergency Contact</p>
                                            <p>{student?.emergencyContact1?.firstName} {student?.emergencyContact1?.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{student?.emergencyContact1?.relationship}</p>
                                            <p>{student?.emergencyContact1?.phone}</p>
                                        </div>
                                        {student?.emergencyContact2 && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Secondary Emergency Contact</p>
                                                <p>{student?.emergencyContact2?.firstName} {student?.emergencyContact2?.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{student?.emergencyContact2?.relationship}</p>
                                                <p>{student?.emergencyContact2?.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Program Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Program Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Primary Program</p>
                                            <p>{student?.program?.primaryProgram}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Extended Care</p>
                                            <p>{student?.program?.extendedCare || "Not enrolled"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Medical Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                                            <p>{student?.medicalInfo?.allergies?.join(", ") || "None"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Medical Conditions</p>
                                            <p>{student?.medicalInfo?.conditions || "None"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                                            <p>{student?.medicalInfo?.doctorName}</p>
                                            <p>{student?.medicalInfo?.doctorPhone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Terms and Conditions</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">Tuition Payment:</span>{" "}
                                            {student?.terms?.tuitionPayment ? "Accepted" : "Not accepted"}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Attendance Policy:</span>{" "}
                                            {student?.terms?.attendancePolicy ? "Accepted" : "Not accepted"}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Behavior Policy:</span>{" "}
                                            {student?.terms?.behaviorPolicy ? "Accepted" : "Not accepted"}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Photo Release:</span>{" "}
                                            {student?.terms?.photoRelease ? "Accepted" : "Not accepted"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="bg-white hover:bg-gray-50"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Registration"}
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