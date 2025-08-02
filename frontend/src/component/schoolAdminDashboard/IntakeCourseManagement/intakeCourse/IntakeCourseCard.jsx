import {
    Box,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Badge,
    Progress,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FiBook, FiUsers, FiEye, FiArrowRight } from "react-icons/fi";
import { BiBorderAll } from "react-icons/bi";

// Animation keyframes for incomplete semester warning
const pulseIncomplete = keyframes`
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(0.95); }
`;

export function IntakeCourseCard({
    intakeCourse,
    studentCount,
    semesters,
    onCardClick,
    onViewSemester
}) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const getCapacityPercentage = () => {
        return Math.min((studentCount / intakeCourse.maxStudents) * 100, 100);
    };

    const getCapacityColor = (percentage) => {
        if (percentage >= 90) return "red";
        if (percentage >= 70) return "orange";
        if (percentage >= 50) return "yellow";
        return "green";
    };

    const getSemesterProgress = () => {
        const totalSemester = semesters.filter(s => s.courseId._id == intakeCourse.courseId._id);

        // Calculate total duration of all semesters in days
        const totalDurationInDays = totalSemester.reduce((total, semester) => {
            if (semester.startDate && semester.endDate) {
                const startDate = new Date(semester.startDate);
                const endDate = new Date(semester.endDate);
                const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                return total + durationInDays;
            }
            return total;
        }, 0);

        // Convert days to months (approximately)
        const totalDurationInMonths = Math.round(totalDurationInDays / 30);

        // Calculate progress percentage
        const courseDurationInMonths = intakeCourse.courseId.duration; // Convert years to months
        const progressPercentage = courseDurationInMonths > 0 ?
            Math.min((totalDurationInMonths / courseDurationInMonths) * 100, 100) : 0;

        return {
            totalSemester,
            totalDurationInDays,
            totalDurationInMonths,
            courseDurationInMonths,
            progressPercentage
        };
    };

    const getProgressColor = (percentage) => {
        if (percentage == 100) return "green";
        return "red";
    };

    const semesterProgress = getSemesterProgress();

    return (
        <Card
            bg={bgColor}
            borderColor={borderColor}
            borderWidth="1px"
            cursor="pointer"
            transition="all 0.3s ease"
            _hover={{
                transform: "translateY(-4px) scale(1.02)",
                shadow: "xl",
                borderColor: "blue.300"
            }}
            _active={{
                transform: "translateY(-2px) scale(1.01)"
            }}
        >
            <CardBody>
                <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={2} flex={1}>
                            <HStack justify="space-between" w="full">
                                <Text fontWeight="bold" fontSize="lg" color="blue.600">
                                    {intakeCourse.intakeId?.intakeName || 'Unknown Intake'}
                                </Text>
                                <Badge colorScheme="green" variant="solid">
                                    {intakeCourse.intakeId?.intakeMonth || 'N/A'}
                                </Badge>
                            </HStack>

                            {/* Capacity Progress Bar */}
                            <Box w="full">
                                <HStack justify="space-between" mb={1}>
                                    <Text fontSize="sm" color="gray.600">
                                        Students Enrolled
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                        {studentCount}/{intakeCourse.maxStudents}
                                    </Text>
                                </HStack>
                                <Progress
                                    value={getCapacityPercentage()}
                                    colorScheme={getCapacityColor(getCapacityPercentage())}
                                    size="md"
                                    borderRadius="md"
                                    bg="gray.100"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {getCapacityPercentage().toFixed(0)}% capacity
                                </Text>
                            </Box>
                        </VStack>
                        <Icon as={FiUsers} color="gray.400" />
                    </HStack>

                    {/* Course Information */}
                    <Box>
                        <HStack mb={2}>
                            <Icon as={FiBook} size="16px" color="gray.500" />
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                Course Details
                            </Text>
                        </HStack>
                        <VStack align="start" spacing={1} pl={6}>
                            <Text fontWeight="semibold" fontSize="md">
                                {intakeCourse.courseId?.courseName || 'Unknown Course'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Code: {intakeCourse.courseId?.courseCode || 'N/A'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Duration: {intakeCourse.courseId?.duration || 'N/A'} years
                            </Text>
                        </VStack>
                    </Box>

                    {/* Course Statistics */}
                    <Box>
                        <HStack mb={2}>
                            <Icon as={FiUsers} size="16px" color="gray.500" />
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                Program Info
                            </Text>
                        </HStack>
                        <VStack align="start" spacing={1} pl={6}>
                            <Text fontSize="sm" color="gray.600">
                                Level: {intakeCourse.courseId?.courseLevel || 'N/A'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Type: {intakeCourse.courseId?.courseType || 'N/A'}
                            </Text>
                            {intakeCourse.courseId?.description && (
                                <Text fontSize="xs" color="gray.500" noOfLines={2}>
                                    {intakeCourse.courseId.description}
                                </Text>
                            )}
                        </VStack>
                    </Box>

                    {/* Semester Progress Section */}
                    <Box
                        position="relative"
                        overflow="hidden"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => onViewSemester(intakeCourse)}
                        className="semester-container"
                        _hover={{
                            '& .semester-overlay': {
                                opacity: 1
                            }
                        }}
                    >
                        <HStack
                            p={2}
                            borderRadius="md"
                            transition="all 0.3s ease"
                            bg={getProgressColor(semesterProgress.progressPercentage) == "red" ? "red.50" : "blue.50"}
                            _hover={{
                                transform: "scale(1.02)",
                                bg: "blue.50",
                                color: "blue.700",
                                shadow: "sm"
                            }}
                        >
                            <Icon as={BiBorderAll} size="16px" color="gray.500" />
                            <VStack align="start" spacing={2} w="full">
                                <HStack justify="space-between" w="full">
                                    <Text fontSize="sm" fontWeight="medium" color={getProgressColor(semesterProgress.progressPercentage) == "red" ? "red.500" : "gray.800"}>
                                        Semester ({semesterProgress.totalSemester.length})
                                    </Text>
                                    {semesterProgress.totalDurationInDays > 0 && (
                                        <Text fontSize="xs" color={getProgressColor(semesterProgress.progressPercentage) == "red" ? "red.500" : "blue.500"} fontWeight="medium">
                                            {semesterProgress.totalDurationInMonths}/{semesterProgress.courseDurationInMonths} months
                                        </Text>
                                    )}
                                </HStack>
                                {semesterProgress.totalDurationInDays > 0 && (
                                    <Box w="full" position="relative">
                                        <Progress
                                            value={semesterProgress.progressPercentage}
                                            colorScheme={getProgressColor(semesterProgress.progressPercentage)}
                                            size="sm"
                                            borderRadius="md"
                                            bg="gray.100"
                                        />
                                        <HStack justify="space-between" mt={1}>
                                            <Text fontSize="xs" color="gray.500">
                                                {semesterProgress.progressPercentage.toFixed(1)}% of course duration
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}
                            </VStack>

                            {/* Overlay that appears on hover */}
                            <Box
                                className="semester-overlay"
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                bottom="0"
                                bg={getProgressColor(semesterProgress.progressPercentage) == "red" ? "red.500" : "blue.500"}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                opacity="0"
                                transition="all 0.3s ease"
                                borderRadius="md"
                            >
                                <Text
                                    color="white"
                                    fontWeight="bold"
                                    fontSize="sm"
                                    textAlign="center"
                                >
                                    View All
                                </Text>
                            </Box>
                        </HStack>

                        {/* Additional animated warning overlay for incomplete semesters */}
                        {semesterProgress.progressPercentage < 100 && (
                            <Box
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                bottom="0"
                                bg="rgba(239, 68, 68, 0.1)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="md"
                                pointerEvents="none"
                                animation={`${pulseIncomplete} 2s infinite ease-in-out`}
                            >
                                <Text
                                    color="red.600"
                                    fontWeight="bold"
                                    fontSize="xs"
                                    textAlign="center"
                                    textShadow="0 0 4px rgba(255,255,255,0.8)"
                                    px={2}
                                    py={1}
                                    bg="rgba(255,255,255,0.9)"
                                    borderRadius="md"
                                >
                                    INCOMPLETE
                                </Text>
                            </Box>
                        )}
                    </Box>

                    {/* Intake Details */}
                    <Box bg="gray.50" p={3} rounded="md">
                        <Text fontSize="xs" color="gray.600" mb={1}>
                            Registration Period
                        </Text>
                        <HStack justify="space-between">
                            <Text fontSize="sm">
                                Start: {intakeCourse.intakeId.registrationStartDate ?
                                    new Date(intakeCourse.intakeId.registrationStartDate).toLocaleDateString() : 'N/A'}
                            </Text>
                            <Text fontSize="sm">
                                End: {intakeCourse.intakeId.registrationEndDate ?
                                    new Date(intakeCourse.intakeId.registrationEndDate).toLocaleDateString() : 'N/A'}
                            </Text>
                        </HStack>
                    </Box>
                </VStack>

                {/* Click Indicator */}
                <HStack justify="space-between" align="center" mt={4} pt={3} borderTop="1px" borderColor="gray.100">
                    <Text opacity={0.7} fontSize={"10px"}>
                        Last Updated: {intakeCourse.updatedAt ?
                            new Date(intakeCourse.updatedAt).toLocaleDateString() : 'N/A'}
                    </Text>
                    <HStack spacing={1} color="blue.500" fontSize="xs">
                        <Icon as={FiEye} size="12px" />
                        <Text
                            fontWeight="medium"
                            _hover={{ textDecoration: "underline" }}
                            onClick={() => onCardClick(intakeCourse)}
                        >
                            View Students
                        </Text>
                        <Icon as={FiArrowRight} size="10px" />
                    </HStack>
                </HStack>
            </CardBody>
        </Card>
    );
}