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
    name: z.string().min(1, "Class name is required"),
    description: z.string().optional(),
    capacity: z.coerce
        .number()
        .min(1, "Capacity must be at least 1")
        .max(50, "Capacity cannot exceed 50"),
    age_group: z.string().min(1, "Age group is required"),
    room_number: z.string().optional(),
});

export function AddClassDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { organization } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            capacity: 15,
            age_group: "",
            room_number: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!organization?.id) return;

        try {
            await firebaseServices.createClass(organization.id, {
                name: values.name,
                description: values.description,
                capacity: values.capacity,
                ageGroup: values.age_group,
                roomNumber: values.room_number,
                status: "active",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            toast({
                title: "Success",
                description: "Class created successfully",
            });
            setOpen(false);
            form.reset({
                name: "",
                description: "",
                capacity: 15,
                age_group: "",
                room_number: "",
            });
        } catch (error) {
            console.error("Error creating class:", error);
            toast({
                title: "Error",
                description: "Failed to create class. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Class</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>
                        Create a new class for your organization.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter class name" {...field} />
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
                                            placeholder="Enter class description"
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
                                name="age_group"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age Group</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., 3-4 years"
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
                            name="room_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter room number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Create Class</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 