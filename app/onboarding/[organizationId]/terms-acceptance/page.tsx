"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { WelcomeAnimation } from "@/components/welcome-animation";
import { useAuth } from "@/lib/auth-context";

export default function TermsAcceptance({
    params,
}: {
    params: { organizationId: string };
}) {
    const router = useRouter();
    const { toast } = useToast();
    const { refreshUserData } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    // Handle navigation after welcome animation
    useEffect(() => {
        let navigationTimer: NodeJS.Timeout;

        if (showWelcome) {
            navigationTimer = setTimeout(() => {
                // Use window.location.replace for a full page reload
                window.location.replace("/dashboard");
            }, 3000); // Adjust timing based on your welcome animation duration
        }

        return () => {
            if (navigationTimer) {
                clearTimeout(navigationTimer);
            }
        };
    }, [showWelcome]);

    const onComplete = async () => {
        if (!accepted) {
            toast({
                title: "Terms not accepted",
                description: "Please accept the terms and conditions to continue",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const orgRef = doc(db, "organizations", params.organizationId);
            await updateDoc(orgRef, {
                termsAccepted: true,
                onboardingComplete: true,
            });

            // Refresh user data to update navigation
            await refreshUserData();

            // Show welcome animation
            setShowWelcome(true);
        } catch (error) {
            console.error("Error completing onboarding:", error);
            toast({
                title: "Error",
                description: "There was a problem completing your onboarding. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    // Show welcome animation
    if (showWelcome) {
        return <WelcomeAnimation onComplete={() => { }} />;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-900">Terms and Conditions</h2>
                <p className="text-sm text-gray-600">
                    Please review and accept our terms and conditions to complete your organization setup.
                </p>
            </div>

            <div className="prose prose-sm max-w-none">
                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing and using PreschoolPro, you agree to be bound by these Terms and Conditions
                    and all applicable laws and regulations.
                </p>

                <h3>2. Privacy and Data Protection</h3>
                <p>
                    We are committed to protecting the privacy of children, families, and staff. All data
                    is encrypted and stored securely following industry best practices.
                </p>

                <h3>3. User Responsibilities</h3>
                <p>
                    You are responsible for maintaining the confidentiality of your account and for
                    restricting access to your computer or device.
                </p>

                <h3>4. Service Availability</h3>
                <p>
                    While we strive for 24/7 availability, we cannot guarantee uninterrupted access to
                    the service. Maintenance and updates may occasionally affect availability.
                </p>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="terms"
                    checked={accepted}
                    onCheckedChange={(checked) => setAccepted(checked as boolean)}
                />
                <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I accept the terms and conditions
                </label>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={onComplete}
                    disabled={!accepted || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isLoading ? "Setting up your organization..." : "Complete Setup"}
                </Button>
            </div>
        </div>
    );
} 