"use client";

import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { StaffScheduleDialog } from "@/components/staff/staff-schedule-dialog";
import firebaseServices from "@/lib/firebase-services";
import { collection, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface Schedule {
    id: string;
    staffId: string;
    date: string;
    shiftStart: string;
    shiftEnd: string;
    classId: string | null;
    class?: {
        name: string;
    };
}

interface StaffSchedule {
    id: string;
    staffId: string;
    date: string;
    shiftStart: string;
    shiftEnd: string;
    classId: string | null;
    organizationId: string;
}

export default function StaffSchedulePage() {
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
    const [staff, setStaff] = useState<Staff[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { organization } = useAuth();
    const { toast } = useToast();

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    useEffect(() => {
        if (!organization?.id) return;

        const fetchStaff = async () => {
            try {
                const staffData = await firebaseServices.getStaff(organization.id, { status: "active" });
                setStaff(staffData || []);
            } catch (error) {
                console.error("Error fetching staff:", error);
            }
        };

        fetchStaff();
    }, [organization?.id]);

    useEffect(() => {
        if (!organization?.id) return;

        const fetchSchedules = async () => {
            try {
                const startDate = format(currentWeek, "yyyy-MM-dd");
                const endDate = format(addDays(currentWeek, 6), "yyyy-MM-dd");

                // Get all staff schedules for the date range
                const schedulesData = await firebaseServices.getStaffSchedules(
                    organization.id,
                    startDate,
                    endDate
                ) as StaffSchedule[];

                // For each schedule, fetch the class name if classId exists
                const schedulesWithClasses = await Promise.all(
                    schedulesData.map(async (schedule: StaffSchedule) => {
                        if (schedule.classId) {
                            const classData = await firebaseServices.getClass(organization.id, schedule.classId);
                            return {
                                ...schedule,
                                class: classData ? { name: classData.name } : undefined
                            };
                        }
                        return schedule;
                    })
                );

                setSchedules(schedulesWithClasses || []);
            } catch (error) {
                console.error("Error fetching schedules:", error);
            }
        };

        fetchSchedules();
    }, [organization?.id, currentWeek]);

    const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
    const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

    const handleCellClick = (staff: Staff, date: Date) => {
        setSelectedStaff(staff);
        setSelectedDate(date);
        setIsDialogOpen(true);
    };

    const getScheduleForDay = (staffId: string, date: Date) => {
        return schedules.find(
            (s) =>
                s.staffId === staffId && s.date === format(date, "yyyy-MM-dd")
        );
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Schedule</h1>
                    <p className="text-muted-foreground">
                        Manage your staff schedules and assignments
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousWeek}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-medium">
                        {format(currentWeek, "MMM d")} -{" "}
                        {format(addDays(currentWeek, 6), "MMM d, yyyy")}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextWeek}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-4">
                    <div className="font-medium">Staff Member</div>
                    {weekDays.map((day) => (
                        <div
                            key={day.toISOString()}
                            className="text-center font-medium"
                        >
                            {format(day, "EEE")}
                            <br />
                            {format(day, "MMM d")}
                        </div>
                    ))}

                    {staff.map((staffMember) => (
                        <React.Fragment key={staffMember.id}>
                            <div className="font-medium">
                                {staffMember.firstName} {staffMember.lastName}
                                <div className="text-sm text-muted-foreground">
                                    {staffMember.role}
                                </div>
                            </div>
                            {weekDays.map((day) => {
                                const schedule = getScheduleForDay(staffMember.id, day);
                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => handleCellClick(staffMember, day)}
                                        className={`p-2 h-24 text-left rounded-md transition-colors ${schedule
                                            ? "bg-primary/10 hover:bg-primary/20"
                                            : "bg-muted hover:bg-muted/80"
                                            }`}
                                    >
                                        {schedule && (
                                            <>
                                                <div className="text-sm font-medium">
                                                    {schedule.shiftStart} - {schedule.shiftEnd}
                                                </div>
                                                {schedule.classId && schedule.class && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {schedule.class.name}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </Card>

            {selectedStaff && (
                <StaffScheduleDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    staff={selectedStaff}
                    onSuccess={() => {
                        setIsDialogOpen(false);
                        toast({
                            title: "Schedule updated",
                            description: "The staff schedule has been updated successfully.",
                        });
                    }}
                />
            )}
        </div>
    );
} 