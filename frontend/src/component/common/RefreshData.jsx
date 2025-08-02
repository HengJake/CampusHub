import React, { useState } from 'react';
import { IoMdRefreshCircle } from "react-icons/io";
import { IconButton, useToast, Spinner } from '@chakra-ui/react';
import { useAcademicStore } from '../../store/academic.js';

function RefreshData() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const toast = useToast();

    const {
        students,
        results,
        fetchStudents,
        fetchResults,
        updateStudent,
    } = useAcademicStore();

    /**
     * CGPA CALCULATION FUNCTION
     * ========================
     * Calculates CGPA based on student's results using grade points and credit hours
     */
    const calculateStudentCGPA = (studentId) => {
        const studentResults = results.filter(r => r.studentId._id === studentId);

        if (studentResults.length === 0) return 0;

        // Grade point mapping based on your Result model
        const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };

        // Calculate weighted GPA
        const totalWeightedPoints = studentResults.reduce((sum, result) => {
            const points = gradePoints[result.grade] || 0;
            return sum + (points * result.creditHours);
        }, 0);

        const totalCreditHours = studentResults.reduce((sum, r) => sum + r.creditHours, 0);

        if (totalCreditHours === 0) return 0;

        const cgpa = totalWeightedPoints / totalCreditHours;
        return Math.round(cgpa * 100) / 100; // Round to 2 decimal places
    };

    /**
     * UPDATE ALL STUDENT CGPAs
     * =======================
     * Recalculates and updates CGPA for all students
     */
    const updateAllStudentCGPAs = async () => {
        const updatedStudents = [];
        let successCount = 0;
        let errorCount = 0;

        for (const student of students) {
            try {
                const newCGPA = calculateStudentCGPA(student._id);

                // Only update if CGPA has changed
                if (Math.abs(student.cgpa - newCGPA) > 0.01) {

                    const updatedStudent = {
                        ...student,
                        intakeCourseId: student.intakeCourseId._id,
                        userId: student.userId._id,
                        cgpa: newCGPA,
                        academicStanding: getAcademicStanding(newCGPA),
                        completedCreditHours: getCompletedCreditHours(student._id)
                    }

                    const result = await updateStudent(student._id, updatedStudent);

                    if (result.success) {
                        successCount++;
                        updatedStudents.push({
                            studentId: student._id,
                            oldCGPA: student.cgpa,
                            newCGPA: newCGPA,
                            standing: updateData.academicStanding
                        });

                        console.log(`✅ Updated CGPA for student ${student._id}: ${student.cgpa} → ${newCGPA}`);
                    } else {
                        errorCount++;
                        console.error(`❌ Failed to update CGPA for student ${student._id}`);
                    }
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Error updating student ${student._id}:`, error);
            }
        }

        return { updatedStudents, successCount, errorCount };
    };

    /**
     * DETERMINE ACADEMIC STANDING
     * ==========================
     * Sets academic standing based on CGPA
     */
    const getAcademicStanding = (cgpa) => {
        if (cgpa >= 3.5) return 'good';
        if (cgpa >= 2.5) return 'warning';
        if (cgpa >= 2.0) return 'probation';
        return 'suspended';
    };

    /**
     * CALCULATE COMPLETED CREDIT HOURS
     * ===============================
     * Calculates total credit hours for passed modules
     */
    const getCompletedCreditHours = (studentId) => {
        const studentResults = results.filter(r => r.studentId === studentId);
        return studentResults
            .filter(r => ['A', 'B', 'C', 'D'].includes(r.grade)) // Only passed grades
            .reduce((sum, r) => sum + r.creditHours, 0);
    };

    /**
     * MAIN REFRESH HANDLER
     * ===================
     * Handles the complete refresh process
     */
    const handleRefresh = async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);

        try {
            console.log("🔄 Starting data refresh and CGPA update...");

            // Step 1: Fetch latest data
            toast({
                title: "Refreshing Data",
                description: "Fetching latest student and result data...",
                status: "info",
                duration: 2000,
                isClosable: true,
            });

            await Promise.all([
                fetchStudents(),
                fetchResults()
            ]);

            console.log("✅ Data fetched successfully");

            // Step 2: Update CGPAs
            toast({
                title: "Updating CGPAs",
                description: "Recalculating and updating student CGPAs...",
                status: "info",
                duration: 3000,
                isClosable: true,
            });

            const updateResults = await updateAllStudentCGPAs();

            console.log("📊 CGPA Update Results:", updateResults);

            // Step 3: Refresh data again to get updated values
            await fetchStudents();

            // Step 4: Show results
            if (updateResults.successCount > 0) {
                toast({
                    title: "CGPA Update Complete! 🎉",
                    description: `Successfully updated ${updateResults.successCount} student CGPAs${updateResults.errorCount > 0 ? ` (${updateResults.errorCount} errors)` : ''}`,
                    status: updateResults.errorCount > 0 ? "warning" : "success",
                    duration: 5000,
                    isClosable: true,
                });

                // Log detailed results for debugging
                console.log("📈 Updated Students:", updateResults.updatedStudents);
            } else {
                toast({
                    title: "No Updates Needed",
                    description: "All student CGPAs are already up to date",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            }

        } catch (error) {
            console.error("❌ Error during refresh:", error);
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh data or update CGPAs",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <IconButton
            aria-label='Refresh Data & Update CGPAs'
            icon={isRefreshing ? <Spinner size="sm" /> : <IoMdRefreshCircle />}
            onClick={handleRefresh}
            isLoading={isRefreshing}
            colorScheme={"blue"}
            title={isRefreshing ? "Updating CGPAs..." : "Refresh data and update student CGPAs"}
        />
    );
}

export default RefreshData;