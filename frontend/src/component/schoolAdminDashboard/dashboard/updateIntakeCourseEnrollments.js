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
        console.log("Starting enrollment update process...");
        console.log("Total intake courses:", intakeCourses.length);
        console.log("Total students:", students.length);

        const updatePromises = intakeCourses.map(async (intakeCourse) => {
            // Filter students for this specific intake course
            const enrolledStudents = students.filter(
                (student) =>
                    student.intakeCourseId._id === intakeCourse._id
            );

            const currentEnrollment = enrolledStudents.length;

            console.log(
                `Intake Course ${intakeCourse.intakeId.intakeName}-${intakeCourse.courseId.courseName} : ${currentEnrollment} enrolled students`
            );

            // Only update if the enrollment count has changed
            if (intakeCourse.currentEnrollment !== currentEnrollment) {
                console.log(
                    `Updating ${intakeCourse.name} enrollment from ${intakeCourse.currentEnrollment} to ${currentEnrollment}`
                );

                const updatedIntakeCourse = {
                    ...intakeCourse,
                    currentEnrollment: currentEnrollment,
                    courseId: intakeCourse.courseId._id,
                    intakeId: intakeCourse.intakeId._id,
                    schoolId: intakeCourse.schoolId._id,
                }

                const updateResult = await updateIntakeCourse(intakeCourse._id, updatedIntakeCourse);

                if (!updateResult.success) {
                    console.error(
                        `Failed to update ${intakeCourse.name}:`,
                        updateResult.message
                    );
                    return { success: false, course: intakeCourse.name, error: updateResult.message };
                }

                return { success: true, course: intakeCourse.name, newEnrollment: currentEnrollment };
            } else {
                console.log(
                    `No update needed for ${intakeCourse.name} (enrollment: ${currentEnrollment})`
                );
                return { success: true, course: intakeCourse.name, noChange: true };
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