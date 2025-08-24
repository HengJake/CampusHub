import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    IconButton,
    Badge,
    Progress,
    Divider,
    Flex,
    Icon,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiTrash2, FiX, FiBookOpen } from 'react-icons/fi';
import { CompletionStatusBadge } from './CompletionStatusBadge';
import { SemesterTimeline } from './SemesterTimeline';
import AddModuleModal from './AddModuleModal';
import { useAcademicStore } from '../../../../store/academic';

const SemesterDetailsModal = ({
    isOpen,
    onClose,
    selectedIntakeCourse,
    currentSemesters,
    onOpenAddSemesterModal,
    onOpenEditSemesterModal,
    onDeleteOpen
}) => {
    const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
    const [moduleCounts, setModuleCounts] = useState({});
    const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
    const toast = useToast();
    const { getModuleCountBySemester } = useAcademicStore();

    // Calculate progress
    const progress = React.useMemo(() => {
        if (!currentSemesters.length || !selectedIntakeCourse?.courseId?.duration) {
            return {
                totalDurationInDays: 0,
                totalDurationInMonths: 0,
                courseDurationInMonths: 0,
                progressPercentage: 0
            };
        }

        const totalDurationInDays = currentSemesters.reduce((total, semester) => {
            if (semester.startDate && semester.endDate) {
                const startDate = new Date(semester.startDate);
                const endDate = new Date(semester.endDate);
                return total + Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            }
            return total;
        }, 0);

        const totalDurationInMonths = Math.round(totalDurationInDays / 30);
        const courseDurationInMonths = selectedIntakeCourse.courseId.duration;
        const progressPercentage = Math.min((totalDurationInMonths / courseDurationInMonths) * 100, 100);

        return {
            totalDurationInDays,
            totalDurationInMonths,
            courseDurationInMonths,
            progressPercentage
        };
    }, [currentSemesters, selectedIntakeCourse]);

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "green";
        if (percentage >= 80) return "blue";
        if (percentage >= 60) return "yellow";
        if (percentage >= 40) return "orange";
        return "red";
    };

    const onPreviousSemester = () => {
        if (currentSemesterIndex > 0) {
            setCurrentSemesterIndex(currentSemesterIndex - 1);
        }
    };

    const onNextSemester = () => {
        if (currentSemesterIndex < currentSemesters.length - 1) {
            setCurrentSemesterIndex(currentSemesterIndex + 1);
        }
    };

    const onSemesterClick = (index) => {
        setCurrentSemesterIndex(index);
    };

    useEffect(() => {
        if (isOpen && currentSemesters.length > 0) {
            setCurrentSemesterIndex(0);
            fetchModuleCounts();
        }
    }, [isOpen, currentSemesters]);

    const fetchModuleCounts = async () => {
        const counts = {};
        for (const semester of currentSemesters) {
            try {
                const result = await getModuleCountBySemester(semester._id);
                if (result.success) {
                    counts[semester._id] = result.data.count;
                } else {
                    counts[semester._id] = 0;
                }
            } catch (error) {
                counts[semester._id] = 0;
            }
        }
        setModuleCounts(counts);
    };

    const handleModuleAdded = () => {
        fetchModuleCounts();
    };

    if (!isOpen) return null;

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.8)"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
        >
            <Box
                bg="white"
                borderRadius="xl"
                w="full"
                maxW="95vw"
                h="95vh"
                position="relative"
                overflow="hidden"
                boxShadow="2xl"
            >
                {/* Close Button */}
                <IconButton
                    icon={<Icon as={FiX} />}
                    onClick={onClose}
                    position="absolute"
                    top={4}
                    right={4}
                    zIndex={10}
                    size="lg"
                    variant="ghost"
                    color="gray.600"
                    _hover={{ bg: "gray.100" }}
                    aria-label="Close"
                />

                <Flex w="full" h="full">
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

                                        {/* Module Summary */}
                                        <VStack align="start" spacing={2} w="full">
                                            <HStack justify="space-between" w="full">
                                                <Text fontSize="xs" color="purple.700" fontWeight="medium">
                                                    Total Modules: {Object.values(moduleCounts).reduce((sum, count) => sum + count, 0)}
                                                </Text>
                                                <Text fontSize="xs" color="gray.600">
                                                    Across {currentSemesters.length} semester(s)
                                                </Text>
                                            </HStack>
                                        </VStack>
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

                            {/* Module Management Buttons */}
                            {currentSemesters.length > 0 && (
                                <HStack spacing={2} w="full">
                                    <Button
                                        size="sm"
                                        colorScheme="purple"
                                        onClick={fetchModuleCounts}
                                        leftIcon={<Icon as={FiBookOpen} />}
                                        flex="1"
                                    >
                                        Refresh Module Counts
                                    </Button>
                                </HStack>
                            )}

                            {/* Semester Details */}
                            {currentSemesters.length > 0 && currentSemesters[currentSemesterIndex] && (
                                <Box flex="1" w="full" overflowY="auto" pr={3}>
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

                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Modules:</Text>
                                                <HStack spacing={2}>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {moduleCounts[currentSemesters[currentSemesterIndex]._id] || 0} assigned
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="blue"
                                                        variant="outline"
                                                        onClick={() => setIsAddModuleModalOpen(true)}
                                                        leftIcon={<Icon as={FiBookOpen} />}
                                                    >
                                                        Add Module
                                                    </Button>
                                                </HStack>
                                            </HStack>

                                            {moduleCounts[currentSemesters[currentSemesterIndex]._id] > 0 && (
                                                <Box p={3} bg="blue.50" borderRadius="md">
                                                    <Text fontSize="xs" color="blue.700" fontWeight="medium">
                                                        This semester has {moduleCounts[currentSemesters[currentSemesterIndex]._id]} module(s) assigned
                                                    </Text>
                                                </Box>
                                            )}

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
                                    <Box py={2} px={3} mt={3} bg="gray.50" borderRadius="md">
                                        <VStack align="start">
                                            <Text fontWeight="medium">
                                                {selectedIntakeCourse?.courseId?.courseName || 'Unknown Course'}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                Code: {selectedIntakeCourse?.courseId?.courseCode || 'N/A'}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                Level: {selectedIntakeCourse?.courseId?.courseLevel || 'N/A'}
                                            </Text>
                                        </VStack>
                                    </Box>
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
                                        moduleCounts={moduleCounts}
                                    />
                                </Box>
                        </VStack>
                    </Box>
                </Flex>
            </Box>

            {/* Add Module Modal */}
            <AddModuleModal
                isOpen={isAddModuleModalOpen}
                onClose={() => setIsAddModuleModalOpen(false)}
                semester={currentSemesters[currentSemesterIndex]}
                courseId={selectedIntakeCourse?.courseId?._id}
                intakeCourseId={selectedIntakeCourse?._id}
                onModuleAdded={handleModuleAdded}
            />
        </Box>
    );
};

export default SemesterDetailsModal;