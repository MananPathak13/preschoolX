"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import firebaseServices from "@/lib/firebase-services";

interface Staff {
    id: string;
    firstName: string;
    lastName: string;
}

interface StaffScheduleDialogProps {
    staff: Staff;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const formSchema = z.object({
    date: z.date({
        required_error: "A date is required",
    }),
    shiftStart: z.string().min(1, "Shift start time is required"),
    shiftEnd: z.string().min(1, "Shift end time is required"),
    classId: z.string().optional(),
});

export function StaffScheduleDialog({
    staff,
    open,
    onOpenChange,
    onSuccess,
}: StaffScheduleDialogProps) {
    const [classes, setClasses] = useState<any[]>([]);
    const { toast } = useToast();
    const { organization } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            shiftStart: "08:00",
            shiftEnd: "17:00",
            classId: undefined,
        },
    });

    useEffect(() => {
        const fetchClasses = async () => {
            if (!organization?.id) return;

            try {
                const classesData = await firebaseServices.getClasses(organization.id, { active: true });
                setClasses(classesData || []);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };

        fetchClasses();
    }, [organization?.id]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!organization?.id) return;

        try {
            const scheduleData = {
                date: format(values.date, "yyyy-MM-dd"),
                shiftStart: values.shiftStart,
                shiftEnd: values.shiftEnd,
                classId: values.classId,
                staffId: staff.id,
                organizationId: organization.id,
            };

            await firebaseServices.createStaffSchedule(organization.id, scheduleData);

            toast({
                title: "Success",
                description: "Schedule has been created successfully.",
            });

            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating schedule:", error);
            toast({
                title: "Error",
                description: "Failed to create schedule. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Shift</DialogTitle>
                    <DialogDescription>
                        Schedule a shift for {staff.firstName} {staff.lastName}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="shiftStart"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <input
                                                type="time"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shiftEnd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <input
                                                type="time"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="classId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign to Class (Optional)</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classes.map((classItem) => (
                                                <SelectItem
                                                    key={classItem.id}
                                                    value={classItem.id}
                                                >
                                                    {classItem.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Schedule Shift</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 