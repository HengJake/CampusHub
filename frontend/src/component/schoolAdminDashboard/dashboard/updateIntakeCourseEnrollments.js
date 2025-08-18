/**
 * Updates the currentEnrollment for all intake courses based on enrolled students
 * @param {Array} intakeCourses - Array of intake course objects
 * @param {Array} students - Array of student objects
 * @param {Function} updateIntakeCourse - Function to update intake course in store
 * @param {Function} fetchIntakeCourses - Function to refresh intake courses data
 * @returns {Promise<Object>} - Result of the update operation
 */
export const updateIntakeCourseEnrollments = async (
    intakeCourses,
    students,
    updateIntakeCourse,
    fetchIntakeCourses
) => {
    try {


        const updatePromises = intakeCourses.map(async (intakeCourse) => {
            // Filter students for this specific intake course with valid enrollment status
            const allStudentsForCourse = students.filter(
                (student) => student.intakeCourseId._id === intakeCourse._id
            );

            const enrolledStudents = allStudentsForCourse.filter(
                (student) => (student.status === 'enrolled' || student.status === 'in_progress')
            );

            const currentEnrollment = enrolledStudents.length;

            // Log detailed breakdown for debugging
            const statusBreakdown = allStudentsForCourse.reduce((acc, student) => {
                acc[student.status] = (acc[student.status] || 0) + 1;
                return acc;
            }, {});



            // Only update if the enrollment count has changed
            if (intakeCourse.currentEnrollment !== currentEnrollment) {


                // Only update the currentEnrollment field - backend will handle status automatically
                const updateData = {
                    ...intakeCourse,
                    currentEnrollment: currentEnrollment,
                    intakeId: intakeCourse.intakeId._id,
                    courseId: intakeCourse.courseId._id,
                    schoolId: intakeCourse.schoolId._id,
                };

                const updateResult = await updateIntakeCourse(intakeCourse._id, updateData);

                if (!updateResult.success) {
                    console.error(
                        `Failed to update ${intakeCourse.name || `${intakeCourse.intakeId.intakeName}-${intakeCourse.courseId.courseName}`}:`,
                        updateResult.message
                    );
                    return { success: false, course: intakeCourse.name || `${intakeCourse.intakeId.intakeName}-${intakeCourse.courseId.courseName}`, error: updateResult.message };
                }

                console.log(
                    `  - SUCCESS: Updated enrollment to ${currentEnrollment}`
                );

                return {
                    success: true,
                    course: intakeCourse.name || `${intakeCourse.intakeId.intakeName}-${intakeCourse.courseId.courseName}`,
                    newEnrollment: currentEnrollment
                };
            } else {
                console.log(
                    `  - NO CHANGE: enrollment remains at ${currentEnrollment}`
                );
                return { success: true, course: intakeCourse.name || `${intakeCourse.intakeId.intakeName}-${intakeCourse.courseId.courseName}`, noChange: true };
            }
        });

        const results = await Promise.all(updatePromises);

        // Count successful updates
        const successfulUpdates = results.filter(result => result.success && !result.noChange).length;
        const noChangeCount = results.filter(result => result.noChange).length;
        const failedUpdates = results.filter(result => !result.success).length;

        console.log(`Enrollment update completed:`);
        console.log(`- Successful updates: ${successfulUpdates}`);
        console.log(`- No changes needed: ${noChangeCount}`);
        console.log(`- Failed updates: ${failedUpdates}`);

        // Refresh intake courses data to ensure UI is up to date
        if (successfulUpdates > 0) {
            await fetchIntakeCourses();
        }

        return {
            success: true,
            message: `Updated ${successfulUpdates} intake courses, ${noChangeCount} unchanged, ${failedUpdates} failed`,
            results: results
        };

    } catch (error) {
        console.error("Error updating intake course enrollments:", error);
        return {
            success: false,
            message: error.message || "Failed to update intake course enrollments"
        };
    }
}; 