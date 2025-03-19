"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function Register() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
    });
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (!formData.firstName || !formData.lastName) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Create organization document with minimal info
            const organizationRef = doc(db, "organizations", userCredential.user.uid);
            await setDoc(organizationRef, {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                onboardingStatus: "organization-details",
                active: true,
            });

            // Create admin user document
            const userRef = doc(db, "organizations", userCredential.user.uid, "users", userCredential.user.uid);
            await setDoc(userRef, {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: "admin",
                status: "active",
                permissions: {
                    students: { view: true, create: true, edit: true, delete: true },
                    staff: { view: true, create: true, edit: true, delete: true },
                    programs: { view: true, create: true, edit: true, delete: true },
                    attendance: { view: true, create: true, edit: true, delete: true },
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({
                title: "Account created",
                description: "Let's set up your organization!",
            });

            router.push(`/onboarding/${userCredential.user.uid}/organization-details`);
        } catch (error: any) {
            console.error("Error registering:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create account",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Get started with PreschoolPro
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                                required
                            />
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                                required
                            />
                        </div>
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Register"}
                        </Button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
    );
} 