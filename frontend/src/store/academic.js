import { create } from "zustand";

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
    },

    // ===== STUDENT OPERATIONS =====
    fetchStudents: async (filters = {}) => {
        set(state => ({ loading: { ...state.loading, students: true } }));
        try {
            let url = '/api/student';
            const queryParams = new URLSearchParams(filters);
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch students");
            }

            set(state => ({
                students: data.data,
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: null }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set(state => ({
                loading: { ...state.loading, students: false },
                errors: { ...state.errors, students: error.message }
            }));
            return { success: false, message: error.message };
        }
    },

    createStudent: async (studentData) => {
        try {
            const res = await fetch('/api/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create student");
            }

            // Add to local state
            set(state => ({
                students: [...state.students, data.data]
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateStudent: async (id, updates) => {
        try {
            const res = await fetch(`/api/student/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update student");
            }

            // Update in local state
            set(state => ({
                students: state.students.map(student =>
                    student._id === id ? data.data : student
                )
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteStudent: async (id) => {
        try {
            const res = await fetch(`/api/student/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to delete student");
            }

            // Remove from local state
            set(state => ({
                students: state.students.filter(student => student._id !== id)
            }));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== COURSE OPERATIONS =====
    fetchCourses: async (filters = {}) => {
        set(state => ({ loading: { ...state.loading, courses: true } }));
        try {
            let url = '/api/course';
            const queryParams = new URLSearchParams(filters);
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch courses");
            }

            set(state => ({
                courses: data.data,
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: null }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set(state => ({
                loading: { ...state.loading, courses: false },
                errors: { ...state.errors, courses: error.message }
            }));
            return { success: false, message: error.message };
        }
    },

    createCourse: async (courseData) => {
        try {
            const res = await fetch('/api/course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create course");
            }

            set(state => ({
                courses: [...state.courses, data.data]
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== INTAKE COURSE OPERATIONS =====
    fetchIntakeCourses: async (filters = {}) => {
        set(state => ({ loading: { ...state.loading, intakeCourses: true } }));
        try {
            let url = '/api/intake-course';
            const queryParams = new URLSearchParams(filters);
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch intake courses");
            }

            set(state => ({
                intakeCourses: data.data,
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: null }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set(state => ({
                loading: { ...state.loading, intakeCourses: false },
                errors: { ...state.errors, intakeCourses: error.message }
            }));
            return { success: false, message: error.message };
        }
    },

    fetchAvailableIntakeCourses: async () => {
        try {
            const res = await fetch('/api/intake-course/available');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch available courses");
            }

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateEnrollment: async (id, action) => {
        try {
            const res = await fetch(`/api/intake-course/${id}/enrollment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update enrollment");
            }

            // Update in local state
            set(state => ({
                intakeCourses: state.intakeCourses.map(ic =>
                    ic._id === id ? data.data : ic
                )
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== ATTENDANCE OPERATIONS =====
    fetchAttendance: async (filters = {}) => {
        set(state => ({ loading: { ...state.loading, attendance: true } }));
        try {
            let url = '/api/attendance';
            const queryParams = new URLSearchParams(filters);
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch attendance");
            }

            set(state => ({
                attendance: data.data,
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: null }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set(state => ({
                loading: { ...state.loading, attendance: false },
                errors: { ...state.errors, attendance: error.message }
            }));
            return { success: false, message: error.message };
        }
    },

    createAttendance: async (attendanceData) => {
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attendanceData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create attendance");
            }

            set(state => ({
                attendance: [...state.attendance, data.data]
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== RESULT OPERATIONS =====
    fetchResults: async (filters = {}) => {
        set(state => ({ loading: { ...state.loading, results: true } }));
        try {
            let url = '/api/result';
            const queryParams = new URLSearchParams(filters);
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch results");
            }

            set(state => ({
                results: data.data,
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: null }
            }));

            return { success: true, data: data.data };
        } catch (error) {
            set(state => ({
                loading: { ...state.loading, results: false },
                errors: { ...state.errors, results: error.message }
            }));
            return { success: false, message: error.message };
        }
    },

    createResult: async (resultData) => {
        try {
            const res = await fetch('/api/result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resultData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create result");
            }

            set(state => ({
                results: [...state.results, data.data]
            }));

            return { success: true, data: data.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // ===== ANALYTICS FUNCTIONS =====
    getCourseCompletionRate: (intakeCourseId) => {
        const { students } = get();
        const relevantStudents = students.filter(s => s.intakeCourseId === intakeCourseId);

        if (relevantStudents.length === 0) return 0;

        const completed = relevantStudents.filter(s => s.completionStatus === 'completed').length;
        return (completed / relevantStudents.length) * 100;
    },

    getExamPassRate: (moduleId) => {
        const { results } = get();
        const relevantResults = results.filter(r => r.moduleId === moduleId);

        if (relevantResults.length === 0) return 0;

        const passed = relevantResults.filter(r => r.grade !== 'F').length;
        return (passed / relevantResults.length) * 100;
    },

    getAverageAttendance: (studentId) => {
        const { attendance } = get();
        const studentAttendance = attendance.filter(a => a.studentId === studentId);

        if (studentAttendance.length === 0) return 0;

        const present = studentAttendance.filter(a => a.status === 'present').length;
        return (present / studentAttendance.length) * 100;
    },

    // ===== UTILITY FUNCTIONS =====
    clearErrors: () => {
        set({ errors: {} });
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
        });
    },
}));