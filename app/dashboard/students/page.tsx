"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, UserPlus, FileEdit, Trash2, AlertCircle } from "lucide-react";
import { AddStudentForm } from "@/components/students/add-student-form";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import firebaseServices from "@/lib/firebase-services";
import { ProtectedPage } from "@/components/protected-page";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrationLinkDialog } from "@/components/students/registration-link-dialog";
import { format } from "date-fns";
import { StudentDocuments } from "@/components/students/student-documents";

export default function StudentsPageWrapper() {
  return (
    <ProtectedPage module="students" action="view">
      <StudentsPage />
    </ProtectedPage>
  );
}

function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, organization } = useAuth();

  const AGE_GROUPS = [
    { value: "all", label: "All Ages" },
    { value: "infant", label: "Infant (0-1)" },
    { value: "toddler", label: "Toddler (1-2)" },
    { value: "preschool", label: "Preschool (3-4)" },
    { value: "prek", label: "Pre-K (4-5)" }
  ];

  useEffect(() => {
    if (organization) {
      fetchStudents(organization.id);
    }
  }, [organization, selectedTab, selectedAgeGroup]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student =>
          student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.ageGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.guardianName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async (orgId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (selectedTab !== "all") {
        filters.status = selectedTab;
      }
      if (selectedAgeGroup !== "all") {
        filters.ageGroup = selectedAgeGroup;
      }

      const studentsData = await firebaseServices.getStudents(orgId, filters);
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (studentData: any) => {
    try {
      if (!organization) return;

      await firebaseServices.createStudent(organization.id, studentData);

      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Student has been added successfully.",
      });

      fetchStudents(organization.id);
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = async (studentData: any) => {
    try {
      if (!organization || !selectedStudent) return;

      await firebaseServices.updateStudent(organization.id, selectedStudent.id, studentData);

      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Student has been updated successfully.",
      });

      fetchStudents(organization.id);
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      if (!organization) return;

      await firebaseServices.deleteStudent(organization.id, studentId);

      toast({
        title: "Success",
        description: "Student has been deleted successfully.",
      });

      fetchStudents(organization.id);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-16 w-16 mx-auto mb-2" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Students</h2>
        <p className="text-muted-foreground mb-6 text-center">{error}</p>
        <Button onClick={() => organization && fetchStudents(organization.id)}>Try Again</Button>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <div className="flex gap-2">
          <RegistrationLinkDialog
            organizationId={organization.id}
            trigger={
              <Button variant="outline">
                Parent Registration Link
              </Button>
            }
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Student Manually</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Fill out the form below to add a new student manually. For parent registrations, please share the registration link.
                </DialogDescription>
              </DialogHeader>
              <AddStudentForm
                onSuccess={() => setIsAddDialogOpen(false)}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            View and manage all students enrolled in your preschool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_GROUPS.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Primary Guardian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mb-2" />
                          <p>No students found</p>
                          {searchQuery && (
                            <p className="text-sm">Try adjusting your search criteria</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.ageGroup}</TableCell>
                        <TableCell>{student.guardian1?.firstName} {student.guardian1?.lastName}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : student.status === 'waitlist'
                              ? 'bg-yellow-100 text-yellow-800'
                              : student.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {student.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                            <ProtectedPage module="students" action="edit">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <FileEdit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </ProtectedPage>
                            <ProtectedPage module="students" action="delete">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this student? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </ProtectedPage>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Student Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View detailed information about {selectedStudent?.fullName}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{selectedStudent.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p>{format(selectedStudent.dateOfBirth?.toDate(), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p>{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                    <p>{selectedStudent.nationality || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Languages Spoken</p>
                    <p>{selectedStudent.languagesSpoken?.join(", ") || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Previous School</p>
                    <p>{selectedStudent.previousSchool || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Guardian</p>
                    <p>{selectedStudent.guardian1?.firstName} {selectedStudent.guardian1?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.guardian1?.relationship}</p>
                    <p>{selectedStudent.guardian1?.email}</p>
                    <p>{selectedStudent.guardian1?.phone}</p>
                  </div>
                  {selectedStudent.guardian2 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Secondary Guardian</p>
                      <p>{selectedStudent.guardian2?.firstName} {selectedStudent.guardian2?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.guardian2?.relationship}</p>
                      <p>{selectedStudent.guardian2?.email}</p>
                      <p>{selectedStudent.guardian2?.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Emergency Contact</p>
                    <p>{selectedStudent.emergencyContact1?.firstName} {selectedStudent.emergencyContact1?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.emergencyContact1?.relationship}</p>
                    <p>{selectedStudent.emergencyContact1?.phone}</p>
                  </div>
                  {selectedStudent.emergencyContact2 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Secondary Emergency Contact</p>
                      <p>{selectedStudent.emergencyContact2?.firstName} {selectedStudent.emergencyContact2?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.emergencyContact2?.relationship}</p>
                      <p>{selectedStudent.emergencyContact2?.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Program Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Program Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Program</p>
                    <p>{selectedStudent.program?.primaryProgram}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Extended Care</p>
                    <p>{selectedStudent.program?.extendedCare || "Not enrolled"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p>{format(selectedStudent.program?.startDate?.toDate(), "PPP")}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                    <p>{selectedStudent.medicalInfo?.allergies?.join(", ") || "None"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medical Conditions</p>
                    <p>{selectedStudent.medicalInfo?.conditions || "None"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                    <p>{selectedStudent.medicalInfo?.doctorName}</p>
                    <p>{selectedStudent.medicalInfo?.doctorPhone}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Documents</h3>
                <StudentDocuments
                  orgId={organization.id}
                  studentId={selectedStudent.id}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <AddStudentForm
              onSuccess={handleEditStudent}
              initialData={selectedStudent}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}