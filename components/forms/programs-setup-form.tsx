import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Plus } from 'lucide-react';

const classSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    ageGroup: z.string().min(1, 'Age group is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    description: z.string().optional(),
    schedule: z.object({
        monday: z.boolean(),
        tuesday: z.boolean(),
        wednesday: z.boolean(),
        thursday: z.boolean(),
        friday: z.boolean(),
        saturday: z.boolean(),
        sunday: z.boolean(),
    }),
});

const programSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(1, 'Description is required'),
    operatingHours: z.object({
        start: z.string().min(1, 'Start time is required'),
        end: z.string().min(1, 'End time is required'),
    }),
    classes: z.array(classSchema).min(1, 'At least one class is required'),
});

const programsSetupSchema = z.object({
    programs: z.array(programSchema).min(1, 'At least one program is required'),
});

type ProgramsSetupFormValues = z.infer<typeof programsSetupSchema>;

export function ProgramsSetupForm({ organizationId }: { organizationId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<ProgramsSetupFormValues>({
        resolver: zodResolver(programsSetupSchema),
        defaultValues: {
            programs: [
                {
                    name: '',
                    description: '',
                    operatingHours: {
                        start: '08:00',
                        end: '17:00',
                    },
                    classes: [
                        {
                            name: '',
                            ageGroup: '',
                            capacity: 15,
                            description: '',
                            schedule: {
                                monday: true,
                                tuesday: true,
                                wednesday: true,
                                thursday: true,
                                friday: true,
                                saturday: false,
                                sunday: false,
                            },
                        },
                    ],
                },
            ],
        },
    });

    const { fields: programFields, append: appendProgram, remove: removeProgram } = useFieldArray({
        control: form.control,
        name: 'programs',
    });

    async function onSubmit(data: ProgramsSetupFormValues) {
        try {
            setIsLoading(true);
            const batch = writeBatch(db);

            // Create programs and classes
            for (const program of data.programs) {
                const programRef = doc(collection(db, 'organizations', organizationId, 'programs'));
                batch.set(programRef, {
                    name: program.name,
                    description: program.description,
                    operatingHours: program.operatingHours,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                // Create classes for this program
                for (const classData of program.classes) {
                    const classRef = doc(collection(db, 'organizations', organizationId, 'classes'));
                    batch.set(classRef, {
                        ...classData,
                        programId: programRef.id,
                        active: true,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                }
            }

            // Update organization status
            const orgRef = doc(db, 'organizations', organizationId);
            batch.update(orgRef, {
                onboardingStatus: 'terms-setup',
                updatedAt: serverTimestamp(),
            });

            await batch.commit();

            toast({
                title: 'Programs and classes created',
                description: 'Your programs and classes have been set up successfully.',
            });

            // Navigate to terms setup
            router.push(`/onboarding/${organizationId}/terms`);
        } catch (error) {
            console.error('Error setting up programs:', error);
            toast({
                title: 'Error',
                description: 'Failed to set up programs and classes. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                    {programFields.map((programField, programIndex) => (
                        <div key={programField.id} className="p-6 border rounded-lg space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Program {programIndex + 1}</h3>
                                {programIndex > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProgram(programIndex)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`programs.${programIndex}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Program Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full Day Program" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`programs.${programIndex}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your program..."
                                                    className="resize-none"
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
                                        name={`programs.${programIndex}.operatingHours.start`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`programs.${programIndex}.operatingHours.end`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Classes */}
                                <div className="space-y-4">
                                    <h4 className="font-medium">Classes</h4>
                                    {form.watch(`programs.${programIndex}.classes`).map((_, classIndex) => (
                                        <div key={classIndex} className="p-4 border rounded space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-medium">Class {classIndex + 1}</h5>
                                                {classIndex > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const classes = form.getValues(`programs.${programIndex}.classes`);
                                                            form.setValue(
                                                                `programs.${programIndex}.classes`,
                                                                classes.filter((_, i) => i !== classIndex)
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`programs.${programIndex}.classes.${classIndex}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Class Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Toddlers A" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`programs.${programIndex}.classes.${classIndex}.ageGroup`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Age Group</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select age group" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="infant">Infant (0-1)</SelectItem>
                                                                    <SelectItem value="toddler">Toddler (1-2)</SelectItem>
                                                                    <SelectItem value="preschool">Preschool (3-4)</SelectItem>
                                                                    <SelectItem value="prek">Pre-K (4-5)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`programs.${programIndex}.classes.${classIndex}.capacity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Capacity</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`programs.${programIndex}.classes.${classIndex}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe this class..."
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-2">
                                                <FormLabel>Schedule</FormLabel>
                                                <div className="grid grid-cols-7 gap-2">
                                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                                        <FormField
                                                            key={day}
                                                            control={form.control}
                                                            name={`programs.${programIndex}.classes.${classIndex}.schedule.${day}`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="flex flex-col items-center">
                                                                            <Button
                                                                                type="button"
                                                                                variant={field.value ? 'default' : 'outline'}
                                                                                size="sm"
                                                                                className="w-full"
                                                                                onClick={() => field.onChange(!field.value)}
                                                                            >
                                                                                {day.charAt(0).toUpperCase()}
                                                                            </Button>
                                                                        </div>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            const classes = form.getValues(`programs.${programIndex}.classes`);
                                            form.setValue(`programs.${programIndex}.classes`, [
                                                ...classes,
                                                {
                                                    name: '',
                                                    ageGroup: '',
                                                    capacity: 15,
                                                    description: '',
                                                    schedule: {
                                                        monday: true,
                                                        tuesday: true,
                                                        wednesday: true,
                                                        thursday: true,
                                                        friday: true,
                                                        saturday: false,
                                                        sunday: false,
                                                    },
                                                },
                                            ]);
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Class
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        appendProgram({
                            name: '',
                            description: '',
                            operatingHours: {
                                start: '08:00',
                                end: '17:00',
                            },
                            classes: [
                                {
                                    name: '',
                                    ageGroup: '',
                                    capacity: 15,
                                    description: '',
                                    schedule: {
                                        monday: true,
                                        tuesday: true,
                                        wednesday: true,
                                        thursday: true,
                                        friday: true,
                                        saturday: false,
                                        sunday: false,
                                    },
                                },
                            ],
                        })
                    }
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Program
                </Button>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Continue to Terms & Conditions'}
                </Button>
            </form>
        </Form>
    );
} 