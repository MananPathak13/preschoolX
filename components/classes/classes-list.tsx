"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import firebaseServices from "@/lib/firebase-services";
import { Loader2, Users, DoorClosed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Class {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    ageGroup: string;
    roomNumber?: string;
    status: string;
    enrolledStudents?: number;
    teacher?: string;
}

interface ClassesListProps {
    statusFilter?: string;
}

export function ClassesList({ statusFilter }: ClassesListProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { organization } = useAuth();

    useEffect(() => {
        const fetchClasses = async () => {
            if (!organization?.id) return;

            try {
                const classesData = await firebaseServices.getClasses(organization.id, {
                    status: statusFilter,
                });
                setClasses(classesData);
            } catch (error) {
                console.error("Error fetching classes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClasses();
    }, [organization?.id, statusFilter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    {statusFilter === "active"
                        ? "No active classes found. Add your first class to get started."
                        : "No classes found. Add your first class to get started."}
                </p>
                <Button variant="outline" className="mt-4">
                    Add Class
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {classes.map((cls) => (
                <Card key={cls.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">{cls.name}</h3>
                                        <Badge variant={cls.status === "active" ? "default" : "secondary"}>
                                            {cls.status}
                                        </Badge>
                                    </div>
                                    {cls.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {cls.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Students</p>
                                        <p className="text-sm text-muted-foreground">
                                            {cls.enrolledStudents || 0} / {cls.capacity}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Age Group</p>
                                    <p className="text-sm text-muted-foreground">{cls.ageGroup}</p>
                                </div>
                                {cls.roomNumber && (
                                    <div className="flex items-center gap-2">
                                        <DoorClosed className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Room</p>
                                            <p className="text-sm text-muted-foreground">{cls.roomNumber}</p>
                                        </div>
                                    </div>
                                )}
                                {cls.teacher && (
                                    <div>
                                        <p className="text-sm font-medium">Teacher</p>
                                        <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 