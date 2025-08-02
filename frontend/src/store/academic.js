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

    buildPUT: async (endpoint, id, updates) => {
        const authStore = useAuthStore.getState();
        const user = authStore.getCurrentUser();

        // Automatically add schoolId for schoolAdmin and student
        if (user.role === 'schoolAdmin' || user.role === 'student') {
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

        return res;
    },

    buildPOST: async (endpoint, data) => {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        return res
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

    // Add a helper to wait for authentication
    waitForAuth: async () => {
        const authStore = useAuthStore.getState();
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds with 100ms intervals

        while (!authStore.isAuthenticated && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;

            // Re-check the auth store state on each attempt
            const currentAuthStore = useAuthStore.getState();
            if (currentAuthStore.isAuthenticated) {
                break;
            }
        }

        if (!authStore.isAuthenticated) {
            throw new Error("Authentication timeout - please log in again");
        }

        if (authStore.getCurrentUser().role === "companyAdmin") {
            return "companyAdmin"
        }

        const schoolId = authStore.getSchoolId();
        if (!schoolId) {
            throw new Error("School ID not available - authentication incomplete");
        }

        return schoolId;
    },

    // School Operations
    fetchSchools: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, schools: true } }));
        try {
            await get().waitForAuth();

            const url = get().buildUrl("/api/school", filters);
            const res = await fetch(url);
            const data = await res.json();

            console.log(data);

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

            const res = await fetch('/api/school', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(schoolData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create school");
            }

            // Add to local state
            set((state) => ({
                schools: [...state.schools, data.data],
            }));

            return { success: true, data: data.data };

        } catch (error) {

            return { success: false, message: error.message };

        }
    },

    updateSchool: async (id, updates) => {
        try {
            const res = await fetch(`/api/school/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update school");
            }

            // Update in local state
            set((state) => ({
                schools: state.schools.map((school) =>
                    school._id === id ? data.data : school
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteSchool: async (id) => {
        try {
            const res = await fetch(`/api/school/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete school");
            }

            // Remove from local state
            set((state) => ({
                schools: state.schools.filter((school) => school._id !== id),
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== STUDENT OPERATIONS =====
    fetchStudents: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, students: true } }));

        try {
            await get().waitForAuth();

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

            const res = await get().buildPOST('/api/student', studentData)

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create student");
            }

            // Add to local state
            set((state) => ({
                students: [...state.students, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateStudent: async (id, updates) => {
        try {

            const res = await get().buildPUT('/api/student/', id, updates)

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update student");
            }

            // Update in local state
            set((state) => ({
                students: state.students.map((student) =>
                    student._id === id ? data.data : student
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteStudent: async (id) => {
        try {
            const res = await fetch(`/api/student/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete student");
            }

            // Remove from local state
            set((state) => ({
                students: state.students.filter((student) => student._id !== id),
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== COURSE OPERATIONS =====
    fetchCourses: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, courses: true } }));
        try {
            await get().waitForAuth();

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

            const res = await fetch("/api/course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(courseData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create course");
            }

            set((state) => ({
                courses: [...state.courses, data.data],
            }));

            return { success: true, message: data.message, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateCourse: async (id, updates) => {
        try {
            const res = await fetch(`/api/course/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update course");
            }

            // Update in local state
            set((state) => ({
                courses: state.courses.map((course) =>
                    course._id === id ? data.data : course
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteCourse: async (id) => {
        try {
            const res = await fetch(`/api/course/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete course");
            }

            // Remove from local state
            set(state => ({
                courses: state.courses.filter(course => course._id !== id)
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== LECTURER OPERATIONS =====
    fetchLecturers: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, lecturers: true } }));
        try {
            await get().waitForAuth();

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

            const res = await fetch("/api/lecturer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(lecturerData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create lecturer");
            }

            set((state) => ({
                lecturers: [...state.lecturers, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateLecturer: async (id, updates) => {
        try {
            const res = await fetch(`/api/lecturer/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update lecturer");
            }

            // Update in local state
            set((state) => ({
                lecturers: state.lecturers.map((lecturer) =>
                    lecturer._id === id ? data.data : lecturer
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteLecturer: async (id) => {
        try {
            const res = await fetch(`/api/lecturer/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete lecturer");
            }

            // Remove from local state
            set((state) => ({
                lecturers: state.lecturers.filter((lecturer) => lecturer._id !== id),
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== DEPARTMENT OPERATIONS =====
    fetchDepartments: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, departments: true } }));
        try {
            await get().waitForAuth();

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

            const res = await fetch("/api/department", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(departmentData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create department");
            }

            set((state) => ({
                departments: [...state.departments, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateDepartment: async (id, updates) => {
        try {
            const res = await fetch(`/api/department/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update department");
            }

            // Update in local state
            set((state) => ({
                departments: state.departments.map((department) =>
                    department._id === id ? data.data : department
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteDepartment: async (id) => {
        try {
            const res = await fetch(`/api/department/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete department");
            }

            // Remove from local state
            set((state) => ({
                departments: state.departments.filter(
                    (department) => department._id !== id
                ),
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== MODULE OPERATIONS =====
    fetchModules: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, modules: true } }));
        try {
            await get().waitForAuth();

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

            const res = await fetch("/api/module", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(moduleData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create module");
            }

            set((state) => ({
                modules: [...state.modules, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateModule: async (id, updates) => {
        try {
            const res = await fetch(`/api/module/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update module");
            }

            // Update in local state
            set((state) => ({
                modules: state.modules.map((module) =>
                    module._id === id ? data.data : module
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteModule: async (id) => {
        try {
            const res = await fetch(`/api/module/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete module");
            }

            // Remove from local state
            set((state) => ({
                modules: state.modules.filter((module) => module._id !== id),
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== INTAKE COURSE OPERATIONS =====
    fetchIntakeCourses: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, intakeCourses: true } }));
        try {
            await get().waitForAuth();

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
            await get().waitForAuth();

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

            const res = await get().buildPOST('/api/intake-course', intakeCourseData);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create intake course");
            }

            set((state) => ({
                intakeCourses: [...state.intakeCourses, data.data],
            }));

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

    updateEnrollment: async (id, action) => {
        try {
            const res = await fetch(`/api/intake-course/${id}/enrollment`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update enrollment");
            }

            // Update in local state
            set((state) => ({
                intakeCourses: state.intakeCourses.map((ic) =>
                    ic._id === id ? data.data : ic
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== ATTENDANCE OPERATIONS =====
    fetchAttendance: async (filters = {}) => {
        set((state) => ({ loading: { ...state.loading, attendance: true } }));
        try {
            await get().waitForAuth();

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

            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(attendanceData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create attendance");
            }

            set((state) => ({
                attendance: [...state.attendance, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateAttendance: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/attendance', id, updates);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update attendance");
            }

            // Update in local state
            set((state) => ({
                attendance: state.attendance.map((attendance) =>
                    attendance._id === id ? data.data : attendance
                ),
            }));

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
            await get().waitForAuth();

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

            const res = await fetch("/api/class-schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(scheduleData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create class schedule");
            }

            set((state) => ({
                classSchedules: [...state.classSchedules, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateClassSchedule: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/class-schedule', id, updates);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update class schedule");
            }

            set((state) => ({
                classSchedules: [...state.classSchedules, data.data],
            }));

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
            await get().waitForAuth();

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

    createResult: async (resultData) => {
        try {
            // Automatically add schoolId for schoolAdmin
            const authStore = useAuthStore.getState();
            const user = authStore.getCurrentUser();

            if (user.role === "schoolAdmin") {
                const schoolId = authStore.getSchoolId();
                if (schoolId) {
                    resultData.schoolId = schoolId;
                }
            }

            const res = await fetch("/api/result", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(resultData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create result");
            }

            set((state) => ({
                results: [...state.results, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateResult: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/result', id, updates);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update result");
            }

            // Update in local state
            set((state) => ({
                results: state.results.map((result) =>
                    result._id === id ? data.data : result
                ),
            }));

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
            await get().waitForAuth();

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

            const res = await get().buildPOST('/api/intake', intakeData);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create intake");
            }

            set((state) => ({
                intakes: [...state.intakes, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateIntake: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/intake', id, updates);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update intake");
            }

            // Update in local state
            set((state) => ({
                intakes: state.intakes.map((intake) =>
                    intake._id === id ? data.data : intake
                ),
            }));

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

    fetchStudentsBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, students: true } }));
        try {
            await get().waitForAuth();

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

    fetchCoursesBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, courses: true } }));
        try {
            await get().waitForAuth();

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

    fetchIntakesBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, intakes: true } }));
        try {
            await get().waitForAuth();

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

    fetchIntakeCoursesBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, intakeCourses: true } }));
        try {
            await get().waitForAuth();

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

    fetchDepartmentsBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, departments: true } }));
        try {
            await get().waitForAuth();

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

    fetchLecturersBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, lecturers: true } }));
        try {
            await get().waitForAuth();

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

    fetchModulesBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, modules: true } }));
        try {
            await get().waitForAuth();

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

    fetchExamSchedulesBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, examSchedules: true } }));
        try {
            await get().waitForAuth();

            const res = await fetch(`/api/examSchedule/school/${schoolId}`);
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

    fetchResultsBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, results: true } }));
        try {
            await get().waitForAuth();

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

    fetchAttendanceBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, attendance: true } }));
        try {
            await get().waitForAuth();

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

    fetchClassSchedulesBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, classSchedules: true } }));
        try {
            await get().waitForAuth();

            const res = await fetch(`/api/classSchedule/school/${schoolId}`);
            const data = await res.json();

            if (!data.success)
                throw new Error(
                    data.message || "Failed to fetch class schedules by schoolId"
                );

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

    fetchRoomsBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, rooms: true } }));
        try {
            await get().waitForAuth();

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
            await get().waitForAuth();

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

            const res = await get().buildPOST('/api/room', roomData);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create room");
            }

            set((state) => ({
                rooms: [...state.rooms, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateRoom: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/room', id, updates);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update room");
            }

            // Update in local state
            set((state) => ({
                rooms: state.rooms.map((room) =>
                    room._id === id ? data.data : room
                ),
            }));

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
            await get().waitForAuth();

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

            const res = await get().buildPOST('/api/exam-schedule', examScheduleData);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create exam schedule");
            }

            set((state) => ({
                examSchedules: [...state.examSchedules, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateExamSchedule: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/exam-schedule', id, updates);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update exam schedule");
            }

            // Update in local state
            set((state) => ({
                examSchedules: state.examSchedules.map((schedule) =>
                    schedule._id === id ? data.data : schedule
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteExamSchedule: async (id) => {
        try {
            const data = await get().buildDELETE('/api/exam-schedule', id, 'examSchedules');
            console.log("🚀 ~ data:", data)

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
            await get().waitForAuth();

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

    fetchSemestersBySchoolId: async (schoolId) => {
        set((state) => ({ loading: { ...state.loading, semesters: true } }));
        try {
            await get().waitForAuth();

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

    fetchSemestersByCourse: async (courseId) => {
        try {
            const res = await fetch(`/api/semester/course/${courseId}`);
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

            const res = await get().buildPOST('/api/semester', semesterData);
            const data = await res.json();

            if (!data.success) {
                return {
                    success: false,
                    message: data.message || "Failed to create semester"
                };
            }

            set((state) => ({
                semesters: [...state.semesters, data.data],
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateSemester: async (id, updates) => {
        try {
            const res = await get().buildPUT('/api/semester', id, updates);
            const data = await res.json();

            if (!data.success) {
                return {
                    success: false,
                    message: data.message || "Failed to update semester"
                };
            }

            // Update in local state
            set((state) => ({
                semesters: state.semesters.map((semester) =>
                    semester._id === id ? data.data : semester
                ),
            }));

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

    getCurrentSemester: async (courseId) => {
        try {
            const res = await fetch(`/api/semester/course/${courseId}/current`);
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
            const res = await fetch(`/api/semester/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update semester status");
            }

            // Update in local state
            set((state) => ({
                semesters: state.semesters.map((semester) =>
                    semester._id === id ? data.data : semester
                ),
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
}));
