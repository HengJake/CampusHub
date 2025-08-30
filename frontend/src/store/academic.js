// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: academic.js
// Description: Academic module store managing student, course, module, and academic data operations with comprehensive CRUD functionality
// First Written on: July 14, 2024
// Edited on: Friday, August 14, 2024

import { create } from "zustand";
import { useAuthStore } from "./auth.js";

export const useAcademicStore = create((set, get) => ({
    // State - Store frequently accessed data in arrays
    students: [],
    courses: [],
    intakes: [],
    intakeCourses: [],
    departments: [],
    lecturers: [],
    modules: [],
    classSchedules: [],
    examSchedules: [],
    attendance: [],
    results: [],
    rooms: [],
    semesters: [],
    semesterModules: [],
    schools: [], // Add schools state

    // Loading states
    loading: {
        students: false,
        courses: false,
        intakes: false,
        intakeCourses: false,
        departments: false,
        lecturers: false,
        modules: false,
        classSchedules: false,
        examSchedules: false,
        attendance: false,
        results: false,
        rooms: false,
        semesters: false,
        semesterModules: false,
        schools: false, // Add schools loading state
    },

    // Error states
    errors: {
        students: null,
        courses: null,
        intakes: null,
        intakeCourses: null,
        departments: null,
        lecturers: null,
        modules: null,
        classSchedules: null,
        examSchedules: null,
        attendance: null,
        results: null,
        rooms: null,
        semesters: null,
        semesterModules: null,
        schools: null, // Add schools error state
    },

    // Helper to get schoolId from auth store
    getSchoolId: () => {
        const authStore = useAuthStore.getState();
        return authStore.getSchoolId();
    },

    // Helper to build URL with automatic schoolId injection
    buildUrl: (endpoint, filters = {}) => {
        const authStore = useAuthStore.getState();
        const user = authStore.getCurrentUser();

        let url = endpoint;

        // Automatically add schoolId for schoolAdmin and student
        if (user.role === "schoolAdmin" || user.role === "student") {
            const schoolId = authStore.getSchoolId();
            if (schoolId) {
                // If endpoint already has schoolId, use it, otherwise add it
                if (endpoint.includes("/school/")) {
                    url = endpoint;
                } else {
                    url = `${endpoint}/school/${schoolId}`;
                }
            }
        }

        // Add other filters
        const queryParams = new URLSearchParams(filters);
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }

        return url;
    },

    buildPUT: async (endpoint, id, updates, stateKey) => {
        const authStore = useAuthStore.getState();
        const user = authStore.getCurrentUser();

        // Automatically add schoolId for schoolAdmin and student
        if (user.role === 'schoolAdmin') {
            const schoolId = authStore.getSchoolId();
            updates = { ...updates, "schoolId": schoolId }
        }

        const res = await fetch(`${endpoint}/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        })

        const data = await res.json();

        if (data.success && stateKey) {
            // Update in local state
            set((state) => ({
                [stateKey]: state[stateKey].map((item) =>
                    item._id === id ? data.data : item
                ),
            }));
        }

        return data;
    },

    buildPOST: async (endpoint, data, stateKey) => {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const responseData = await res.json();

        if (responseData.success && stateKey) {
            // Add to local state
            set((state) => ({
                [stateKey]: [...state[stateKey], responseData.data],
            }));
        }

        return responseData
    },

    buildPATCH: async (endpoint, id, data, stateKey) => {
        const res = await fetch(`${endpoint}/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const responseData = await res.json();

        if (responseData.success && stateKey) {
            // Update in local state
            set((state) => ({
                [stateKey]: state[stateKey].map((item) =>
                    item._id === id ? responseData.data : item
                ),
            }));
        }

        return responseData
    },

    buildDELETE: async (endpoint, id, localstorage) => {
        try {
            const res = await fetch(`${endpoint}/${id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete");
            }

            // Remove from local state
            set(state => ({
                [localstorage]: state[localstorage].filter(item => item._id !== id)
            }));

            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Add a helper to check if user is authenticated
    isAuthenticated: () => {
        const authStore = useAuthStore.getState();
        return authStore.isAuthenticated;
    },

    // School Operations
    fetchSchools: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, schools: true } }));
        try {
            const url = get().buildUrl("/api/school", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch schools");
            }

            set((state) => ({
                schools: data.data,
                loading: { ...state.loading, schools: false },
                errors: { ...state.errors, schools: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, schools: false },
                errors: { ...state.errors, schools: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createSchool: async (schoolData) => {
        try {
            const data = await get().buildPOST('/api/school', schoolData, 'schools');

            if (!data.success) {
                throw new Error(data.message || "Failed to create school");
            }

            return { success: true, data: data.data };

        } catch (error) {

            return { success: false, message: error.message };

        }
    },

    updateSchool: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/school', id, updates, 'schools');

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update school");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteSchool: async (id) => {
        try {
            const data = await get().buildDELETE('/api/school', id, 'schools');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete school");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== STUDENT OPERATIONS =====
    fetchStudents: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, students: true } }));

        try {
            const url = get().buildUrl("/api/student", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch students");
            }

            set((state) => ({
                students: data.data,
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createStudent: async (studentData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === 'schoolAdmin') {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    studentData.schoolId = schoolId;
                }
            } else {
                return { success: false, message: "Only school can create student" };
            }

            const data = await get().buildPOST('/api/student', studentData, 'students')

            if (!data.success) {
                throw new Error(data.message || "Failed to create student");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateStudent: async (id, updates) => {
        try {

            const data = await get().buildPUT('/api/student', id, updates, 'students')

            if (!data.success) {
                throw new Error(data.message || "Failed to update student");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteStudent: async (id) => {
        try {
            const data = await get().buildDELETE("/api/student", id, 'students');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete student");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== COURSE OPERATIONS =====
    fetchCourses: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, courses: true } }));
        try {
            const url = get().buildUrl("/api/course", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch courses");
            }

            set((state) => ({
                courses: data.data,
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createCourse: async (courseData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    courseData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/course", courseData, 'courses');

            if (!data.success) {
                throw new Error(data.message || "Failed to create course");
            }

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateCourse: async (id, updates) => {
        try {
            const res = await get().buildPUT("/api/course", id, updates, 'courses');

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update course");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteCourse: async (id) => {
        try {
            const data = await get().buildDELETE("/api/course", id, 'courses');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete course");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== LECTURER OPERATIONS =====
    fetchLecturers: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, lecturers: true } }));
        try {
            const url = get().buildUrl("/api/lecturer", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch lecturers");
            }

            set((state) => ({
                lecturers: data.data,
                loading: { ...state.loading, lecturers: false },
                errors: { ...state.errors, lecturers: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, lecturers: false },
                errors: { ...state.errors, lecturers: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchLecturerById: async (lecturerId) => {
        const res = await fetch(`/api/lecturer/${lecturerId}`);

        const data = await res.json()

        return { success: data.success, message: data.message, data: data.data };
    },

    createLecturer: async (lecturerData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    lecturerData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/lecturer", lecturerData, 'lecturers');

            if (!data.success) {
                throw new Error(data.message || "Failed to create lecturer");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateLecturer: async (id, updates) => {
        try {
            const res = await get().buildPUT("/api/lecturer", id, updates, 'lecturers');

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update lecturer");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteLecturer: async (id) => {
        try {
            const data = await get().buildDELETE("/api/lecturer", id, 'lecturers');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete lecturer");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== DEPARTMENT OPERATIONS =====
    fetchDepartments: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, departments: true } }));
        try {
            const url = get().buildUrl("/api/department", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch departments");
            }

            set((state) => ({
                departments: data.data,
                loading: { ...state.loading, departments: false },
                errors: { ...state.errors, departments: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, departments: false },
                errors: { ...state.errors, departments: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createDepartment: async (departmentData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    departmentData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/department", departmentData, 'departments');

            if (!data.success) {
                throw new Error(data.message || "Failed to create department");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateDepartment: async (id, updates) => {
        try {
            const res = await get().buildPUT("/api/department", id, updates, 'departments');

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update department");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteDepartment: async (id) => {
        try {
            const data = await get().buildDELETE("/api/department", id, 'departments');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete department");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== MODULE OPERATIONS =====
    fetchModules: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, modules: true } }));
        try {
            const url = get().buildUrl("/api/module", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch modules");
            }

            set((state) => ({
                modules: data.data,
                loading: { ...state.loading, modules: false },
                errors: { ...state.errors, modules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, modules: false },
                errors: { ...state.errors, modules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createModule: async (moduleData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    moduleData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/module", moduleData, 'modules');

            if (!data.success) {
                throw new Error(data.message || "Failed to create module");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateModule: async (id, updates) => {
        try {
            const res = await get().buildPUT("/api/module", id, updates, 'modules');

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update module");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteModule: async (id) => {
        try {
            const data = await get().buildDELETE("/api/module", id, 'modules');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete module");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== INTAKE COURSE OPERATIONS =====
    fetchIntakeCourses: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, intakeCourses: true } }));
        try {
            const url = get().buildUrl("/api/intake-course", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch intake courses");
            }

            set((state) => ({
                intakeCourses: data.data,
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchAvailableIntakeCourses: async () => {
        try {
            const url = get().buildUrl("/api/intake-course/available");
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch available courses");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    createIntakeCourse: async (intakeCourseData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    intakeCourseData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST('/api/intake-course', intakeCourseData, 'intakeCourses');

            if (!data.success) {
                throw new Error(data.message || "Failed to create intake course");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteIntakeCourse: async (id) => {
        try {
            const data = await get().buildDELETE('/api/intake-course', id, 'intakeCourses');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete intake course");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateIntakeCourse: async (id, updates) => {
        try {
            const data = await get().buildPUT('/api/intake-course', id, updates, 'intakeCourses');


            if (!data.success) {
                throw new Error(data.message || "Failed to update intake course");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateEnrollment: async (id, action) => {
        try {
            const res = await get().buildPATCH("/api/intake-course", id, { action }, 'intakeCourses');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update enrollment");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== ATTENDANCE OPERATIONS =====
    fetchAttendance: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, attendance: true } }));
        try {
            const url = get().buildUrl("/api/attendance", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch attendance");
            }

            set((state) => ({
                attendance: data.data,
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createAttendance: async (attendanceData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    attendanceData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/attendance", attendanceData, 'attendance');

            if (!data.success) {
                throw new Error(data.message || "Failed to create attendance");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateAttendance: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/attendance', id, updates, 'attendance');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update attendance");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteAttendance: async (id) => {
        try {
            const data = await get().buildDELETE('/api/attendance', id, 'attendance');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete attendance");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== CLASS SCHEDULE OPERATIONS =====
    fetchClassSchedules: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, classSchedules: true } }));
        try {
            const url = get().buildUrl("/api/class-schedule", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch class schedules");
            }

            set((state) => ({
                classSchedules: data.data,
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchClassSchedulesByStudentId: async (studentId) => {
        set((state) => ({ loading: { ...state.loading, classSchedules: true } }));
        try {
            const res = await fetch(`/api/class-schedule/student/${studentId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch class schedules by student ID");
            }

            set((state) => ({
                classSchedules: data.data,
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchClassSchedulesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, classSchedules: true } }));
        try {
            const res = await fetch(`/api/class-schedule/school/${schoolId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch class schedules by schoolId");
            }

            set((state) => ({
                classSchedules: data.data,
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, classSchedules: false },
                errors: { ...state.errors, classSchedules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createClassSchedule: async (scheduleData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    scheduleData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/class-schedule", scheduleData, 'classSchedules');

            if (!data.success) {
                throw new Error(data.message || "Failed to create class schedule");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateClassSchedule: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/class-schedule', id, updates, 'classSchedules');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update class schedule");
            }

            return { success: true, data: data.data };

        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteClassSchedule: async (id) => {
        try {
            const data = await get().buildDELETE('/api/class-schedule', id, 'classSchedules');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete class schedule");
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },


    // ===== RESULT OPERATIONS =====
    fetchResults: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, results: true } }));
        try {
            const url = get().buildUrl("/api/result", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch results");
            }

            set((state) => ({
                results: data.data,
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchResultsByStudentId: async (studentId) => {
        set((state) => ({ loading: { ...state.loading, results: true } }));
        try {
            const res = await fetch(`/api/result/student/${studentId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch results by studentId");
            }

            set((state) => ({
                results: data.data,
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createResult: async (resultData) => {
        try {
            // Automatically add schoolId for schoolId
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    resultData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST("/api/result", resultData, 'results');

            if (!data.success) {
                throw new Error(data.message || "Failed to create result");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateResult: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/result', id, updates, 'results');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update result");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteResult: async (id) => {
        try {
            const data = await get().buildDELETE('/api/result', id, 'results');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete result");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // =======INTAKE OPERATIONS======
    fetchIntakes: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, intakes: true } }));
        try {
            const url = get().buildUrl("/api/intake", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch courses");
            }

            set((state) => ({
                intakes: data.data,
                loading: { ...state.loading, intakes: false },
                errors: { ...state.errors, intakes: null },
            }));
            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, intakes: false },
                errors: { ...state.errors, intakes: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createIntake: async (intakeData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    intakeData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST('/api/intake', intakeData, 'intakes');

            if (!data.success) {
                throw new Error(data.message || "Failed to create intake");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateIntake: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/intake', id, updates, 'intakes');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update intake");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteIntake: async (id) => {
        try {
            const data = await get().buildDELETE('/api/intake', id, 'intakes');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete intake");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // =======

    // ===GET BY SCHOOL ID====
    // ===== GET BY SCHOOL ID METHODS =====

    fetchStudentsBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, students: true } }));
        try {
            const res = await fetch(`/api/student/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(data.message || "Failed to fetch students by schoolId");

            set((state) => ({
                students: data.data,
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchCoursesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, courses: true } }));
        try {
            const res = await fetch(`/api/course/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(data.message || "Failed to fetch courses by schoolId");

            set((state) => ({
                courses: data.data,
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchIntakesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, intakes: false },
                errors: { ...state.errors, intakes: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, intakes: true } }));
        try {
            const res = await fetch(`/api/intake/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(data.message || "Failed to fetch intakes by schoolId");

            set((state) => ({
                intakes: data.data,
                loading: { ...state.loading, intakes: false },
                errors: { ...state.errors, intakes: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, intakes: false },
                errors: { ...state.errors, intakes: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchIntakeCoursesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, intakeCourses: true } }));
        try {
            const res = await fetch(`/api/intake-course/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch intake courses by schoolId"
                );

            set((state) => ({
                intakeCourses: data.data,
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchDepartmentsBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, departments: false },
                errors: { ...state.errors, departments: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, departments: true } }));
        try {
            const res = await fetch(`/api/department/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch departments by schoolId"
                );

            set((state) => ({
                departments: data.data,
                loading: { ...state.loading, departments: false },
                errors: { ...state.errors, departments: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, departments: false },
                errors: { ...state.errors, departments: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchLecturersBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, lecturers: false },
                errors: { ...state.errors, lecturers: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, lecturers: true } }));
        try {
            const res = await fetch(`/api/lecturer/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch lecturers by schoolId"
                );

            set((state) => ({
                lecturers: data.data,
                loading: { ...state.loading, lecturers: false },
                errors: { ...state.errors, lecturers: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, lecturers: false },
                errors: { ...state.errors, lecturers: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchModulesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, modules: false },
                errors: { ...state.errors, modules: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, modules: true } }));
        try {
            const res = await fetch(`/api/module/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(data.message || "Failed to fetch modules by schoolId");

            set((state) => ({
                modules: data.data,
                loading: { ...state.loading, modules: false },
                errors: { ...state.errors, modules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, modules: false },
                errors: { ...state.errors, modules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchExamSchedulesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, examSchedules: false },
                errors: { ...state.errors, examSchedules: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, examSchedules: true } }));
        try {
            const res = await fetch(`/api/exam-schedule/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch exam schedules by schoolId"
                );

            set((state) => ({
                examSchedules: data.data,
                loading: { ...state.loading, examSchedules: false },
                errors: { ...state.errors, examSchedules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, examSchedules: false },
                errors: { ...state.errors, examSchedules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchResultsBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, results: true } }));
        try {
            const res = await fetch(`/api/result/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(data.message || "Failed to fetch results by schoolId");

            set((state) => ({
                results: data.data,
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchAttendanceBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, attendance: true } }));
        try {
            const res = await fetch(`/api/attendance/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch attendance by schoolId"
                );

            set((state) => ({
                attendance: data.data,
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchAttendanceByStudentId: async (studentId) => {
        set((state) => ({ loading: { ...state.loading, attendance: true } }));
        try {
            const res = await fetch(`/api/attendance/student/${studentId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch attendance by studentId"
                );

            set((state) => ({
                attendance: data.data,
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchRoomsBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, rooms: false },
                errors: { ...state.errors, rooms: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, rooms: true } }));
        try {
            const res = await fetch(`/api/room/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(data.message || "Failed to fetch rooms by schoolId");

            set((state) => ({
                rooms: data.data,
                loading: { ...state.loading, rooms: false },
                errors: { ...state.errors, rooms: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, rooms: false },
                errors: { ...state.errors, rooms: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    // ===== ROOM OPERATIONS =====
    fetchRooms: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, rooms: true } }));
        try {
            const url = get().buildUrl("/api/room", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch rooms");
            }

            set((state) => ({
                rooms: data.data,
                loading: { ...state.loading, rooms: false },
                errors: { ...state.errors, rooms: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, rooms: false },
                errors: { ...state.errors, rooms: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createRoom: async (roomData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    roomData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST('/api/room', roomData, 'rooms');

            if (!data.success) {
                throw new Error(data.message || "Failed to create room");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateRoom: async (id, updates) => {
        try {
            const data = await get().buildPUT('/api/room', id, updates, 'rooms');

            if (!data.success) {
                throw new Error(data.message || "Failed to update room");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteRoom: async (id) => {
        try {
            const data = await get().buildDELETE('/api/room', id, 'rooms');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete room");
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== ANALYTICS FUNCTIONS =====
    getCourseCompletionRate: (intakeCourseId) => {
        const { students } = get();
        const relevantStudents = students.filter(
            (s) => s.intakeCourseId === intakeCourseId
        );

        if (relevantStudents.length === 0) return 0;

        const completed = relevantStudents.filter(
            (s) => s.status === "graduated"
        ).length;
        return (completed / relevantStudents.length) * 100;
    },

    getAllCourseCompletionRate: () => {
        const { students } = get();

        const completed = students.filter(
            (s) => s.status === "graduated"
        ).length;
        return (completed / students.length) * 100;
    },

    getExamPassRate: (moduleId) => {
        const { results } = get();
        const relevantResults = results.filter((r) => r.moduleId === moduleId);

        if (relevantResults.length === 0) return 0;

        const passed = relevantResults.filter((r) => r.grade !== "F").length;
        return (passed / relevantResults.length) * 100;
    },

    getAverageAttendance: (studentId) => {
        const { attendance } = get();
        const studentAttendance = attendance.filter(
            (a) => a.studentId === studentId
        );

        if (studentAttendance.length === 0) return 0;

        const present = studentAttendance.filter(
            (a) => a.status === "present"
        ).length;
        return (present / studentAttendance.length) * 100;
    },

    // ===== UTILITY FUNCTIONS =====
    clearErrors: () => {
        set({ errors: {} });
    },

    clearAllErrors: () => {
        set((state) => ({
            errors: {
                students: null,
                courses: null,
                intakes: null,
                intakeCourses: null,
                departments: null,
                lecturers: null,
                modules: null,
                classSchedules: null,
                examSchedules: null,
                attendance: null,
                results: null,
                rooms: null,
                schools: null,
                semesters: null,
            },
        }));
    },

    clearData: () => {
        set({
            students: [],
            courses: [],
            intakes: [],
            intakeCourses: [],
            departments: [],
            lecturers: [],
            modules: [],
            classSchedules: [],
            examSchedules: [],
            attendance: [],
            results: [],
            rooms: [],
            semesters: [],
            schools: [],
        });
    },

    // ===== EXAM SCHEDULE OPERATIONS =====
    fetchExamSchedules: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, examSchedules: true } }));
        try {
            const url = get().buildUrl("/api/exam-schedule", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch exam schedules");
            }

            set((state) => ({
                examSchedules: data.data,
                loading: { ...state.loading, examSchedules: false },
                errors: { ...state.errors, examSchedules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, examSchedules: false },
                errors: { ...state.errors, examSchedules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    createExamSchedule: async (examScheduleData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    examScheduleData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST('/api/exam-schedule', examScheduleData, 'examSchedules');

            if (!data.success) {
                throw new Error(data.message || "Failed to create exam schedule");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateExamSchedule: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/exam-schedule', id, updates, 'examSchedules');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update exam schedule");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteExamSchedule: async (id) => {
        try {
            const data = await get().buildDELETE('/api/exam-schedule', id, 'examSchedules');


            if (!data.success) {
                throw new Error(data.message || "Failed to delete exam schedule");
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== SEMESTER OPERATIONS =====
    fetchSemesters: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, semesters: true } }));
        try {
            const url = get().buildUrl("/api/semester", filters);
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semesters");
            }

            set((state) => ({
                semesters: data.data,
                loading: { ...state.loading, semesters: false },
                errors: { ...state.errors, semesters: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, semesters: false },
                errors: { ...state.errors, semesters: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchSemestersBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, semesters: false },
                errors: { ...state.errors, semesters: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, semesters: true } }));
        try {
            const res = await fetch(`/api/semester/school/${schoolId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semesters by school");
            }

            set((state) => ({
                semesters: data.data,
                loading: { ...state.loading, semesters: false },
                errors: { ...state.errors, semesters: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, semesters: false },
                errors: { ...state.errors, semesters: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

            fetchSemestersByIntakeCourse: async (intakeCourseId) => {
            try {
                const res = await fetch(`/api/semester/intake-course/${intakeCourseId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semesters by course");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    fetchSemesterById: async (semesterId) => {
        try {
            const res = await fetch(`/api/semester/${semesterId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semester");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    createSemester: async (semesterData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    semesterData.schoolId = schoolId;
                }
            }

            const data = await get().buildPOST('/api/semester', semesterData, 'semesters');

            if (!data.success) {
                return {
                    success: false,
                    message: data.message || "Failed to create semester"
                };
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateSemester: async (id, updates) => {
        try {
            const data = await get().buildPUT('/api/semester', id, updates, 'semesters');

            if (!data.success) {
                return {
                    success: false,
                    message: data.message || "Failed to update semester"
                };
            }

            return { success: true, data: data.data, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteSemester: async (id) => {
        try {
            const data = await get().buildDELETE('/api/semester', id, 'semesters');

            if (!data.success) {
                throw new Error(data.message || "Failed to delete semester");
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

            getCurrentSemester: async (intakeCourseId) => {
            try {
                const res = await fetch(`/api/semester/intake-course/${intakeCourseId}/current`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch current semester");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getUpcomingSemesters: async (schoolId) => {
        try {
            const res = await fetch(`/api/semester/school/${schoolId}/upcoming`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch upcoming semesters");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateSemesterStatus: async (id, status) => {
        try {
            const res = await get().buildPATCH("/api/semester", id, { status }, 'semesters');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update semester status");
            }

            // Update in local state
            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Semester Module Functions
    fetchSemesterModulesBySchoolId: async () => {
        const schoolId = get().getSchoolId();

        if (!schoolId) {
            set((state) => ({
                loading: { ...state.loading, semesterModules: false },
                errors: { ...state.errors, semesterModules: "No school ID available. Please ensure you are logged in." },
            }));
            return { success: false, message: "No school ID available. Please ensure you are logged in." };
        }

        set((state) => ({ loading: { ...state.loading, semesterModules: true } }));
        try {
            const res = await fetch(`/api/semester-module/school/${schoolId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semester modules");
            }

            set((state) => ({
                semesterModules: data.data,
                loading: { ...state.loading, semesterModules: false },
                errors: { ...state.errors, semesterModules: null },
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set((state) => ({
                loading: { ...state.loading, semesterModules: false },
                errors: { ...state.errors, semesterModules: error.message },
            }));
            return { success: false, message: error.message };
        }
    },

    fetchModulesBySemester: async (semesterId) => {
        try {
            const res = await fetch(`/api/semester-module/semester/${semesterId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semester modules");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getModuleCountBySemester: async (semesterId) => {
        try {
            const res = await fetch(`/api/semester-module/count/${semesterId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch module count");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getAvailableModulesForSemester: async (semesterId, intakeCourseId) => {
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();

            const res = await fetch(`/api/semester-module/available/${semesterId}/${intakeCourseId}/${schoolId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch available modules");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    addModuleToSemester: async (semesterId, moduleId, intakeCourseId, additionalData = {}) => {
        try {
            const authStore = useAuthStore.getState();
            
            const schoolId = authStore.getSchoolId();

            if (!schoolId) {
                console.error("🚨 ~ addModuleToSemester ~ No schoolId available");
                return { success: false, message: "No school ID available. Please ensure you are logged in." };
            }

            const semesterModuleData = {
                semesterId,
                moduleId,
                intakeCourseId,
                schoolId,
                ...additionalData
            };
            
            
            const res = await fetch('/api/semester-module', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(semesterModuleData),
            });


            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to add module to semester");
            }

            // Refresh semester modules
            await get().fetchSemesterModulesBySchoolId();

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    removeModuleFromSemester: async (semesterModuleId) => {
        try {
            const res = await fetch(`/api/semester-module/${semesterModuleId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to remove module from semester");
            }

            // Refresh semester modules
            await get().fetchSemesterModulesBySchoolId();

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateSemesterModule: async (id, updates) => {
        try {
            const res = await fetch(`/api/semester-module/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update semester module");
            }

            // Refresh semester modules
            await get().fetchSemesterModulesBySchoolId();

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    bulkAddModulesToSemester: async (semesterId, moduleIds, intakeCourseId) => {
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();

            const bulkData = {
                semesterId,
                moduleIds,
                courseId,
                intakeCourseId,
                schoolId
            };

            const res = await fetch('/api/semester-module/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bulkData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to bulk add modules");
            }

            // Refresh semester modules
            await get().fetchSemesterModulesBySchoolId();

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getSemesterModulesByIntakeCourseAndYear: async (intakeCourseId, academicYear) => {
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();

            const res = await fetch(`/api/semester-module/intake-course/${intakeCourseId}/year/${academicYear}/school/${schoolId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semester modules by course and year");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getSemesterModulesByIntakeCourse: async (intakeCourseId) => {
        try {
            const authStore = useAuthStore.getState();
            const schoolId = authStore.getSchoolId();

            const res = await fetch(`/api/semester-module/intake-course/${intakeCourseId}/school/${schoolId}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch semester modules by intake course");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
}));
