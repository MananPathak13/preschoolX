"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Search, Utensils, AlertCircle, Info } from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import firebaseServices from "@/lib/firebase-services";
import { ProtectedPage } from "@/components/protected-page";

interface Student {
    id: string;
    fullName: string;
    ageGroup: string;
    allergies?: string[];
    dietaryRestrictions?: string[];
}

interface MealPlan {
    id: string;
    date: Date;
    breakfast: string;
    lunch: string;
    snack: string;
}

interface StudentMeal {
    id: string;
    studentId: string;
    date: Date;
    breakfast: boolean;
    lunch: boolean;
    snack: boolean;
    notes: string;
}

export default function MealsPageWrapper() {
    return (
        <ProtectedPage module="meals" action="view">
            <MealsPage />
        </ProtectedPage>
    );
}

function MealsPage() {
    const { organization } = useAuth();
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [studentMeals, setStudentMeals] = useState<Record<string, StudentMeal>>({});
    const [isEditingMealPlan, setIsEditingMealPlan] = useState(false);
    const [isSavingMealPlan, setIsSavingMealPlan] = useState(false);
    const [newMealPlan, setNewMealPlan] = useState({
        breakfast: "",
        lunch: "",
        snack: ""
    });
    const [activeTab, setActiveTab] = useState("all");

    // Fetch students and meal data
    useEffect(() => {
        if (!organization) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch students
                const studentsRef = collection(db, `organizations/${organization.id}/students`);
                const q = query(studentsRef, where("status", "==", "active"), orderBy("fullName"));
                const querySnapshot = await getDocs(q);

                const studentsData: Student[] = [];

                for (const docSnapshot of querySnapshot.docs) {
                    const studentData = docSnapshot.data();
                    studentsData.push({
                        id: docSnapshot.id,
                        fullName: studentData.fullName,
                        ageGroup: studentData.ageGroup,
                        allergies: studentData.allergies || [],
                        dietaryRestrictions: studentData.dietaryRestrictions || []
                    });
                }

                setStudents(studentsData);
                setFilteredStudents(studentsData);

                // Fetch meal plan for the selected date
                await fetchMealPlan();

                // Fetch student meal records for the selected date
                await fetchStudentMeals(studentsData);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load student and meal data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [organization, selectedDate, toast]);

    // Filter students based on search query and active tab
    useEffect(() => {
        let filtered = students;

        if (searchQuery) {
            filtered = filtered.filter(student =>
                student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.ageGroup.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeTab === "allergies") {
            filtered = filtered.filter(student =>
                student.allergies && student.allergies.length > 0
            );
        } else if (activeTab === "dietary") {
            filtered = filtered.filter(student =>
                student.dietaryRestrictions && student.dietaryRestrictions.length > 0
            );
        }

        setFilteredStudents(filtered);
    }, [searchQuery, students, activeTab]);

    // Fetch meal plan for the selected date
    const fetchMealPlan = async () => {
        if (!organization) return;

        try {
            const mealPlanData = await firebaseServices.getMealPlan(organization.id, selectedDate);

            if (mealPlanData) {
                setMealPlan({
                    id: mealPlanData.id,
                    date: mealPlanData.date,
                    breakfast: mealPlanData.breakfast || "",
                    lunch: mealPlanData.lunch || "",
                    snack: mealPlanData.snack || ""
                });

                setNewMealPlan({
                    breakfast: mealPlanData.breakfast || "",
                    lunch: mealPlanData.lunch || "",
                    snack: mealPlanData.snack || ""
                });
            } else {
                setMealPlan(null);
                setNewMealPlan({
                    breakfast: "",
                    lunch: "",
                    snack: ""
                });
            }
        } catch (error) {
            console.error("Error fetching meal plan:", error);
            toast({
                title: "Error",
                description: "Failed to load meal plan. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Fetch student meal records for the selected date
    const fetchStudentMeals = async (studentsData: Student[]) => {
        if (!organization) return;

        try {
            const dateString = format(selectedDate, "yyyy-MM-dd");
            const meals: Record<string, StudentMeal> = {};

            for (const student of studentsData) {
                const mealRef = doc(db, `organizations/${organization.id}/students/${student.id}/meals/${dateString}`);
                const mealDoc = await getDoc(mealRef);

                if (mealDoc.exists()) {
                    const data = mealDoc.data();
                    meals[student.id] = {
                        id: mealDoc.id,
                        studentId: student.id,
                        date: selectedDate,
                        breakfast: data.breakfast || false,
                        lunch: data.lunch || false,
                        snack: data.snack || false,
                        notes: data.notes || ""
                    };
                } else {
                    meals[student.id] = {
                        id: dateString,
                        studentId: student.id,
                        date: selectedDate,
                        breakfast: false,
                        lunch: false,
                        snack: false,
                        notes: ""
                    };
                }
            }

            setStudentMeals(meals);
        } catch (error) {
            console.error("Error fetching student meals:", error);
            toast({
                title: "Error",
                description: "Failed to load student meal records. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Save meal plan
    const saveMealPlan = async () => {
        if (!organization) return;

        try {
            setIsSavingMealPlan(true);

            await firebaseServices.saveMealPlan(organization.id, selectedDate, {
                breakfast: newMealPlan.breakfast,
                lunch: newMealPlan.lunch,
                snack: newMealPlan.snack
            });

            setMealPlan({
                id: format(selectedDate, "yyyy-MM-dd"),
                date: selectedDate,
                breakfast: newMealPlan.breakfast,
                lunch: newMealPlan.lunch,
                snack: newMealPlan.snack
            });

            toast({
                title: "Success",
                description: "Meal plan saved successfully.",
            });

            setIsEditingMealPlan(false);
        } catch (error) {
            console.error("Error saving meal plan:", error);
            toast({
                title: "Error",
                description: "Failed to save meal plan. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSavingMealPlan(false);
        }
    };

    // Toggle student meal consumption
    const toggleMeal = async (studentId: string, mealType: 'breakfast' | 'lunch' | 'snack') => {
        if (!organization) return;

        try {
            const currentMeal = studentMeals[studentId];
            const updatedMeal = {
                ...currentMeal,
                [mealType]: !currentMeal[mealType]
            };

            // Update in Firestore using the service
            await firebaseServices.recordStudentMeal(organization.id, studentId, selectedDate, {
                breakfast: updatedMeal.breakfast,
                lunch: updatedMeal.lunch,
                snack: updatedMeal.snack,
                notes: updatedMeal.notes
            });

            // Update local state
            setStudentMeals(prev => ({
                ...prev,
                [studentId]: updatedMeal
            }));

            toast({
                title: "Updated",
                description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} ${updatedMeal[mealType] ? 'consumed' : 'not consumed'}.`,
            });
        } catch (error) {
            console.error("Error updating student meal:", error);
            toast({
                title: "Error",
                description: "Failed to update meal status. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Update student meal notes
    const updateMealNotes = async (studentId: string, notes: string) => {
        if (!organization) return;

        try {
            const currentMeal = studentMeals[studentId];
            const updatedMeal = {
                ...currentMeal,
                notes
            };

            // Update in Firestore using the service
            await firebaseServices.recordStudentMeal(organization.id, studentId, selectedDate, {
                breakfast: updatedMeal.breakfast,
                lunch: updatedMeal.lunch,
                snack: updatedMeal.snack,
                notes: updatedMeal.notes
            });

            // Update local state
            setStudentMeals(prev => ({
                ...prev,
                [studentId]: updatedMeal
            }));
        } catch (error) {
            console.error("Error updating meal notes:", error);
            toast({
                title: "Error",
                description: "Failed to update meal notes. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle date change
    const handleDateChange = (date: string) => {
        const newDate = new Date(date);
        setSelectedDate(newDate);
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Meal Tracking</h1>

            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <Input
                        type="date"
                        value={format(selectedDate, "yyyy-MM-dd")}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-40"
                    />
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Meal Plan for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
                        <ProtectedPage module="meals" action="edit" fallback={
                            <Button variant="outline" size="sm" disabled>
                                {mealPlan ? "Edit Meal Plan" : "Create Meal Plan"}
                            </Button>
                        }>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingMealPlan(true)}
                            >
                                {mealPlan ? "Edit Meal Plan" : "Create Meal Plan"}
                            </Button>
                        </ProtectedPage>
                    </div>
                </CardHeader>
                <CardContent>
                    {mealPlan ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h3 className="font-medium mb-1">Breakfast</h3>
                                <p className="text-sm text-muted-foreground">{mealPlan.breakfast || "Not specified"}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">Lunch</h3>
                                <p className="text-sm text-muted-foreground">{mealPlan.lunch || "Not specified"}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">Snack</h3>
                                <p className="text-sm text-muted-foreground">{mealPlan.snack || "Not specified"}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No meal plan for this date</p>
                    )}
                </CardContent>
            </Card>

            {/* Meal Plan Edit Dialog */}
            <Dialog open={isEditingMealPlan} onOpenChange={setIsEditingMealPlan}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Meal Plan for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
                        <DialogDescription>
                            Enter the meals that will be served to students on this day.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="breakfast">Breakfast</Label>
                            <Textarea
                                id="breakfast"
                                placeholder="Enter breakfast menu"
                                value={newMealPlan.breakfast}
                                onChange={(e) => setNewMealPlan(prev => ({ ...prev, breakfast: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lunch">Lunch</Label>
                            <Textarea
                                id="lunch"
                                placeholder="Enter lunch menu"
                                value={newMealPlan.lunch}
                                onChange={(e) => setNewMealPlan(prev => ({ ...prev, lunch: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="snack">Snack</Label>
                            <Textarea
                                id="snack"
                                placeholder="Enter snack menu"
                                value={newMealPlan.snack}
                                onChange={(e) => setNewMealPlan(prev => ({ ...prev, snack: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditingMealPlan(false)}>Cancel</Button>
                        <Button onClick={saveMealPlan} disabled={isSavingMealPlan}>
                            {isSavingMealPlan ? "Saving..." : "Save Meal Plan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Student Meal Tracking</h2>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="all">All Students</TabsTrigger>
                        <TabsTrigger value="allergies">With Allergies</TabsTrigger>
                        <TabsTrigger value="dietary">Dietary Restrictions</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No students found</p>
                            <p className="text-muted-foreground">
                                {searchQuery ? "Try adjusting your search criteria" : "No students available for the selected filters"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => {
                        const studentMeal = studentMeals[student.id];

                        return (
                            <Card key={student.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle>{student.fullName}</CardTitle>
                                        {student.allergies && student.allergies.length > 0 && (
                                            <Badge variant="destructive">Allergies</Badge>
                                        )}
                                    </div>
                                    <CardDescription>{student.ageGroup}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {student.allergies && student.allergies.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-medium text-destructive">Allergies: {student.allergies.join(", ")}</p>
                                        </div>
                                    )}
                                    {student.dietaryRestrictions && student.dietaryRestrictions.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-medium">Dietary Restrictions: {student.dietaryRestrictions.join(", ")}</p>
                                        </div>
                                    )}

                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Breakfast</span>
                                            <ProtectedPage module="meals" action="create" fallback={
                                                <Badge variant={studentMeal?.breakfast ? "default" : "outline"}>
                                                    {studentMeal?.breakfast ? "Consumed" : "Not Consumed"}
                                                </Badge>
                                            }>
                                                <Button
                                                    variant={studentMeal?.breakfast ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleMeal(student.id, 'breakfast')}
                                                >
                                                    {studentMeal?.breakfast ? "Consumed" : "Not Consumed"}
                                                </Button>
                                            </ProtectedPage>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Lunch</span>
                                            <ProtectedPage module="meals" action="create" fallback={
                                                <Badge variant={studentMeal?.lunch ? "default" : "outline"}>
                                                    {studentMeal?.lunch ? "Consumed" : "Not Consumed"}
                                                </Badge>
                                            }>
                                                <Button
                                                    variant={studentMeal?.lunch ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleMeal(student.id, 'lunch')}
                                                >
                                                    {studentMeal?.lunch ? "Consumed" : "Not Consumed"}
                                                </Button>
                                            </ProtectedPage>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Snack</span>
                                            <ProtectedPage module="meals" action="create" fallback={
                                                <Badge variant={studentMeal?.snack ? "default" : "outline"}>
                                                    {studentMeal?.snack ? "Consumed" : "Not Consumed"}
                                                </Badge>
                                            }>
                                                <Button
                                                    variant={studentMeal?.snack ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleMeal(student.id, 'snack')}
                                                >
                                                    {studentMeal?.snack ? "Consumed" : "Not Consumed"}
                                                </Button>
                                            </ProtectedPage>
                                        </div>

                                        <div className="pt-2">
                                            <Label htmlFor={`notes-${student.id}`} className="text-sm">Notes</Label>
                                            <Textarea
                                                id={`notes-${student.id}`}
                                                placeholder="Add notes about this student's meals"
                                                value={studentMeal?.notes || ""}
                                                onChange={(e) => updateMealNotes(student.id, e.target.value)}
                                                className="mt-1 text-sm"
                                                disabled={!organization?.member?.role || (organization.member.role !== "admin" && organization.member.role !== "teacher")}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
} 