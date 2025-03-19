"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { PlusCircle, Search, FileText, Calendar, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import firebaseServices from "@/lib/firebase-services";
import { ProtectedPage } from "@/components/protected-page";
import { useAuth } from "@/lib/auth-context";

// Subject options
const subjects = [
    "Art",
    "Math",
    "Science",
    "Literacy",
    "Health",
    "Social Studies",
    "Music",
    "Physical Education",
];

// Age group options
const ageGroups = [
    "2-3",
    "3-4",
    "4-5",
    "5-6",
];

export default function CurriculumPageWrapper() {
    return (
        <ProtectedPage module="curriculum" action="view">
            <CurriculumPage />
        </ProtectedPage>
    );
}

function CurriculumPage() {
    const [lessonPlans, setLessonPlans] = useState<any[]>([]);
    const [filteredLessonPlans, setFilteredLessonPlans] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, organization } = useAuth();
    const [newLessonPlan, setNewLessonPlan] = useState({
        title: "",
        description: "",
        ageGroup: "",
        subject: "",
        duration: "",
        materials: "",
        objectives: "",
        activities: "",
    });

    useEffect(() => {
        if (organization) {
            fetchCurriculum(organization.id);
        }
    }, [organization, activeTab]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredLessonPlans(lessonPlans);
        } else {
            const filtered = lessonPlans.filter(
                plan =>
                    plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plan.subject?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLessonPlans(filtered);
        }
    }, [searchTerm, lessonPlans]);

    const fetchCurriculum = async (orgId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: any = {};
            if (activeTab === "draft") {
                filters.status = "draft";
            } else if (activeTab === "approved") {
                filters.status = "approved";
            } else if (activeTab === "completed") {
                filters.status = "completed";
            }

            const curriculumData = await firebaseServices.getCurriculum(orgId, filters);
            setLessonPlans(curriculumData);
            setFilteredLessonPlans(curriculumData);
        } catch (error) {
            console.error("Error fetching curriculum:", error);
            setError("Failed to load curriculum. Please try again.");
            toast({
                title: "Error",
                description: "Failed to load curriculum. Please try again.",
                variant: "destructive",
            });
            setLessonPlans([]);
            setFilteredLessonPlans([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewLessonPlan({ ...newLessonPlan, [name]: value });
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setNewLessonPlan({ ...newLessonPlan, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!organization) return;

        try {
            setIsLoading(true);

            // Convert comma-separated strings to arrays
            const lessonPlanData = {
                ...newLessonPlan,
                materials: newLessonPlan.materials.split(",").map(item => item.trim()),
                objectives: newLessonPlan.objectives.split(",").map(item => item.trim()),
                activities: newLessonPlan.activities.split(",").map(item => item.trim()),
                status: "draft"
            };

            await firebaseServices.createCurriculumItem(organization.id, lessonPlanData);

            toast({
                title: "Success",
                description: "Lesson plan has been added successfully.",
            });

            // Reset form
            setNewLessonPlan({
                title: "",
                description: "",
                ageGroup: "",
                subject: "",
                duration: "",
                materials: "",
                objectives: "",
                activities: "",
            });

            // Close dialog
            setIsDialogOpen(false);

            // Refresh curriculum list
            fetchCurriculum(organization.id);
        } catch (error) {
            console.error("Error adding lesson plan:", error);
            toast({
                title: "Error",
                description: "Failed to add lesson plan. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCurriculum = async (curriculumId: string) => {
        if (!organization) return;

        try {
            setIsLoading(true);

            await firebaseServices.deleteCurriculumItem(organization.id, curriculumId);

            toast({
                title: "Success",
                description: "Lesson plan has been deleted successfully.",
            });

            // Refresh curriculum list
            fetchCurriculum(organization.id);
        } catch (error) {
            console.error("Error deleting lesson plan:", error);
            toast({
                title: "Error",
                description: "Failed to delete lesson plan. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
                <div className="text-red-500 mb-4">
                    <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Error Loading Curriculum</h2>
                <p className="text-muted-foreground mb-6 text-center">{error}</p>
                <Button onClick={() => organization && fetchCurriculum(organization.id)}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
                    <p className="text-muted-foreground">
                        Manage lesson plans and educational content
                    </p>
                </div>
                <ProtectedPage module="curriculum" action="create" fallback={
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Lesson Plan
                    </Button>
                }>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Lesson Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Lesson Plan</DialogTitle>
                                <DialogDescription>
                                    Enter the details of your new lesson plan below.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={newLessonPlan.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={newLessonPlan.description}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="ageGroup">Age Group</Label>
                                            <Select
                                                value={newLessonPlan.ageGroup}
                                                onValueChange={(value) => handleSelectChange("ageGroup", value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select age group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ageGroups.map((age) => (
                                                        <SelectItem key={age} value={age}>
                                                            {age} years
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Select
                                                value={newLessonPlan.subject}
                                                onValueChange={(value) => handleSelectChange("subject", value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map((subject) => (
                                                        <SelectItem key={subject} value={subject}>
                                                            {subject}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            type="number"
                                            value={newLessonPlan.duration}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="materials">Materials (comma separated)</Label>
                                        <Textarea
                                            id="materials"
                                            name="materials"
                                            value={newLessonPlan.materials}
                                            onChange={handleInputChange}
                                            placeholder="Colored paper, Safety scissors, Glue, etc."
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="objectives">Learning Objectives (comma separated)</Label>
                                        <Textarea
                                            id="objectives"
                                            name="objectives"
                                            value={newLessonPlan.objectives}
                                            onChange={handleInputChange}
                                            placeholder="Identify primary colors, Recognize basic shapes, etc."
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="activities">Activities (comma separated)</Label>
                                        <Textarea
                                            id="activities"
                                            name="activities"
                                            value={newLessonPlan.activities}
                                            onChange={handleInputChange}
                                            placeholder="Color matching game, Shape tracing, Create a shape collage, etc."
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Lesson Plan"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </ProtectedPage>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Plans</CardTitle>
                    <CardDescription>
                        Browse and manage your curriculum content
                    </CardDescription>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 mt-4">
                        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab} value={activeTab}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="draft">Draft</TabsTrigger>
                                <TabsTrigger value="approved">Approved</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search lesson plans..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredLessonPlans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>No lesson plans found</p>
                            {searchTerm && (
                                <p className="text-sm">Try adjusting your search criteria</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredLessonPlans.map((plan) => (
                                <Card key={plan.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{plan.title}</CardTitle>
                                            <Badge variant={
                                                plan.status === "approved" ? "default" :
                                                    plan.status === "completed" ? "secondary" : "secondary"
                                            }>
                                                {plan.status}
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm">
                                                <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="font-medium mr-1">Subject:</span> {plan.subject}
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="font-medium mr-1">Age Group:</span> {plan.ageGroup} years
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="font-medium mr-1">Duration:</span> {plan.duration} minutes
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between pt-0">
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                        <div className="flex space-x-2">
                                            <ProtectedPage module="curriculum" action="edit" fallback={null}>
                                                <Button variant="ghost" size="sm">
                                                    Edit
                                                </Button>
                                            </ProtectedPage>
                                            <ProtectedPage module="curriculum" action="delete" fallback={null}>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Lesson Plan</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{plan.title}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCurriculum(plan.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </ProtectedPage>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 