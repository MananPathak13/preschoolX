"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import firebaseServices from "@/lib/firebase-services";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { StudentDocuments } from "@/components/storage/StudentDocuments";

const studentSchema = z.object({
  // Student Information
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.string({
    required_error: "Gender is required",
  }),
  nationality: z.string().optional(),
  languagesSpoken: z.array(z.string()).optional(),
  previousSchool: z.string().optional(),

  // Updated Guardian Information
  guardians: z.array(z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    relationship: z.string().min(1, { message: "Relationship is required" }),
    address: z.string().min(1, { message: "Address is required" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    occupation: z.string().optional(),
    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).min(2, { message: "At least 2 guardians are required" }),

  // Emergency Contacts - updated to support multiple contacts
  emergencyContacts: z.array(z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    relationship: z.string().min(1, { message: "Relationship is required" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  })).min(1, { message: "At least one emergency contact is required" }),

  // Program Selection
  program: z.object({
    primaryProgram: z.string().min(1, { message: "Primary program is required" }),
  }),

  // Health and Medical Information
  medicalInfo: z.object({
    allergies: z.array(z.string()).optional(),
    allergySymptoms: z.string().optional(),
    specialCareInstructions: z.string().optional(),
    conditions: z.string().optional(),
    medications: z.string().optional(),
    doctorName: z.string().optional(),
    doctorPhone: z.string().optional(),
    immunizationRecords: z.array(z.string()).optional(),
  }),

  // Terms and Conditions
  terms: z.object({
    tuitionPayment: z.boolean(),
    attendancePolicy: z.boolean(),
    behaviorPolicy: z.boolean(),
    photoRelease: z.boolean(),
  }),

  // Additional Information
  additionalInfo: z.object({
    siblings: z.array(z.string()).optional(),
    whyMontessori: z.string().optional(),
    referralSource: z.string().optional(),
  }),

  // Emergency Medical Authorization
  emergencyAuthorization: z.object({
    medicalCare: z.boolean(),
    liabilityWaiver: z.boolean(),
  }),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface AddStudentFormProps {
  onSuccess?: (data: StudentFormValues) => void;
  initialData?: StudentFormValues;
  mode?: 'create' | 'edit';
  isPublicRegistration?: boolean;
  organizationId?: string;
}

// Define the steps for the form
const STEPS = [
  { id: 'student-info', title: 'Student Information' },
  { id: 'guardian-info', title: 'Guardian Information' },
  { id: 'emergency-contacts', title: 'Emergency Contacts' },
  { id: 'program-selection', title: 'Program Selection' },
  { id: 'medical-info', title: 'Health & Medical Information' },
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'additional-info', title: 'Additional Information' },
  { id: 'emergency-auth', title: 'Emergency Authorization' },
  { id: 'documents', title: 'Documents' }
];

interface GuardianRef {
  id: string;
}

export function AddStudentForm({ onSuccess, initialData, mode = 'create', isPublicRegistration = false, organizationId }: AddStudentFormProps) {
  const router = useRouter();
  const { organization } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>(initialData?.medicalInfo?.allergies || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [guardianSearchResults, setGuardianSearchResults] = useState<any[]>([]);
  const [isSearchingGuardian, setIsSearchingGuardian] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [guardianCount, setGuardianCount] = useState(2);
  const [isValidating, setIsValidating] = useState(false);
  const [emergencyContactCount, setEmergencyContactCount] = useState(1);
  const effectiveOrgId = organizationId || organization?.id;
  const [programs, setPrograms] = useState<any[]>([]);
  const [tempStudentId, setTempStudentId] = useState<string | null>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      gender: "",
      nationality: "",
      languagesSpoken: [],
      previousSchool: "",
      guardians: [
        {
          firstName: "",
          lastName: "",
          relationship: "",
          address: "",
          phone: "",
          email: "",
          isPrimary: false,
        },
        {
          firstName: "",
          lastName: "",
          relationship: "",
          address: "",
          phone: "",
          email: "",
          isPrimary: false,
        },
      ],
      emergencyContacts: [{
        firstName: "",
        lastName: "",
        relationship: "",
        phone: "",
      }],
      program: {
        primaryProgram: "",
      },
      medicalInfo: {
        allergies: [],
        allergySymptoms: "",
        specialCareInstructions: "",
        conditions: "",
        medications: "",
        doctorName: "",
        doctorPhone: "",
        immunizationRecords: [],
      },
      terms: {
        tuitionPayment: false,
        attendancePolicy: false,
        behaviorPolicy: false,
        photoRelease: false,
      },
      additionalInfo: {
        siblings: [],
        whyMontessori: "",
        referralSource: "",
      },
      emergencyAuthorization: {
        medicalCare: false,
        liabilityWaiver: false,
      },
    },
    mode: "onChange"
  });

  const addAllergy = () => {
    if (allergyInput.trim() !== "") {
      const newAllergies = [...allergies, allergyInput.trim()];
      setAllergies(newAllergies);
      form.setValue("medicalInfo.allergies", newAllergies);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index: number) => {
    const newAllergies = allergies.filter((_, i) => i !== index);
    setAllergies(newAllergies);
    form.setValue("medicalInfo.allergies", newAllergies);
  };

  const searchGuardian = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setGuardianSearchResults([]);
      return;
    }

    setIsSearchingGuardian(true);
    try {
      const results = await firebaseServices.searchGuardians(searchTerm);
      setGuardianSearchResults(results);
    } catch (error) {
      console.error("Error searching guardians:", error);
    } finally {
      setIsSearchingGuardian(false);
    }
  };

  const selectGuardian = (guardian: any) => {
    form.setValue(`guardians.${guardianCount - 1}.firstName`, guardian.firstName);
    form.setValue(`guardians.${guardianCount - 1}.lastName`, guardian.lastName);
    form.setValue(`guardians.${guardianCount - 1}.email`, guardian.email);
    form.setValue(`guardians.${guardianCount - 1}.phone`, guardian.phone);
    form.setValue(`guardians.${guardianCount - 1}.relationship`, guardian.relationship);
    form.setValue(`guardians.${guardianCount - 1}.address`, guardian.address);
    form.setValue(`guardians.${guardianCount - 1}.occupation`, guardian.occupation);
    form.setValue(`guardians.${guardianCount - 1}.businessName`, guardian.businessName);
    form.setValue(`guardians.${guardianCount - 1}.businessAddress`, guardian.businessAddress);
    setGuardianSearchResults([]);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      if (!effectiveOrgId) return;

      try {
        const classesData = await firebaseServices.getClasses(effectiveOrgId, {
          status: "active"
        });
        setClasses(classesData || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, [effectiveOrgId]);

  const addGuardian = () => {
    setGuardianCount(prev => prev + 1);
  };

  const addEmergencyContact = () => {
    setEmergencyContactCount(prev => prev + 1);
    const currentContacts = form.getValues("emergencyContacts") || [];
    form.setValue("emergencyContacts", [
      ...currentContacts,
      { firstName: "", lastName: "", relationship: "", phone: "" }
    ]);
  };

  const removeEmergencyContact = (index: number) => {
    if (emergencyContactCount > 1) {
      setEmergencyContactCount(prev => prev - 1);
      const currentContacts = form.getValues("emergencyContacts");
      form.setValue("emergencyContacts", currentContacts.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!effectiveOrgId) return;

      try {
        const programsData = await firebaseServices.getPrograms(effectiveOrgId, {
          status: "active"
        });
        setPrograms(programsData || []);
      } catch (error) {
        console.error("Error fetching programs:", error);
        toast({
          title: "Error",
          description: "Failed to load programs. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchPrograms();
  }, [effectiveOrgId]);

  const onSubmit = async (values: StudentFormValues) => {
    if (!effectiveOrgId) return;

    setIsSubmitting(true);
    try {
      // Create guardians first
      const guardianRefs: GuardianRef[] = await Promise.all(
        values.guardians.map(guardian =>
          firebaseServices.createGuardian(effectiveOrgId, {
            ...guardian,
            organizationId: effectiveOrgId,
            createdAt: new Date(),
            updatedAt: new Date(),
            students: [],
          })
        )
      );

      // Create student with guardian references
      const studentData = {
        ...values,
        guardians: values.guardians.map((guardian, index) => ({
          ...guardian,
          guardianId: guardianRefs[index].id,
        })),
        organization_id: effectiveOrgId,
        status: isPublicRegistration ? "waitlist" : "active",
        registrationType: isPublicRegistration ? "parent_registration" : "direct",
        registrationStatus: isPublicRegistration ? "pending" : "approved",
        registrationDate: new Date(),
        registrationStep: currentStep + 1,
        registrationCompleted: currentStep === STEPS.length - 1,
      };

      const student = await firebaseServices.createStudent(effectiveOrgId, studentData);
      setTempStudentId(student.id);

      // Update guardians with student reference
      await Promise.all(
        guardianRefs.map((guardianRef: GuardianRef) =>
          firebaseServices.updateGuardian(effectiveOrgId, guardianRef.id, {
            students: [student.id],
          })
        )
      );

      if (currentStep === STEPS.length - 1) {
        if (onSuccess) onSuccess(values);
        form.reset();
        setAllergies([]);
        setCurrentStep(0);

        if (isPublicRegistration) {
          router.push(`/register/student/${effectiveOrgId}/${student.id}/review`);
        } else {
          toast({
            title: "Success",
            description: "Student has been created successfully.",
          });
          router.push(`/dashboard/students/${student.id}`);
        }
      } else {
        // Move to next step if not on the last step
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: "Failed to create student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    setIsValidating(true);
    try {
      let isValid = false;

      switch (currentStep) {
        case 0:
          isValid = await form.trigger([
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender'
          ]);
          break;
        case 1:
          isValid = await form.trigger('guardians');
          break;
        case 2:
          isValid = await form.trigger('emergencyContacts');
          break;
        case 3:
          isValid = await form.trigger('program.primaryProgram');
          break;
        case 4:
          isValid = await form.trigger([
            'medicalInfo.doctorName',
            'medicalInfo.doctorPhone'
          ]);
          break;
        case 5:
          isValid = await form.trigger([
            'terms.tuitionPayment',
            'terms.attendancePolicy',
            'terms.behaviorPolicy',
            'terms.photoRelease'
          ]);
          break;
        case 6:
          isValid = true; // Additional info is optional
          break;
        case 7:
          isValid = await form.trigger([
            'emergencyAuthorization.medicalCare',
            'emergencyAuthorization.liabilityWaiver'
          ]);
          break;
        default:
          isValid = true;
      }

      if (isValid) {
        // If we're not on the last step, save progress
        if (currentStep < STEPS.length - 1) {
          const values = form.getValues();
          if (!tempStudentId) {
            // Create initial student record
            const studentData = {
              ...values,
              organization_id: effectiveOrgId,
              status: isPublicRegistration ? "waitlist" : "active",
              registrationType: isPublicRegistration ? "parent_registration" : "direct",
              registrationStatus: isPublicRegistration ? "pending" : "approved",
              registrationDate: new Date(),
              registrationStep: currentStep + 1,
              registrationCompleted: false,
            };

            const student = await firebaseServices.createStudent(effectiveOrgId, studentData);
            setTempStudentId(student.id);
          } else {
            // Update existing student record
            await firebaseServices.updateStudent(effectiveOrgId, tempStudentId, {
              ...values,
              registrationStep: currentStep + 1,
            });
          }
        }

        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Navigation buttons component
  const NavigationButtons = () => (
    <div className="flex justify-end space-x-4 pt-6">
      {currentStep > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="bg-white hover:bg-gray-50 border-gray-200"
          disabled={isValidating || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      <Button
        type="button"
        onClick={currentStep === STEPS.length - 1 ? form.handleSubmit(onSubmit) : nextStep}
        disabled={isValidating || isSubmitting}
        className="bg-primary hover:bg-primary/90"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPublicRegistration ? "Submitting..." : "Creating Student..."}
          </>
        ) : currentStep === STEPS.length - 1 ? (
          "Complete Registration"
        ) : (
          <>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {isPublicRegistration ? "Student Registration" : "Add New Student"}
                </h1>
                <p className="text-primary-foreground/80 mt-1">
                  {isPublicRegistration
                    ? "Please fill out the form below to register your child"
                    : "Fill out the form below to add a new student"}
                </p>
              </div>
              {isPublicRegistration && (
                <div className="text-right">
                  <p className="text-primary-foreground/80 text-sm">Step {currentStep + 1} of {STEPS.length}</p>
                  <Progress value={(currentStep + 1) / STEPS.length * 100} className="mt-2" />
                </div>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <Form {...form}>
              <form className="space-y-6">
                {/* Progress Steps */}
                {!isPublicRegistration && (
                  <div className="flex justify-between items-center mb-6">
                    {STEPS.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center",
                          index < STEPS.length - 1 && "flex-1"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border",
                            currentStep === index
                              ? "bg-primary text-primary-foreground border-primary"
                              : index < currentStep
                                ? "bg-primary/20 text-primary border-primary/20"
                                : "bg-background border-border"
                          )}
                        >
                          {index + 1}
                        </div>
                        {index < STEPS.length - 1 && (
                          <div
                            className={cn(
                              "h-[2px] flex-1 mx-2",
                              index < currentStep ? "bg-primary/20" : "bg-border"
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Fields */}
                {/* Step 1: Student Information */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
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
                                    date > new Date() || date < new Date("2015-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter nationality" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="previousSchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Previous School/Daycare (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter previous school" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="languagesSpoken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Languages Spoken at Home (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter languages (comma-separated)"
                              {...field}
                              onChange={(e) => {
                                const languages = e.target.value.split(',').map(lang => lang.trim());
                                field.onChange(languages);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Guardian Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Guardian Information</h3>
                    <p className="text-sm text-muted-foreground">Please provide information for both guardians.</p>

                    {[0, 1].map((index) => (
                      <Card key={index} className="p-4">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Guardian {index + 1} <span className="text-red-500">*</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`guardians.${index}.firstName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`guardians.${index}.lastName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`guardians.${index}.relationship`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="grandparent">Grandparent</SelectItem>
                                    <SelectItem value="guardian">Legal Guardian</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`guardians.${index}.email`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`guardians.${index}.phone`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`guardians.${index}.address`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`guardians.${index}.isPrimary`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0">Primary Guardian</FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Step 3: Emergency Contacts */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Emergency Contacts</h3>
                      <Button
                        type="button"
                        onClick={addEmergencyContact}
                        variant="outline"
                        className="bg-white hover:bg-gray-50"
                      >
                        Add Emergency Contact
                      </Button>
                    </div>

                    {Array.from({ length: emergencyContactCount }).map((_, index) => (
                      <Card key={index} className="p-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-lg">
                            Emergency Contact {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                          </CardTitle>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEmergencyContact(index)}
                              className="text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`emergencyContacts.${index}.firstName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`emergencyContacts.${index}.lastName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`emergencyContacts.${index}.relationship`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter relationship to student" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`emergencyContacts.${index}.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Step 4: Program Selection */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Program Selection</h3>
                    <p className="text-sm text-muted-foreground">Select a program from the available options.</p>

                    <FormField
                      control={form.control}
                      name="program.primaryProgram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Program</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a program" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {programs.map((program) => (
                                <SelectItem key={program.id} value={program.id}>
                                  {program.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose from the available programs at our school.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 5: Medical & Health Information */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Health & Medical Information</h3>

                      <div className="space-y-2">
                        <FormLabel>Allergies</FormLabel>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add allergy"
                            value={allergyInput}
                            onChange={(e) => setAllergyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addAllergy();
                              }
                            }}
                          />
                          <Button type="button" onClick={addAllergy}>Add</Button>
                        </div>
                        {allergies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {allergies.map((allergy, index) => (
                              <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                                {allergy}
                                <button
                                  type="button"
                                  className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                                  onClick={() => removeAllergy(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="medicalInfo.allergySymptoms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergy Symptoms</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe any allergy symptoms"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalInfo.specialCareInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Care Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter special care instructions"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="medicalInfo.conditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Conditions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List any medical conditions here"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalInfo.medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medications</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List any medications here"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="medicalInfo.doctorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter doctor's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalInfo.doctorPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter doctor's phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="medicalInfo.immunizationRecords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Immunization Records</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter immunization records"
                                {...field}
                                onChange={(e) => {
                                  const records = e.target.value.split(',').map(record => record.trim());
                                  field.onChange(records);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 6: Terms & Conditions */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Terms & Conditions</h3>

                      <FormField
                        control={form.control}
                        name="terms.tuitionPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tuition Payment</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="terms.attendancePolicy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attendance Policy</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="terms.behaviorPolicy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Behavior Policy</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="terms.photoRelease"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Photo Release</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 7: Additional Information */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Additional Information</h3>

                      <FormField
                        control={form.control}
                        name="additionalInfo.siblings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Siblings</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter siblings' names (comma-separated)"
                                {...field}
                                onChange={(e) => {
                                  const siblings = e.target.value.split(',').map(sibling => sibling.trim());
                                  field.onChange(siblings);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalInfo.whyMontessori"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why Montessori</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter why you chose Montessori"
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
                      name="additionalInfo.referralSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referral Source</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter referral source" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 8: Emergency Authorization */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Emergency Authorization</h3>

                      <FormField
                        control={form.control}
                        name="emergencyAuthorization.medicalCare"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Care</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyAuthorization.liabilityWaiver"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Liability Waiver</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 9: Documents */}
                {currentStep === 8 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Required Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload the required documents for enrollment. You can also add more documents later.
                    </p>

                    {tempStudentId ? (
                      <StudentDocuments orgId={effectiveOrgId} studentId={tempStudentId} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Please save the form first to upload documents.
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <NavigationButtons />
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}