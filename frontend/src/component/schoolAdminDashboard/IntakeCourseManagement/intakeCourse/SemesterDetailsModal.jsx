import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    Progress,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    IconButton,
    Divider,
    Button,
    Icon,
    Flex,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiTrash2 } from "react-icons/fi";
import { CompletionStatusBadge } from "./CompletionStatusBadge";
import { SemesterTimeline } from "./SemesterTimeline";
import { useAcademicStore } from "../../../../store/academic";
import { useRef } from "react";

export function SemesterDetailsModal({
    isOpen,
    onClose,
    selectedIntakeCourse,
    currentSemesters,
    currentSemesterIndex,
    onPreviousSemester,
    onNextSemester,
    onOpenAddSemesterModal,
    onOpenEditSemesterModal,
    onSemesterClick,
    onRefresh,
    onRefreshCurrentSemesters
}) {
    const toast = useToast();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const { deleteSemester } = useAcademicStore();

    const getProgressColor = (percentage) => {
        if (percentage == 100) return "green";
        return "red";
    };

    const calculateTotalProgress = () => {
        const totalDurationInDays = currentSemesters.reduce((total, semester) => {
            if (semester.startDate && semester.endDate) {
                const startDate = new Date(semester.startDate);
                const endDate = new Date(semester.endDate);
                const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                return total + durationInDays;
            }
            return total;
        }, 0);

        const totalDurationInMonths = Math.round(totalDurationInDays / 30);
        const courseDurationInMonths = selectedIntakeCourse?.courseId?.duration;
        const progressPercentage = courseDurationInMonths > 0 ?
            Math.min((totalDurationInMonths / courseDurationInMonths) * 100, 100) : 0;

        return { totalDurationInDays, totalDurationInMonths, courseDurationInMonths, progressPercentage };
    };

    const handleDeleteSemester = async () => {
        if (currentSemesters.length === 0 || currentSemesterIndex >= currentSemesters.length) {
            toast({
                title: "Error",
                description: "No semester selected for deletion",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const semesterToDelete = currentSemesters[currentSemesterIndex];

        try {
            const result = await deleteSemester(semesterToDelete._id);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Semester deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Close the modal after successful deletion
                onClose();

                // Refresh the semesters data
                if (onRefresh) {
                    onRefresh();
                }

                // Refresh current semesters for the specific course
                if (onRefreshCurrentSemesters) {
                    onRefreshCurrentSemesters();
                }
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to delete semester",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "An error occurred while deleting the semester",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }

        onDeleteClose();
    };

    const progress = calculateTotalProgress();

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay />
                <ModalContent>
                    <Flex w="full" h="600px">
                        {/* Right Side - Details */}
                        <Box flex="1" p={6}>
                            <VStack align="start" spacing={4} h="full">
                                <Box w="full">
                                    <HStack justify="space-between" align="center">
                                        <VStack align="start" spacing={1} w="full">
                                            <HStack >
                                                <Text fontSize="lg" fontWeight="bold">
                                                    Semester Details
                                                </Text>
                                                <CompletionStatusBadge
                                                    semesters={currentSemesters}
                                                    courseDuration={selectedIntakeCourse?.courseId?.duration}
                                                />
                                            </HStack>
                                            {selectedIntakeCourse && (
                                                <Text fontSize="sm" color="gray.600">
                                                    {selectedIntakeCourse.intakeId?.intakeName} - {selectedIntakeCourse.courseId?.courseName}
                                                </Text>
                                            )}

                                            {/* Total Duration Summary with Progress */}
                                            {progress.totalDurationInDays > 0 && (
                                                <VStack align="start" spacing={2} w="full">
                                                    <HStack justify="space-between" w="full">
                                                        <Text fontSize="xs" color="blue.700" fontWeight="medium">
                                                            Semesters filled: {progress.totalDurationInMonths} months
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {progress.courseDurationInMonths} months total
                                                        </Text>
                                                    </HStack>
                                                    <Box w="full" position="relative">
                                                        <Progress
                                                            value={progress.progressPercentage}
                                                            colorScheme={getProgressColor(progress.progressPercentage) == "red" ? "red" : "green"}
                                                            size="sm"
                                                            borderRadius="full"
                                                        />
                                                        <Text
                                                            position="absolute"
                                                            top="50%"
                                                            left="50%"
                                                            transform="translate(-50%, -50%)"
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            color="white"
                                                            textShadow="0 0 2px rgba(0,0,0,0.5)"
                                                        >
                                                            {Math.round(progress.progressPercentage)}%
                                                        </Text>
                                                    </Box>
                                                </VStack>
                                            )}
                                        </VStack>
                                    </HStack>
                                </Box>

                                {/* Navigation Controls */}
                                {currentSemesters.length > 1 && (
                                    <HStack justify="space-between" w="full">
                                        <IconButton
                                            icon={<Icon as={FiChevronLeft} />}
                                            onClick={onPreviousSemester}
                                            isDisabled={currentSemesterIndex === 0}
                                            size="sm"
                                            variant="outline"
                                            aria-label="Previous semester"
                                        />
                                        <Text fontSize="sm" color="gray.600">
                                            {currentSemesterIndex + 1} of {currentSemesters.length}
                                        </Text>
                                        <IconButton
                                            icon={<Icon as={FiChevronRight} />}
                                            onClick={onNextSemester}
                                            isDisabled={currentSemesterIndex === currentSemesters.length - 1}
                                            size="sm"
                                            variant="outline"
                                            aria-label="Next semester"
                                        />
                                    </HStack>
                                )}

                                {/* Action Buttons */}
                                <HStack spacing={2} w="full">
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={onOpenAddSemesterModal}
                                        leftIcon={<Icon as={FiCalendar} />}
                                        flex="1"
                                        disabled={progress.progressPercentage == 100}
                                    >
                                        Add Semester
                                    </Button>
                                    {currentSemesters.length > 0 && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={onOpenEditSemesterModal}
                                            flex="1"
                                        >
                                            Edit Current
                                        </Button>
                                    )}
                                    {currentSemesters.length > 0 && (
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            variant="outline"
                                            onClick={onDeleteOpen}
                                            leftIcon={<Icon as={FiTrash2} />}
                                            flex="1"
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </HStack>

                                {/* Semester Details */}
                                {currentSemesters.length > 0 && currentSemesters[currentSemesterIndex] && (
                                    <Box flex="1" w="full" overflowY="auto">
                                        <VStack spacing={3} align="stretch">
                                            <Text fontWeight="semibold" fontSize="md">
                                                Semester Information
                                            </Text>

                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Semester ID:</Text>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {currentSemesters[currentSemesterIndex]._id || 'N/A'}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Start Date:</Text>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {currentSemesters[currentSemesterIndex].startDate ?
                                                        new Date(currentSemesters[currentSemesterIndex].startDate).toLocaleDateString() : 'N/A'}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">End Date:</Text>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {currentSemesters[currentSemesterIndex].endDate ?
                                                        new Date(currentSemesters[currentSemesterIndex].endDate).toLocaleDateString() : 'N/A'}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Duration:</Text>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {(() => {
                                                        const semester = currentSemesters[currentSemesterIndex];
                                                        if (semester.startDate && semester.endDate) {
                                                            const startDate = new Date(semester.startDate);
                                                            const endDate = new Date(semester.endDate);
                                                            const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                                                            const durationInMonths = Math.round(durationInDays / 30);
                                                            return `${durationInDays} days (~${durationInMonths} months)`;
                                                        }
                                                        return 'N/A';
                                                    })()}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Status:</Text>
                                                <Badge colorScheme={currentSemesters[currentSemesterIndex].isActive ? 'green' : 'gray'}>
                                                    {currentSemesters[currentSemesterIndex].isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </HStack>

                                            {currentSemesters[currentSemesterIndex].description && (
                                                <>
                                                    <Text fontSize="sm" color="gray.600">Description:</Text>
                                                    <Text fontSize="sm" p={3} bg="gray.50" borderRadius="md">
                                                        {currentSemesters[currentSemesterIndex].description}
                                                    </Text>
                                                </>
                                            )}
                                        </VStack>

                                        <Divider />

                                        {/* Course Information */}
                                        <VStack spacing={3} align="stretch">
                                            <Text fontWeight="semibold" fontSize="md">
                                                Associated Course
                                            </Text>

                                            <Box p={3} bg="gray.50" borderRadius="md">
                                                <VStack align="start" spacing={2}>
                                                    <Text fontWeight="medium">
                                                        {selectedIntakeCourse?.courseId?.courseName || 'Unknown Course'}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Code: {selectedIntakeCourse?.courseId?.courseCode || 'N/A'}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Level: {selectedIntakeCourse?.courseId?.courseLevel || 'N/A'}
                                                    </Text>
                                                </VStack>
                                            </Box>
                                        </VStack>
                                    </Box>
                                )}

                                {currentSemesters.length === 0 && (
                                    <Box textAlign="center" py={8}>
                                        <Text color="gray.500">No semester data available</Text>
                                    </Box>
                                )}
                            </VStack>
                        </Box>

                        {/* Left Side - Timeline */}
                        <Box flex="1" p={6} borderRight="1px solid" borderColor="gray.200" overflowY="hidden">
                            <VStack align="start" spacing={4} h="full" overflowY="hidden">
                                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                    Semester Timeline
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    Click on any semester to view its details
                                </Text>

                                <Box flex="1" w="full" overflowY="auto">
                                    <SemesterTimeline
                                        semesters={currentSemesters}
                                        currentSemesterIndex={currentSemesterIndex}
                                        onSemesterClick={onSemesterClick}
                                    />
                                </Box>
                            </VStack>
                        </Box>
                    </Flex>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Semester
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this semester? This action cannot be undone.
                            {currentSemesters.length > 0 && currentSemesters[currentSemesterIndex] && (
                                <Text mt={2} fontWeight="medium">
                                    Semester: {currentSemesters[currentSemesterIndex].semesterName || 'Unnamed Semester'}
                                </Text>
                            )}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteSemester} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}