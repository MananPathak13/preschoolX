"use client";

/**
 * Firebase Services
 * 
 * This file contains utility functions for interacting with Firebase services
 * including Firestore and Storage.
 */

import { db, auth, storage } from '@/lib/firebase-config';
import type {
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    QueryConstraint,
    QueryDocumentSnapshot,
    Timestamp,
    WhereFilterOp,
    OrderByDirection
} from 'firebase/firestore';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    onSnapshot,
    WriteBatch,
    writeBatch,
    addDoc,
    type Query,
    type CollectionReference,
    startAfter
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';
import { UserPermissions, UserRole } from '@/lib/permissions-context';

/**
 * Class for Firebase database services
 * Provides methods for interacting with Firestore database
 */
class FirebaseServices {
    private db;
    private auth;
    private storage;

    constructor() {
        this.db = db;
        this.auth = auth;
        this.storage = storage;
    }

    /**
     * Get organization details
     */
    async getOrganization(orgId: string) {
        try {
            const docRef = doc(this.db, 'organizations', orgId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error('Error getting organization:', error);
            throw error;
        }
    }

    /**
     * Get all organizations a user belongs to
     */
    async getUserOrganizations(userId: string) {
        try {
            const userDoc = await getDoc(doc(this.db, 'users', userId));

            if (!userDoc.exists()) {
                return [];
            }

            const userData = userDoc.data();
            const organizationIds = userData.organizations || [];

            if (organizationIds.length === 0) {
                return [];
            }

            const organizations = [];
            for (const orgId of organizationIds) {
                const org = await this.getOrganization(orgId);
                if (org) {
                    organizations.push(org);
                }
            }

            return organizations;
        } catch (error) {
            console.error('Error getting user organizations:', error);
            throw error;
        }
    }

    /**
     * Get a user's membership in an organization
     */
    async getUserMembership(orgId: string, userId: string) {
        try {
            const memberRef = doc(this.db, `organizations/${orgId}/members`, userId);
            const memberSnap = await getDoc(memberRef);

            if (!memberSnap.exists()) {
                return null;
            }

            return {
                id: memberSnap.id,
                ...memberSnap.data()
            };
        } catch (error) {
            console.error('Error getting user membership:', error);
            throw error;
        }
    }

    /**
     * Get all students in an organization with filtering options
     */
    async getStudents(orgId: string, filters: {
        status?: string;
        ageGroup?: string;
        searchTerm?: string;
    } = {}) {
        try {
            const studentsRef = collection(this.db, `organizations/${orgId}/students`);
            let q = query(studentsRef);

            // Apply filters one at a time to avoid complex composite indexes
            // Start with a base query
            if (filters.status && filters.status !== 'all') {
                // Simple status filter without ordering
                q = query(studentsRef, where("status", "==", filters.status));
            } else if (filters.ageGroup && filters.ageGroup !== 'all') {
                // Simple age group filter without ordering
                q = query(studentsRef, where("ageGroup", "==", filters.ageGroup));
            } else {
                // No filters, just get all students
                q = query(studentsRef);
            }

            const querySnapshot = await getDocs(q);

            let students = querySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side instead of using orderBy to avoid index requirements
            students.sort((a: any, b: any) => {
                if (a.fullName && b.fullName) {
                    return a.fullName.localeCompare(b.fullName);
                }
                return 0;
            });

            // Client-side filtering for search term (if provided)
            if (filters.searchTerm && filters.searchTerm.trim() !== "") {
                const searchTerm = filters.searchTerm.toLowerCase();
                students = students.filter((student: any) =>
                    student.fullName?.toLowerCase().includes(searchTerm) ||
                    student.ageGroup?.toLowerCase().includes(searchTerm) ||
                    student.guardianName?.toLowerCase().includes(searchTerm)
                );
            }

            return students;
        } catch (error) {
            console.error("Error getting students:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
                console.log("Creating index link:", error.message.split("https")[1]);
            }
            throw error; // Rethrow to allow proper error handling upstream
        }
    }

    /**
     * Get a single student by ID
     */
    async getStudent(orgId: string, studentId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/students`, studentId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error("Error getting student:", error);
            throw error;
        }
    }

    /**
     * Create a new student
     */
    async createStudent(orgId: string, studentData: any) {
        try {
            // Ensure required fields
            if (!studentData.firstName || !studentData.lastName) {
                throw new Error("First name and last name are required");
            }

            // Add computed fields
            const student = {
                ...studentData,
                fullName: `${studentData.firstName} ${studentData.lastName}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: studentData.status || "active",
            };

            // Add to students subcollection
            const studentsRef = collection(this.db, `organizations/${orgId}/students`);
            const docRef = await addDoc(studentsRef, student);

            return {
                id: docRef.id,
                ...student
            };
        } catch (error) {
            console.error("Error creating student:", error);
            throw error;
        }
    }

    /**
     * Update a student
     */
    async updateStudent(orgId: string, studentId: string, studentData: any) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/students`, studentId);

            // Update computed fields
            const updates = {
                ...studentData,
                fullName: `${studentData.firstName} ${studentData.lastName}`,
                updatedAt: serverTimestamp(),
            };

            await updateDoc(docRef, updates);

            return {
                id: studentId,
                ...updates
            };
        } catch (error) {
            console.error("Error updating student:", error);
            throw error;
        }
    }

    /**
     * Delete a student
     */
    async deleteStudent(orgId: string, studentId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/students`, studentId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting student:", error);
            throw error;
        }
    }

    /**
     * Update a user's permissions in an organization
     */
    async updateUserPermissions(orgId: string, userId: string, permissions: UserPermissions) {
        try {
            const memberRef = doc(this.db, `organizations/${orgId}/members`, userId);
            await updateDoc(memberRef, {
                permissions,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating user permissions:', error);
            throw error;
        }
    }

    /**
     * Update a user's role in an organization
     */
    async updateUserRole(orgId: string, userId: string, role: UserRole) {
        try {
            const memberRef = doc(this.db, `organizations/${orgId}/members`, userId);
            await updateDoc(memberRef, {
                role,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    /**
     * Get all staff members in an organization with filtering options
     */
    async getStaff(orgId: string, filters: {
        status?: string;
        department?: string;
        searchTerm?: string;
    } = {}) {
        try {
            const staffRef = collection(this.db, `organizations/${orgId}/staff`);
            const constraints: QueryConstraint[] = [];

            if (filters.status) {
                constraints.push(where("status", "==", filters.status));
            }

            if (filters.department) {
                constraints.push(where("department", "==", filters.department));
            }

            // Always sort by name
            constraints.push(orderBy("lastName"));

            const q = query(staffRef, ...constraints);
            const querySnapshot = await getDocs(q);

            let staffMembers = querySnapshot.docs.map((doc: DocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filtering for search term (if provided)
            if (filters.searchTerm && filters.searchTerm.trim() !== "") {
                const searchTerm = filters.searchTerm.toLowerCase();
                staffMembers = staffMembers.filter((staff: { firstName?: string; lastName?: string; position?: string; department?: string }) =>
                    staff.firstName?.toLowerCase().includes(searchTerm) ||
                    staff.lastName?.toLowerCase().includes(searchTerm) ||
                    `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm) ||
                    staff.position?.toLowerCase().includes(searchTerm) ||
                    staff.department?.toLowerCase().includes(searchTerm)
                );
            }

            return staffMembers;
        } catch (error) {
            console.error("Error getting staff:", error);
            throw error;
        }
    }

    /**
     * Get a single staff member by ID
     */
    async getStaffMember(orgId: string, userId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/staff`, userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error("Error getting staff member:", error);
            throw error;
        }
    }

    /**
     * Create a new staff member
     */
    async createStaffMember(orgId: string, staffData: any) {
        try {
            // Ensure required fields
            if (!staffData.firstName || !staffData.lastName) {
                throw new Error("First name and last name are required");
            }

            // Add computed fields
            const staff = {
                ...staffData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: staffData.status || "active",
            };

            // Add to staff subcollection
            const staffRef = collection(this.db, `organizations/${orgId}/staff`);
            const docRef = await addDoc(staffRef, staff);

            return {
                id: docRef.id,
                ...staff
            };
        } catch (error) {
            console.error("Error creating staff member:", error);
            throw error;
        }
    }

    /**
     * Update a staff member
     */
    async updateStaffMember(orgId: string, userId: string, staffData: any) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/staff`, userId);

            // Update fields
            const updates = {
                ...staffData,
                updatedAt: serverTimestamp(),
            };

            await updateDoc(docRef, updates);

            return {
                id: userId,
                ...updates
            };
        } catch (error) {
            console.error("Error updating staff member:", error);
            throw error;
        }
    }

    /**
     * Delete a staff member
     */
    async deleteStaffMember(orgId: string, userId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/staff`, userId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting staff member:", error);
            throw error;
        }
    }

    /**
     * Get curriculum items with filtering options
     */
    async getCurriculumItems(orgId: string, filters: {
        ageGroup?: string;
        subject?: string;
        status?: string;
        searchTerm?: string;
    } = {}) {
        try {
            const curriculumRef = collection(this.db, `organizations/${orgId}/curriculum`);
            const constraints: QueryConstraint[] = [];

            if (filters.ageGroup) {
                constraints.push(where("ageGroup", "==", filters.ageGroup));
            }

            if (filters.subject) {
                constraints.push(where("subject", "==", filters.subject));
            }

            if (filters.status) {
                constraints.push(where("status", "==", filters.status));
            }

            // Always sort by most recently created
            constraints.push(orderBy("createdAt", "desc"));

            const q = query(curriculumRef, ...constraints);
            const querySnapshot = await getDocs(q);

            let curriculumItems = querySnapshot.docs.map((doc: DocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filtering for search term (if provided)
            if (filters.searchTerm && filters.searchTerm.trim() !== "") {
                const searchTerm = filters.searchTerm.toLowerCase();
                curriculumItems = curriculumItems.filter((item: { title: string; description: string; subject: string; objectives?: string[]; tags?: string[] }) =>
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    item.subject.toLowerCase().includes(searchTerm) ||
                    item.objectives?.some(
                        (objective: string) => objective.toLowerCase().includes(searchTerm)
                    ) ||
                    item.tags?.some(
                        (tag: string) => tag.toLowerCase().includes(searchTerm)
                    )
                );
            }

            return curriculumItems;
        } catch (error) {
            console.error("Error getting curriculum items:", error);
            throw error;
        }
    }

    /**
     * Get all curriculum items in an organization with filtering options
     */
    async getCurriculum(orgId: string, filters: {
        status?: string;
        ageGroup?: string;
        subject?: string;
        searchTerm?: string;
    } = {}) {
        try {
            const curriculumRef = collection(this.db, `organizations/${orgId}/curriculum`);
            const constraints: QueryConstraint[] = [];

            if (filters.status) {
                constraints.push(where("status", "==", filters.status));
            }

            if (filters.ageGroup) {
                constraints.push(where("ageGroup", "==", filters.ageGroup));
            }

            if (filters.subject) {
                constraints.push(where("subject", "==", filters.subject));
            }

            // Always sort by creation date (newest first)
            constraints.push(orderBy("createdAt", "desc"));

            const q = query(curriculumRef, ...constraints);
            const querySnapshot = await getDocs(q);

            let curriculumItems = querySnapshot.docs.map((doc: DocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filtering for search term (if provided)
            if (filters.searchTerm && filters.searchTerm.trim() !== "") {
                const searchTerm = filters.searchTerm.toLowerCase();
                curriculumItems = curriculumItems.filter((item: { title?: string; description?: string; subject?: string; tags?: string[] }) =>
                    item.title?.toLowerCase().includes(searchTerm) ||
                    item.description?.toLowerCase().includes(searchTerm) ||
                    item.subject?.toLowerCase().includes(searchTerm) ||
                    item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
                );
            }

            return curriculumItems;
        } catch (error) {
            console.error("Error getting curriculum:", error);
            throw error;
        }
    }

    /**
     * Get a single curriculum item by ID
     */
    async getCurriculumItem(orgId: string, curriculumId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/curriculum`, curriculumId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error("Error getting curriculum item:", error);
            throw error;
        }
    }

    /**
     * Create a new curriculum item
     */
    async createCurriculumItem(orgId: string, curriculumData: any) {
        try {
            // Ensure required fields
            if (!curriculumData.title || !curriculumData.ageGroup) {
                throw new Error("Title and age group are required");
            }

            // Add computed fields
            const curriculum = {
                ...curriculumData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: curriculumData.status || "draft",
                createdBy: this.auth.currentUser?.uid || null
            };

            // Add to curriculum subcollection
            const curriculumRef = collection(this.db, `organizations/${orgId}/curriculum`);
            const docRef = await addDoc(curriculumRef, curriculum);

            return {
                id: docRef.id,
                ...curriculum
            };
        } catch (error) {
            console.error("Error creating curriculum item:", error);
            throw error;
        }
    }

    /**
     * Update a curriculum item
     */
    async updateCurriculumItem(orgId: string, curriculumId: string, curriculumData: any) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/curriculum`, curriculumId);

            // Update fields
            const updates = {
                ...curriculumData,
                updatedAt: serverTimestamp(),
            };

            await updateDoc(docRef, updates);

            return {
                id: curriculumId,
                ...updates
            };
        } catch (error) {
            console.error("Error updating curriculum item:", error);
            throw error;
        }
    }

    /**
     * Delete a curriculum item
     */
    async deleteCurriculumItem(orgId: string, curriculumId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/curriculum`, curriculumId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("Error deleting curriculum item:", error);
            throw error;
        }
    }

    /**
     * Get attendance for a specific date and class
     * @param orgId Organization ID
     * @param date Date in YYYY-MM-DD format
     * @param classId Class ID or 'all' for all classes
     * @returns Attendance data including sign-in and sign-out times
     */
    async getAttendance(orgId: string, date: string, classId: string) {
        try {
            if (!orgId) throw new Error("Organization ID is required");
            if (!date) throw new Error("Date is required");

            // If classId is 'all', get attendance for all classes
            if (classId === 'all') {
                const classesCollectionRef = collection(this.db, `organizations/${orgId}/attendance/${date}/classes`);
                const querySnapshot = await getDocs(classesCollectionRef);

                // Combine all attendance data
                const combinedData: Record<string, any> = {
                    students: {}
                };

                querySnapshot.forEach((doc: DocumentSnapshot) => {
                    const data = doc.data();
                    if (data?.students) {
                        combinedData.students = {
                            ...combinedData.students,
                            ...data.students
                        };
                    }
                });

                return combinedData;
            } else {
                // Get attendance for specific class
                const docRef = doc(this.db, `organizations/${orgId}/attendance/${date}/classes`, classId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    return null;
                }

                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }
        } catch (error) {
            console.error("Error getting attendance:", error);
            throw error;
        }
    }

    /**
     * Save attendance for a specific date and class
     * @param orgId Organization ID
     * @param date Date in YYYY-MM-DD format
     * @param classId Class ID
     * @param attendanceData Attendance data including sign-in and sign-out times
     */
    async saveAttendance(orgId: string, date: string, classId: string, attendanceData: any) {
        try {
            if (!orgId) throw new Error("Organization ID is required");
            if (!date) throw new Error("Date is required");
            if (!classId) throw new Error("Class ID is required");

            const docRef = doc(this.db, `organizations/${orgId}/attendance/${date}/classes`, classId);
            const docSnap = await getDoc(docRef);

            // Add metadata
            const data = {
                ...attendanceData,
                date: Timestamp.fromDate(new Date(date)),
                classId,
                updatedBy: this.auth.currentUser?.uid || null,
                updatedAt: serverTimestamp(),
            };

            // Process student records to ensure proper format
            if (data.students) {
                Object.keys(data.students).forEach(studentId => {
                    const studentRecord = data.students[studentId];

                    // Ensure timestamp is a Firestore timestamp
                    if (studentRecord.timestamp && typeof studentRecord.timestamp === 'string') {
                        studentRecord.timestamp = Timestamp.fromDate(new Date(studentRecord.timestamp));
                    }

                    // Store who recorded the attendance
                    if (!studentRecord.recordedBy) {
                        studentRecord.recordedBy = this.auth.currentUser?.uid || null;
                    }
                });
            }

            if (!docSnap.exists()) {
                // If record doesn't exist, add createdBy and createdAt
                data.createdBy = this.auth.currentUser?.uid || null;
                data.createdAt = serverTimestamp();
                await setDoc(docRef, data);
            } else {
                // Otherwise just update
                await updateDoc(docRef, data);
            }

            return {
                id: docRef.id,
                ...data
            };
        } catch (error) {
            console.error("Error saving attendance:", error);
            throw error;
        }
    }

    /**
     * Get attendance statistics for a date range
     */
    async getAttendanceStats(orgId: string, startDate: string, endDate: string, classId?: string) {
        try {
            // Convert dates to timestamps for comparison
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Initialize stats object
            const stats = {
                totalDays: 0,
                presentCount: 0,
                absentCount: 0,
                tardyCount: 0,
                excusedCount: 0,
                attendanceRate: 0,
                dailyStats: [] as any[]
            };

            // Loop through each day in the range
            const currentDate = new Date(start);
            while (currentDate <= end) {
                const dateString = currentDate.toISOString().split('T')[0];

                // Get all classes for this date or just the specified class
                let classesRef;
                if (classId) {
                    // If classId is specified, get just that class
                    const docRef = doc(this.db, `organizations/${orgId}/attendance/${dateString}/classes`, classId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const students = data.students || {};

                        // Count attendance statuses
                        let present = 0;
                        let absent = 0;
                        let tardy = 0;
                        let excused = 0;

                        Object.values(students).forEach((status: any) => {
                            if (status.status === 'present') present++;
                            else if (status.status === 'absent') absent++;
                            else if (status.status === 'tardy') tardy++;
                            else if (status.status === 'excused') excused++;
                        });

                        const total = present + absent + tardy + excused;

                        // Add to overall stats
                        stats.totalDays++;
                        stats.presentCount += present;
                        stats.absentCount += absent;
                        stats.tardyCount += tardy;
                        stats.excusedCount += excused;

                        // Add daily stat
                        stats.dailyStats.push({
                            date: dateString,
                            present,
                            absent,
                            tardy,
                            excused,
                            total,
                            rate: total > 0 ? Math.round((present / total) * 100) : 0
                        });
                    }
                } else {
                    // If no classId, get all classes for this date
                    classesRef = collection(this.db, `organizations/${orgId}/attendance/${dateString}/classes`);
                    const querySnapshot = await getDocs(classesRef);

                    if (!querySnapshot.empty) {
                        let dailyPresent = 0;
                        let dailyAbsent = 0;
                        let dailyTardy = 0;
                        let dailyExcused = 0;
                        let dailyTotal = 0;

                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            const students = data.students || {};

                            Object.values(students).forEach((status: any) => {
                                if (status.status === 'present') dailyPresent++;
                                else if (status.status === 'absent') dailyAbsent++;
                                else if (status.status === 'tardy') dailyTardy++;
                                else if (status.status === 'excused') dailyExcused++;
                            });
                        });

                        dailyTotal = dailyPresent + dailyAbsent + dailyTardy + dailyExcused;

                        // Add to overall stats
                        stats.totalDays++;
                        stats.presentCount += dailyPresent;
                        stats.absentCount += dailyAbsent;
                        stats.tardyCount += dailyTardy;
                        stats.excusedCount += dailyExcused;

                        // Add daily stat
                        stats.dailyStats.push({
                            date: dateString,
                            present: dailyPresent,
                            absent: dailyAbsent,
                            tardy: dailyTardy,
                            excused: dailyExcused,
                            total: dailyTotal,
                            rate: dailyTotal > 0 ? Math.round((dailyPresent / dailyTotal) * 100) : 0
                        });
                    }
                }

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Calculate overall attendance rate
            const totalAttendance = stats.presentCount + stats.absentCount + stats.tardyCount + stats.excusedCount;
            stats.attendanceRate = totalAttendance > 0 ? Math.round((stats.presentCount / totalAttendance) * 100) : 0;

            return stats;
        } catch (error) {
            console.error("Error getting attendance stats:", error);
            throw error;
        }
    }

    /**
     * Get all classes in an organization with filtering options
     */
    async getClasses(orgId: string, filters: {
        status?: string;
        ageGroup?: string;
        searchTerm?: string;
        page?: number;
        limit?: number;
    } = {}) {
        try {
            const classesRef = collection(this.db, `organizations/${orgId}/classes`);
            const constraints: QueryConstraint[] = [];

            if (filters.status) {
                constraints.push(where("status", "==", filters.status));
            }

            if (filters.ageGroup) {
                constraints.push(where("age_group", "==", filters.ageGroup));
            }

            if (filters.searchTerm) {
                constraints.push(
                    where("name", ">=", filters.searchTerm),
                    where("name", "<=", filters.searchTerm + "\uf8ff")
                );
            }

            // Add pagination
            if (filters.page && filters.limit) {
                const startAt = (filters.page - 1) * filters.limit;
                constraints.push(
                    orderBy("name"),
                    limit(filters.limit),
                    startAfter(startAt)
                );
            } else {
                constraints.push(orderBy("name"));
            }

            const q = query(classesRef, ...constraints);
            const querySnapshot = await getDocs(q);

            const classes = querySnapshot.docs.map((doc: DocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            }));

            return classes;
        } catch (error) {
            console.error("Error fetching classes:", error);
            throw error;
        }
    }

    /**
     * Get a single class by ID
     */
    async getClass(orgId: string, classId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/classes`, classId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error("Error getting class:", error);
            throw error;
        }
    }

    /**
     * Get all enrollments for a class
     */
    async getClassEnrollments(orgId: string, classId: string) {
        try {
            const enrollmentsRef = collection(this.db, `organizations/${orgId}/classes/${classId}/enrollments`);
            const querySnapshot = await getDocs(enrollmentsRef);

            // Get all enrollment data
            const enrollmentDocs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get full student details for each enrollment
            const enrollmentsWithStudents = await Promise.all(
                enrollmentDocs.map(async (enrollment) => {
                    const studentData = await this.getStudent(orgId, enrollment.studentId);
                    return {
                        ...enrollment,
                        student: studentData
                    };
                })
            );

            return enrollmentsWithStudents;
        } catch (error) {
            console.error("Error getting class enrollments:", error);
            throw error;
        }
    }

    /**
     * Create a new class
     */
    async createClass(orgId: string, classData: any) {
        try {
            // Ensure required fields
            if (!classData.name || !classData.ageGroup) {
                throw new Error("Class name and age group are required");
            }

            // Add metadata
            const classObj = {
                ...classData,
                active: classData.active !== undefined ? classData.active : true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(
                collection(this.db, `organizations/${orgId}/classes`),
                classObj
            );

            return {
                id: docRef.id,
                ...classObj
            };
        } catch (error) {
            console.error("Error creating class:", error);
            throw error;
        }
    }

    /**
     * Update an existing class
     */
    async updateClass(orgId: string, classId: string, classData: any) {
        try {
            const classRef = doc(this.db, `organizations/${orgId}/classes`, classId);

            // Add timestamp
            const updatedData = {
                ...classData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(classRef, updatedData);

            return {
                id: classId,
                ...updatedData
            };
        } catch (error) {
            console.error("Error updating class:", error);
            throw error;
        }
    }

    /**
     * Enroll a student in a class
     */
    async enrollStudent(orgId: string, classId: string, studentId: string, enrollmentData: any = {}) {
        try {
            const enrollmentRef = doc(this.db, `organizations/${orgId}/classes/${classId}/enrollments`, studentId);

            const enrollment = {
                studentId,
                enrollmentDate: enrollmentData.enrollmentDate || serverTimestamp(),
                status: enrollmentData.status || "active",
                ...enrollmentData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(enrollmentRef, enrollment);

            return {
                id: studentId,
                ...enrollment
            };
        } catch (error) {
            console.error("Error enrolling student:", error);
            throw error;
        }
    }

    /**
     * Remove a student from a class
     */
    async unenrollStudent(orgId: string, classId: string, studentId: string, hardDelete = false) {
        try {
            const enrollmentRef = doc(this.db, `organizations/${orgId}/classes/${classId}/enrollments`, studentId);

            if (hardDelete) {
                // Permanently remove the enrollment
                await deleteDoc(enrollmentRef);
            } else {
                // Soft delete - mark as inactive
                await updateDoc(enrollmentRef, {
                    status: "inactive",
                    exitDate: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            return true;
        } catch (error) {
            console.error("Error unenrolling student:", error);
            throw error;
        }
    }

    /**
     * Get all parents of a student
     */
    async getStudentGuardians(orgId: string, studentId: string) {
        try {
            const guardiansRef = collection(this.db, `organizations/${orgId}/students/${studentId}/guardians`);
            const querySnapshot = await getDocs(guardiansRef);

            const guardians = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return guardians;
        } catch (error) {
            console.error("Error getting student guardians:", error);
            throw error;
        }
    }

    /**
     * Add a guardian to a student
     */
    async addStudentGuardian(orgId: string, studentId: string, guardianData: any) {
        try {
            // Add metadata
            const guardian = {
                ...guardianData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                relationship: guardianData.relationship || "parent"
            };

            const docRef = await addDoc(
                collection(this.db, `organizations/${orgId}/students/${studentId}/guardians`),
                guardian
            );

            return {
                id: docRef.id,
                ...guardian
            };
        } catch (error) {
            console.error("Error adding student guardian:", error);
            throw error;
        }
    }

    /**
     * Get all students for a parent/guardian user
     */
    async getParentStudents(orgId: string, parentId: string): Promise<any[]> {
        try {
            // First get all students in the organization
            const studentsRef = collection(this.db, `organizations/${orgId}/students`);
            const studentsSnapshot = await getDocs(studentsRef);

            const students = [];

            // For each student, check if the parent is listed as a guardian
            for (const studentDoc of studentsSnapshot.docs) {
                const studentId = studentDoc.id;
                const guardiansRef = collection(this.db, `organizations/${orgId}/students/${studentId}/guardians`);
                const guardiansQuery = query(guardiansRef, where("userId", "==", parentId));
                const guardiansSnapshot = await getDocs(guardiansQuery);

                // If this parent is a guardian for this student, add the student to the result
                if (!guardiansSnapshot.empty) {
                    const guardianData = guardiansSnapshot.docs[0].data();
                    students.push({
                        id: studentId,
                        ...studentDoc.data(),
                        guardianRelationship: guardianData.relationship || 'parent'
                    });
                }
            }

            return students;
        } catch (error) {
            console.error("Error getting parent students:", error);
            return []; // Return empty array on error
        }
    }

    async searchGuardians(searchTerm: string): Promise<any[]> {
        try {
            const guardianRef = collection(this.db, 'guardians');
            const q = query(
                guardianRef,
                where('name', '>=', searchTerm),
                where('name', '<=', searchTerm + '\uf8ff'),
                limit(5)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error searching guardians:', error);
            throw error;
        }
    }

    async getTeacherClasses(orgId: string, teacherId: string): Promise<any[]> {
        try {
            const classesRef = collection(this.db, 'organizations', orgId, 'classes');
            const q = query(classesRef, where('teacherId', '==', teacherId));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting teacher classes:', error);
            throw error;
        }
    }

    async getTeacherLessons(orgId: string, teacherId: string): Promise<any[]> {
        try {
            const lessonsRef = collection(this.db, 'organizations', orgId, 'lessons');
            const q = query(
                lessonsRef,
                where('teacherId', '==', teacherId),
                where('date', '>=', new Date().toISOString().split('T')[0]),
                orderBy('date', 'asc'),
                limit(5)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting teacher lessons:', error);
            throw error;
        }
    }

    async getParentChildren(orgId: string, parentId: string): Promise<any[]> {
        try {
            const studentsRef = collection(this.db, 'organizations', orgId, 'students');
            const q = query(studentsRef, where('guardianId', '==', parentId));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting parent children:', error);
            throw error;
        }
    }

    async getChildrenAttendance(orgId: string, studentIds: string[], date: string): Promise<any[]> {
        try {
            // If no student IDs, return empty array
            if (!studentIds || studentIds.length === 0) {
                return [];
            }

            const attendanceRef = collection(this.db, 'organizations', orgId, 'attendance');
            const q = query(
                attendanceRef,
                where('date', '==', date),
                where('studentId', 'in', studentIds)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting children attendance:", error);
            return []; // Return empty array on error
        }
    }

    async getUpcomingEvents(orgId: string): Promise<any[]> {
        try {
            const eventsRef = collection(this.db, 'organizations', orgId, 'events');
            const q = query(
                eventsRef,
                where('date', '>=', new Date().toISOString().split('T')[0]),
                orderBy('date', 'asc'),
                limit(5)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting upcoming events:', error);
            throw error;
        }
    }

    /**
     * Record student attendance
     */
    async recordAttendance(orgId: string, studentId: string, data: {
        date: Date;
        checkIn: string;
        checkInBy?: string;
        checkOut?: string | null;
        checkOutBy?: string;
        notes?: string;
    }) {
        try {
            const dateString = this.formatDate(data.date);
            const attendanceRef = doc(this.db, `organizations/${orgId}/students/${studentId}/attendance/${dateString}`);

            // Check if attendance record already exists
            const attendanceDoc = await getDoc(attendanceRef);

            if (attendanceDoc.exists()) {
                // Update existing record
                await updateDoc(attendanceRef, {
                    ...data,
                    date: Timestamp.fromDate(data.date),
                    updatedAt: serverTimestamp()
                });
            } else {
                // Create new record
                await setDoc(attendanceRef, {
                    ...data,
                    date: Timestamp.fromDate(data.date),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            return {
                id: dateString,
                ...data
            };
        } catch (error) {
            console.error('Error recording attendance:', error);
            throw error;
        }
    }

    /**
     * Get student attendance records for a date range
     */
    async getStudentAttendance(orgId: string, studentId: string, startDate: Date, endDate: Date) {
        try {
            const attendanceRef = collection(this.db, `organizations/${orgId}/students/${studentId}/attendance`);
            const startDateString = this.formatDate(startDate);
            const endDateString = this.formatDate(endDate);

            const q = query(
                attendanceRef,
                where("date", ">=", Timestamp.fromDate(startDate)),
                where("date", "<=", Timestamp.fromDate(endDate)),
                orderBy("date", "desc")
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));
        } catch (error) {
            console.error('Error getting student attendance:', error);
            throw error;
        }
    }

    /**
     * Create or update a meal plan for a specific date
     */
    async saveMealPlan(orgId: string, date: Date, mealPlan: {
        breakfast: string;
        lunch: string;
        snack: string;
    }) {
        try {
            const dateString = this.formatDate(date);
            const mealPlanRef = doc(this.db, `organizations/${orgId}/mealPlans/${dateString}`);

            await setDoc(mealPlanRef, {
                ...mealPlan,
                date: Timestamp.fromDate(date),
                updatedAt: serverTimestamp()
            }, { merge: true });

            return {
                id: dateString,
                date,
                ...mealPlan
            };
        } catch (error) {
            console.error('Error saving meal plan:', error);
            throw error;
        }
    }

    /**
     * Get meal plan for a specific date
     */
    async getMealPlan(orgId: string, date: Date) {
        try {
            const dateString = this.formatDate(date);
            const mealPlanRef = doc(this.db, `organizations/${orgId}/mealPlans/${dateString}`);
            const mealPlanDoc = await getDoc(mealPlanRef);

            if (!mealPlanDoc.exists()) {
                return null;
            }

            return {
                id: mealPlanDoc.id,
                ...mealPlanDoc.data(),
                date: mealPlanDoc.data().date.toDate()
            };
        } catch (error) {
            console.error('Error getting meal plan:', error);
            throw error;
        }
    }

    /**
     * Record student meal consumption for a specific date
     */
    async recordStudentMeal(orgId: string, studentId: string, date: Date, mealData: {
        breakfast: boolean;
        lunch: boolean;
        snack: boolean;
        notes?: string;
    }) {
        try {
            const dateString = this.formatDate(date);
            const mealRef = doc(this.db, `organizations/${orgId}/students/${studentId}/meals/${dateString}`);

            await setDoc(mealRef, {
                ...mealData,
                date: Timestamp.fromDate(date),
                updatedAt: serverTimestamp()
            }, { merge: true });

            return {
                id: dateString,
                studentId,
                date,
                ...mealData
            };
        } catch (error) {
            console.error('Error recording student meal:', error);
            throw error;
        }
    }

    /**
     * Get student meal records for a date range
     */
    async getStudentMeals(orgId: string, studentId: string, startDate: Date, endDate: Date) {
        try {
            const mealsRef = collection(this.db, `organizations/${orgId}/students/${studentId}/meals`);
            const startDateString = this.formatDate(startDate);
            const endDateString = this.formatDate(endDate);

            const q = query(
                mealsRef,
                where("date", ">=", Timestamp.fromDate(startDate)),
                where("date", "<=", Timestamp.fromDate(endDate)),
                orderBy("date", "desc")
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                studentId,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));
        } catch (error) {
            console.error('Error getting student meals:', error);
            throw error;
        }
    }

    /**
     * Create a staff schedule
     */
    async createStaffSchedule(orgId: string, scheduleData: {
        date: string;
        shiftStart: string;
        shiftEnd: string;
        classId?: string;
        staffId: string;
        organizationId: string;
    }) {
        try {
            const scheduleRef = collection(this.db, `organizations/${orgId}/staff_schedules`);
            const docRef = await addDoc(scheduleRef, {
                ...scheduleData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return {
                id: docRef.id,
                ...scheduleData
            };
        } catch (error) {
            console.error("Error creating staff schedule:", error);
            throw error;
        }
    }

    /**
     * Get staff schedules for a date range
     */
    async getStaffSchedules(orgId: string, startDate: string, endDate: string) {
        try {
            const schedulesRef = collection(this.db, `organizations/${orgId}/staff_schedules`);
            const q = query(
                schedulesRef,
                where("date", ">=", startDate),
                where("date", "<=", endDate)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting staff schedules:", error);
            throw error;
        }
    }

    /**
     * Helper method to format date as YYYY-MM-DD
     */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Get publicly available organizations for registration
     */
    async getPublicOrganizations() {
        try {
            const orgsRef = collection(this.db, 'organizations');
            const q = query(orgsRef, where("allowPublicRegistration", "==", true));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting public organizations:", error);
            return [];
        }
    }

    /**
     * Create a public student registration (waitlist)
     */
    async createPublicRegistration(studentData: any) {
        try {
            if (!studentData.firstName || !studentData.lastName) {
                throw new Error("First name and last name are required");
            }

            if (!studentData.organization_id) {
                throw new Error("Organization ID is required");
            }

            // Add computed fields
            const student = {
                ...studentData,
                fullName: `${studentData.firstName} ${studentData.lastName}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: "waitlist", // Always set to waitlist for public registrations
            };

            // Add to students subcollection
            const studentsRef = collection(this.db, `organizations/${studentData.organization_id}/students`);
            const docRef = await addDoc(studentsRef, student);

            // Also add to waitlist collection for easier management
            const waitlistRef = collection(this.db, `organizations/${studentData.organization_id}/waitlist`);
            await setDoc(doc(waitlistRef, docRef.id), {
                studentId: docRef.id,
                createdAt: serverTimestamp(),
                reviewed: false
            });

            // Send notification to organization admins
            await this.sendWaitlistNotification(studentData.organization_id, {
                studentName: student.fullName,
                studentId: docRef.id,
                guardianName: student.guardianName,
                guardianEmail: student.guardianEmail
            });

            return {
                id: docRef.id,
                ...student
            };
        } catch (error) {
            console.error("Error creating public registration:", error);
            throw error;
        }
    }

    /**
     * Send notification about new waitlist entry
     */
    private async sendWaitlistNotification(orgId: string, data: {
        studentName: string;
        studentId: string;
        guardianName: string;
        guardianEmail: string;
    }) {
        try {
            const notificationsRef = collection(this.db, `organizations/${orgId}/notifications`);
            await addDoc(notificationsRef, {
                type: "waitlist",
                title: "New Waitlist Registration",
                message: `${data.guardianName} has registered ${data.studentName} for the waitlist.`,
                data: data,
                createdAt: serverTimestamp(),
                read: false
            });
        } catch (error) {
            console.error("Error sending waitlist notification:", error);
            // Don't throw here, as this is a secondary operation
        }
    }

    /**
     * Get waitlist entries for an organization
     */
    async getWaitlist(orgId: string) {
        try {
            const waitlistRef = collection(this.db, `organizations/${orgId}/waitlist`);
            const q = query(waitlistRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            // Get the full student data for each waitlist entry
            const waitlistWithStudents = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const studentData = await this.getStudent(orgId, data.studentId);
                    return {
                        id: doc.id,
                        ...data,
                        student: studentData
                    };
                })
            );

            return waitlistWithStudents;
        } catch (error) {
            console.error("Error getting waitlist:", error);
            return [];
        }
    }

    /**
     * Approve a waitlist entry and convert to active student
     */
    async approveWaitlistEntry(orgId: string, studentId: string, classId: string, startDate: string) {
        try {
            // Update student status to active
            const studentRef = doc(this.db, `organizations/${orgId}/students`, studentId);
            await updateDoc(studentRef, {
                status: "active",
                updatedAt: serverTimestamp()
            });

            // Enroll student in class
            await this.enrollStudent(orgId, classId, studentId, {
                startDate: startDate,
                status: "active"
            });

            // Remove from waitlist
            const waitlistRef = doc(this.db, `organizations/${orgId}/waitlist`, studentId);
            await updateDoc(waitlistRef, {
                reviewed: true,
                approved: true,
                reviewedAt: serverTimestamp()
            });

            // Get student data to return
            const studentData = await this.getStudent(orgId, studentId);
            return studentData;
        } catch (error) {
            console.error("Error approving waitlist entry:", error);
            throw error;
        }
    }

    /**
     * Reject a waitlist entry
     */
    async rejectWaitlistEntry(orgId: string, studentId: string, reason: string = "") {
        try {
            // Update student status to rejected
            const studentRef = doc(this.db, `organizations/${orgId}/students`, studentId);
            await updateDoc(studentRef, {
                status: "rejected",
                rejectionReason: reason,
                updatedAt: serverTimestamp()
            });

            // Mark as reviewed in waitlist
            const waitlistRef = doc(this.db, `organizations/${orgId}/waitlist`, studentId);
            await updateDoc(waitlistRef, {
                reviewed: true,
                approved: false,
                rejectionReason: reason,
                reviewedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error("Error rejecting waitlist entry:", error);
            throw error;
        }
    }

    /**
     * Create a new program
     */
    async createProgram(orgId: string, programData: any) {
        try {
            // Ensure required fields
            if (!programData.name || !programData.start_date || !programData.end_date) {
                throw new Error("Program name, start date, and end date are required");
            }

            // Add metadata
            const program = {
                ...programData,
                active: programData.active !== undefined ? programData.active : true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(
                collection(this.db, `organizations/${orgId}/programs`),
                program
            );

            return {
                id: docRef.id,
                ...program
            };
        } catch (error) {
            console.error("Error creating program:", error);
            throw error;
        }
    }

    /**
     * Get all programs in an organization
     */
    async getPrograms(orgId: string, filters: {
        status?: string;
        ageRange?: string;
        searchTerm?: string;
        page?: number;
        limit?: number;
    } = {}) {
        try {
            const programsRef = collection(this.db, `organizations/${orgId}/programs`);
            const constraints: QueryConstraint[] = [];

            if (filters.status) {
                constraints.push(where("status", "==", filters.status));
            }

            if (filters.ageRange) {
                constraints.push(where("age_range", "==", filters.ageRange));
            }

            if (filters.searchTerm) {
                constraints.push(
                    where("name", ">=", filters.searchTerm),
                    where("name", "<=", filters.searchTerm + "\uf8ff")
                );
            }

            // Add pagination
            if (filters.page && filters.limit) {
                const startAt = (filters.page - 1) * filters.limit;
                constraints.push(
                    orderBy("name"),
                    limit(filters.limit),
                    startAfter(startAt)
                );
            } else {
                constraints.push(orderBy("name"));
            }

            const q = query(programsRef, ...constraints);
            const querySnapshot = await getDocs(q);

            const programs = querySnapshot.docs.map((doc: DocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            }));

            return programs;
        } catch (error) {
            console.error("Error fetching programs:", error);
            throw error;
        }
    }

    /**
     * Get a single program by ID
     */
    async getProgram(orgId: string, programId: string) {
        try {
            const docRef = doc(this.db, `organizations/${orgId}/programs`, programId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error("Error getting program:", error);
            throw error;
        }
    }

    /**
     * Update an existing program
     */
    async updateProgram(orgId: string, programId: string, programData: any) {
        try {
            const programRef = doc(this.db, `organizations/${orgId}/programs`, programId);

            // Add timestamp
            const updatedData = {
                ...programData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(programRef, updatedData);

            return {
                id: programId,
                ...updatedData
            };
        } catch (error) {
            console.error("Error updating program:", error);
            throw error;
        }
    }

    /**
     * Delete a program
     */
    async deleteProgram(orgId: string, programId: string) {
        try {
            const programRef = doc(this.db, `organizations/${orgId}/programs`, programId);
            await deleteDoc(programRef);
            return true;
        } catch (error) {
            console.error("Error deleting program:", error);
            throw error;
        }
    }

    // Guardian methods
    createGuardian: (organizationId: string, guardianData: any) => Promise<{ id: string }>;
    updateGuardian: (organizationId: string, guardianId: string, data: any) => Promise<void>;
    searchGuardians: (searchTerm: string) => Promise<any[]>;

    // Storage methods
    isStorageConfigured: (organizationId: string) => Promise<boolean>;
    configureStorage: (organizationId: string, config: any) => Promise<void>;
    uploadStudentDocument: (organizationId: string, studentId: string, file: File, documentType: string) => Promise<string>;
    getStudentDocuments: (organizationId: string, studentId: string) => Promise<any[]>;
    deleteStudentDocument: (organizationId: string, path: string) => Promise<void>;
}

// Export a singleton instance
const firebaseServices = new FirebaseServices();
export default firebaseServices; 