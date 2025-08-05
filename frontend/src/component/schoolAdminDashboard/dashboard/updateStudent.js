import { useAcademicStore } from "../../../store/academic.js";

/**
 * UPDATE STUDENT ACADEMIC PERFORMANCE
 * ===================================
 * Calculates and updates student's CGPA, completed credit hours, and total credit hours
 * based on their results and module data
 */
export const updateStudentAcademicPerformance = async (studentId) => {
    const { students, results, modules, updateStudent } = useAcademicStore.getState();

    try {
        // Get student data
        const student = students.find(s => s._id === studentId);
        if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
        }

        // Get student's results
        const studentResults = results.filter(r => r.studentId._id === studentId);

        // Get student's intake course
        const intakeCourse = student.intakeCourseId;
        if (!intakeCourse) {
            throw new Error(`Intake course not found for student ${studentId}`);
        }

        // Get all modules for the student's course
        const courseModules = modules.filter(module =>
            module.courseId.some(course => course._id === intakeCourse.courseId._id)
        );

        // Calculate total credit hours from course modules
        const totalCreditHours = courseModules.reduce((sum, module) =>
            sum + module.totalCreditHours, 0
        );

        // Calculate completed credit hours (only passed grades)
        const passedGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];
        const completedCreditHours = studentResults
            .filter(result => passedGrades.includes(result.grade))
            .reduce((sum, result) => sum + result.creditHours, 0);

        // Calculate CGPA
        const gradePointMap = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
        };

        let totalGradePoints = 0;
        let totalGradedCreditHours = 0;

        studentResults.forEach(result => {
            const gradePoints = gradePointMap[result.grade] || 0;
            totalGradePoints += (gradePoints * result.creditHours);
            totalGradedCreditHours += result.creditHours;
        });

        const cgpa = totalGradedCreditHours > 0
            ? Math.round((totalGradePoints / totalGradedCreditHours) * 100) / 100
            : 0;

        const updatedStudent = {
            ...student,
            intakeCourseId: student.intakeCourseId._id,
            userId: student.userId._id,
            schoolId: student.schoolId._id,
            cgpa: cgpa,
            completedCreditHours: completedCreditHours,
            totalCreditHours: totalCreditHours
        }

        // Update student using existing store method
        const result = await updateStudent(studentId, updatedStudent);

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error(`Error updating academic performance for student ${studentId}:`, error);
        return { success: false, message: error.message };
    }
};

/**
 * UPDATE ALL STUDENTS ACADEMIC PERFORMANCE
 * =======================================
 * Updates academic performance for all students
 */
export const updateAllStudentsAcademicPerformance = async () => {
    const { students, updateStudent } = useAcademicStore.getState();

    const results = {
        successCount: 0,
        errorCount: 0,
        updatedStudents: []
    };

    for (const student of students) {
        try {
            const result = await updateStudentAcademicPerformance(student._id);
            if (result.success) {
                results.successCount++;
                results.updatedStudents.push({
                    studentId: student._id,
                    studentName: student.userId.name,
                    ...result.data
                });
            } else {
                results.errorCount++;
                console.error(`Failed to update student ${student._id}:`, result.message);
            }
        } catch (error) {
            results.errorCount++;
            console.error(`Error updating student ${student._id}:`, error);
        }
    }

    console.log(`Academic Performance Update Results:`, results);
    return results;
};