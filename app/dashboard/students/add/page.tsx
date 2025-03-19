"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { toast } from "@/components/ui/use-toast";

// Define the form schema
const formSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    dateOfBirth: z.string().min(1, { message: "Date of birth is required." }),
    gender: z.enum(["male", "female", "other"], { message: "Gender is required." }),
    ageGroup: z.string().min(1, { message: "Age group is required." }),
    address: z.string().optional(),
    allergies: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    emergencyContact: z.string().min(1, { message: "Emergency contact is required." }),
    emergencyPhone: z.string().min(1, { message: "Emergency phone is required." }),
    status: z.enum(["active", "waitlist", "inactive"], { message: "Status is required." }),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddStudentPage() {
    const router = useRouter();
    const { organization } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "active",
            gender: "male",
        },
    });

    const onSubmit = async (data: FormValues) => {
        if (!organization) {
            toast({
                title: "Error",
                description: "Organization not found. Please try again.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Process allergies and dietary restrictions
            const processedData = {
                ...data,
                allergies: data.allergies ? data.allergies.split(',').map((item: string) => item.trim()) : [],
                dietaryRestrictions: data.dietaryRestrictions ? data.dietaryRestrictions.split(',').map((item: string) => item.trim()) : [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Add student to Firestore
            const studentsRef = collection(db, `organizations/${organization.id}/students`);
            await addDoc(studentsRef, processedData);

            toast({
                title: "Success",
                description: "Student added successfully.",
            });

            // Redirect to students list
            router.push("/dashboard/students");
        } catch (error) {
            console.error("Error adding student:", error);
            toast({
                title: "Error",
                description: "Failed to add student. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Add New Student</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>Enter the student's details below.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Enter student's full name"
                                        {...register("fullName")}
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-500">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        {...register("dateOfBirth")}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                                    <RadioGroup
                                        onValueChange={(value) => setValue("gender", value as "male" | "female" | "other")}
                                        defaultValue="male"
                                        className="flex space-x-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="male" id="male" />
                                            <Label htmlFor="male">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="female" id="female" />
                                            <Label htmlFor="female">Female</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="other" id="other" />
                                            <Label htmlFor="other">Other</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.gender && (
                                        <p className="text-sm text-red-500">{errors.gender.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ageGroup">Age Group <span className="text-red-500">*</span></Label>
                                    <Select onValueChange={(value) => setValue("ageGroup", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select age group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="infant">Infant (0-1 years)</SelectItem>
                                            <SelectItem value="toddler">Toddler (1-2 years)</SelectItem>
                                            <SelectItem value="preschool">Preschool (3-4 years)</SelectItem>
                                            <SelectItem value="pre-k">Pre-K (4-5 years)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.ageGroup && (
                                        <p className="text-sm text-red-500">{errors.ageGroup.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter student's address"
                                    {...register("address")}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Health Information</h3>

                            <div className="space-y-2">
                                <Label htmlFor="allergies">Allergies</Label>
                                <Textarea
                                    id="allergies"
                                    placeholder="List any allergies (comma separated)"
                                    {...register("allergies")}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter any allergies, separated by commas (e.g., "peanuts, dairy, eggs")
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                                <Textarea
                                    id="dietaryRestrictions"
                                    placeholder="List any dietary restrictions (comma separated)"
                                    {...register("dietaryRestrictions")}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter any dietary restrictions, separated by commas (e.g., "vegetarian, gluten-free, kosher")
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Emergency Contact</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContact">Emergency Contact Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="emergencyContact"
                                        placeholder="Enter emergency contact name"
                                        {...register("emergencyContact")}
                                    />
                                    {errors.emergencyContact && (
                                        <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="emergencyPhone">Emergency Contact Phone <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="emergencyPhone"
                                        placeholder="Enter emergency contact phone"
                                        {...register("emergencyPhone")}
                                    />
                                    {errors.emergencyPhone && (
                                        <p className="text-sm text-red-500">{errors.emergencyPhone.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Enrollment Information</h3>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                                <RadioGroup
                                    onValueChange={(value) => setValue("status", value as "active" | "waitlist" | "inactive")}
                                    defaultValue="active"
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="active" id="active" />
                                        <Label htmlFor="active">Active</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="waitlist" id="waitlist" />
                                        <Label htmlFor="waitlist">Waitlist</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="inactive" id="inactive" />
                                        <Label htmlFor="inactive">Inactive</Label>
                                    </div>
                                </RadioGroup>
                                {errors.status && (
                                    <p className="text-sm text-red-500">{errors.status.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Enter any additional notes"
                                    {...register("notes")}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/students")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Student"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 