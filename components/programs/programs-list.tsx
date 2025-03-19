"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import firebaseServices from "@/lib/firebase-services";
import { Loader2, Users, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isAfter, addMonths, parseISO } from "date-fns";

interface Program {
    id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    capacity: number;
    age_range: string;
    schedule: string;
    status: string;
    enrolledStudents?: number;
}

interface ProgramsListProps {
    statusFilter?: string;
}

export function ProgramsList({ statusFilter }: ProgramsListProps) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { organization } = useAuth();

    useEffect(() => {
        const fetchPrograms = async () => {
            if (!organization?.id) return;

            try {
                const programsData = await firebaseServices.getPrograms(organization.id);
                // Filter programs based on end date
                const filteredPrograms = programsData.filter(program => {
                    const endDate = parseISO(program.end_date);
                    const oneMonthAfterEnd = addMonths(endDate, 1);
                    const isActive = isAfter(oneMonthAfterEnd, new Date());

                    if (statusFilter === "active") {
                        return isActive;
                    } else if (statusFilter === "inactive") {
                        return !isActive;
                    }
                    return true;
                });

                setPrograms(filteredPrograms);
            } catch (error) {
                console.error("Error fetching programs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrograms();
    }, [organization?.id, statusFilter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    {statusFilter === "active"
                        ? "No active programs found. Add your first program to get started."
                        : "No programs found. Add your first program to get started."}
                </p>
                <Button variant="outline" className="mt-4">
                    Add Program
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {programs.map((program) => {
                const endDate = parseISO(program.end_date);
                const oneMonthAfterEnd = addMonths(endDate, 1);
                const isActive = isAfter(oneMonthAfterEnd, new Date());

                return (
                    <Card key={program.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">{program.name}</h3>
                                            <Badge variant={isActive ? "default" : "secondary"}>
                                                {isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        {program.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {program.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Capacity</p>
                                            <p className="text-sm text-muted-foreground">
                                                {program.enrolledStudents || 0} / {program.capacity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Duration</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(parseISO(program.start_date), "MMM d")} -{" "}
                                                {format(parseISO(program.end_date), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Schedule</p>
                                            <p className="text-sm text-muted-foreground">{program.schedule}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Age Range</p>
                                        <p className="text-sm text-muted-foreground">{program.age_range}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
} 