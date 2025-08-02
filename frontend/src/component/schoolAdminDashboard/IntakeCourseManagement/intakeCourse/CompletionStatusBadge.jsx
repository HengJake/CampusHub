import { Badge } from "@chakra-ui/react";

/**
 * Calculates course completion status based on semester durations
 * @param {Array} semesters - Array of semester objects with startDate and endDate
 * @param {number} courseDurationInMonths - Expected course duration in months
 * @returns {Object} - { isCompleted: boolean, progressPercentage: number }
 */
const getCourseCompletionStatus = (semesters, courseDurationInMonths) => {
    if (!semesters?.length || !courseDurationInMonths) {
        return { isCompleted: false, progressPercentage: 0 };
    }

    const totalDurationInDays = semesters.reduce((total, semester) => {
        if (semester.startDate && semester.endDate) {
            const startDate = new Date(semester.startDate);
            const endDate = new Date(semester.endDate);
            const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            return total + durationInDays;
        }
        return total;
    }, 0);

    const totalDurationInMonths = Math.round(totalDurationInDays / 30);
    const progressPercentage = Math.min((totalDurationInMonths / courseDurationInMonths) * 100, 100);
    const isCompleted = progressPercentage >= 100;

    return { isCompleted, progressPercentage };
};

/**
 * Renders completion status badge
 * @param {Array} semesters - Array of semester objects
 * @param {number} courseDuration - Course duration in months
 * @returns {JSX.Element} - Badge component showing completion status
 */
export function CompletionStatusBadge({ semesters, courseDuration }) {
    const { isCompleted } = getCourseCompletionStatus(semesters, courseDuration);

    return (
        <Badge
            colorScheme={isCompleted ? "green" : "red"}
            variant="outline"
        >
            {isCompleted ? "Completed" : "Incomplete"}
        </Badge>
    );
}