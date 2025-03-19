"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import firebaseServices from "@/lib/firebase-services";

const formSchema = z.object({
    name: z.string().min(1, "Program name is required"),
    description: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    capacity: z.coerce
        .number()
        .min(1, "Capacity must be at least 1")
        .max(100, "Capacity cannot exceed 100"),
    age_range: z.string().min(1, "Age range is required"),
    schedule: z.string().min(1, "Schedule is required"),
});

export function AddProgramDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { organization } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            capacity: 20,
            age_range: "",
            schedule: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!organization?.id) return;

        try {
            await firebaseServices.createProgram(organization.id, {
                ...values,
                status: "active",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            toast({
                title: "Success",
                description: "Program created successfully",
            });
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error creating program:", error);
            toast({
                title: "Error",
                description: "Failed to create program. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Program</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Program</DialogTitle>
                    <DialogDescription>
                        Create a new program for your organization.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter program name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter program description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter capacity"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="age_range"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age Range</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., 3-5 years"
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
                            name="schedule"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Schedule</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Monday-Friday, 9:00 AM - 3:00 PM"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Create Program</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 