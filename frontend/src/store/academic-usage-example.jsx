import React, { useEffect, useState } from 'react';
import { useAcademicStore } from './academic.js';

// Example component showing how to use the academic store
const AcademicDashboard = () => {
    const {
        // State arrays
        students,
        courses,
        intakeCourses,
        attendance,
        results,

        // Loading states
        loading,

        // Error states
        errors,

        // Functions
        fetchStudents,
        fetchCourses,
        fetchIntakeCourses,
        fetchAttendance,
        fetchResults,
        createStudent,
        updateStudent,
        deleteStudent,
        getCourseCompletionRate,
        getExamPassRate,
        getAverageAttendance,
        clearErrors,
        clearData
    } = useAcademicStore();

    const [selectedStudent, setSelectedStudent] = useState(null);

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            // Fetch all data at once for dashboard
            await Promise.all([
                fetchStudents(),
                fetchCourses(),
                fetchIntakeCourses(),
                fetchAttendance(),
                fetchResults()
            ]);
        };

        loadData();
    }, []);

    // Example: Create a new student
    const handleCreateStudent = async () => {
        const newStudent = {
            userId: "user_id_here",
            schoolId: "school_id_here",
            intakeCourseId: "intake_course_id_here",
            year: 1,
            currentSemester: 1,
            status: "enrolled"
        };

        const result = await createStudent(newStudent);
        if (result.success) {
            console.log("Student created successfully!");
        } else {
            console.error("Failed to create student:", result.message);
        }
    };

    // Example: Update student completion status
    const handleUpdateStudentStatus = async (studentId, newStatus) => {
        const result = await updateStudent(studentId, {
            completionStatus: newStatus
        });

        if (result.success) {
            console.log("Student updated successfully!");
        } else {
            console.error("Failed to update student:", result.message);
        }
    };

    // Example: Calculate analytics
    const calculateAnalytics = () => {
        if (intakeCourses.length === 0) return null;

        const analytics = intakeCourses.map(ic => ({
            intakeCourseId: ic._id,
            courseName: ic.courseId?.courseName || 'Unknown Course',
            completionRate: getCourseCompletionRate(ic._id),
            enrollmentCount: ic.currentEnrollment,
            maxStudents: ic.maxStudents
        }));

        return analytics;
    };

    // Example: Get student attendance
    const getStudentAttendance = (studentId) => {
        const studentAttendance = attendance.filter(a => a.studentId === studentId);
        const averageAttendance = getAverageAttendance(studentId);

        return {
            records: studentAttendance,
            average: averageAttendance
        };
    };

    // Example: Get module pass rates
    const getModulePassRates = () => {
        // This would need module data, but showing the pattern
        const moduleIds = [...new Set(results.map(r => r.moduleId))];

        return moduleIds.map(moduleId => ({
            moduleId,
            passRate: getExamPassRate(moduleId)
        }));
    };

    if (loading.students || loading.courses || loading.intakeCourses) {
        return <div>Loading academic data...</div>;
    }

    if (errors.students || errors.courses || errors.intakeCourses) {
        return (
            <div>
                <div>Error loading data:</div>
                <div>{errors.students}</div>
                <div>{errors.courses}</div>
                <div>{errors.intakeCourses}</div>
                <button onClick={clearErrors}>Clear Errors</button>
            </div>
        );
    }

    const analytics = calculateAnalytics();

    return (
        <div className="academic-dashboard">
            <h1>Academic Dashboard</h1>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card">
                    <h3>Total Students</h3>
                    <p>{students.length}</p>
                </div>
                <div className="card">
                    <h3>Total Courses</h3>
                    <p>{courses.length}</p>
                </div>
                <div className="card">
                    <h3>Active Offerings</h3>
                    <p>{intakeCourses.filter(ic => ic.status === 'available').length}</p>
                </div>
                <div className="card">
                    <h3>Total Results</h3>
                    <p>{results.length}</p>
                </div>
            </div>

            {/* Course Completion Analytics */}
            <div className="analytics-section">
                <h2>Course Completion Rates</h2>
                {analytics && (
                    <div className="analytics-grid">
                        {analytics.map(analytic => (
                            <div key={analytic.intakeCourseId} className="analytic-card">
                                <h4>{analytic.courseName}</h4>
                                <p>Completion Rate: {analytic.completionRate.toFixed(1)}%</p>
                                <p>Enrollment: {analytic.enrollmentCount}/{analytic.maxStudents}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Student List */}
            <div className="students-section">
                <h2>Students</h2>
                <button onClick={handleCreateStudent}>Add New Student</button>
                <div className="students-grid">
                    {students.map(student => (
                        <div key={student._id} className="student-card">
                            <h4>Student ID: {student._id}</h4>
                            <p>Status: {student.status}</p>
                            <p>Completion: {student.completionStatus}</p>
                            <p>Year: {student.year}</p>
                            <p>CGPA: {student.cgpa}</p>

                            {/* Attendance for this student */}
                            <div className="attendance-info">
                                <p>Average Attendance: {getAverageAttendance(student._id).toFixed(1)}%</p>
                            </div>

                            {/* Action buttons */}
                            <div className="student-actions">
                                <button
                                    onClick={() => handleUpdateStudentStatus(student._id, 'completed')}
                                    disabled={student.completionStatus === 'completed'}
                                >
                                    Mark Complete
                                </button>
                                <button
                                    onClick={() => handleUpdateStudentStatus(student._id, 'in progress')}
                                    disabled={student.completionStatus === 'in progress'}
                                >
                                    Mark In Progress
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results Analysis */}
            <div className="results-section">
                <h2>Exam Results Analysis</h2>
                <div className="results-grid">
                    {getModulePassRates().map(module => (
                        <div key={module.moduleId} className="result-card">
                            <h4>Module: {module.moduleId}</h4>
                            <p>Pass Rate: {module.passRate.toFixed(1)}%</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Utility buttons */}
            <div className="utility-buttons">
                <button onClick={clearData}>Clear All Data</button>
                <button onClick={clearErrors}>Clear Errors</button>
            </div>
        </div>
    );
};

export default AcademicDashboard;

// Usage in other components:
/*
import { useAcademicStore } from './store/academic.js';

const MyComponent = () => {
  const { students, fetchStudents, loading } = useAcademicStore();
  
  useEffect(() => {
    fetchStudents();
  }, []);
  
  if (loading.students) return <div>Loading...</div>;
  
  return (
    <div>
      {students.map(student => (
        <div key={student._id}>{student.name}</div>
      ))}
    </div>
  );
};
*/ 