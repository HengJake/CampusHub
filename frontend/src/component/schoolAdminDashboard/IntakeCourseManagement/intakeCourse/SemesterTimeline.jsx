import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Badge,
    Icon,
    Flex,
} from '@chakra-ui/react';
import { FiCalendar, FiBook, FiClock } from 'react-icons/fi';

export function SemesterTimeline({ semesters, currentSemesterIndex, onSemesterClick }) {
    // Sort semesters by start date
    const sortedSemesters = [...semesters].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateA - dateB;
    });

    // Create a mapping from sorted index to original index
    const indexMapping = sortedSemesters.map((sortedSemester, sortedIndex) => {
        const originalIndex = semesters.findIndex(semester => semester._id === sortedSemester._id);
        return { sortedIndex, originalIndex };
    });

    // Find the current semester's position in the sorted array
    const currentSemesterInSorted = sortedSemesters.findIndex(semester =>
        semester._id === semesters[currentSemesterIndex]?._id
    );

    const timelineColors = [
        'green.400',
        'blue.400',
        'purple.400',
        'orange.400',
        'red.400',
        'teal.400',
        'pink.400',
        'cyan.400'
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const months = Math.round(days / 30);
        return `${days} days (~${months} months)`;
    };

    return (
        <Box position="relative" w="full" maxH="600px">
            {/* Timeline Container */}
            <VStack spacing={0} align="stretch" position="relative">
                {/* Vertical Timeline Line */}
                <Box
                    position="absolute"
                    left="50%"
                    top="0"
                    bottom="0"
                    width="2px"
                    bg="gray.200"
                    transform="translateX(-50%)"
                    zIndex={1}
                />

                {sortedSemesters.map((semester, sortedIndex) => {
                    const mapping = indexMapping[sortedIndex];
                    const isCurrent = sortedIndex === currentSemesterInSorted;
                    const color = timelineColors[sortedIndex % timelineColors.length];

                    return (
                        <Box
                            key={semester._id}
                            position="relative"
                            py={4}
                            cursor="pointer"
                            onClick={() => onSemesterClick(mapping.originalIndex)}
                            _hover={{ bg: 'blue.50' }}
                            transition="all 0.2s"
                        >
                            {/* Timeline Node */}
                            <Box
                                position="absolute"
                                left="50%"
                                top="50%"
                                width="12px"
                                height="12px"
                                borderRadius="50%"
                                bg={isCurrent ? color : 'blue.300'}
                                border="3px solid white"
                                boxShadow="0 0 0 2px gray.200"
                                transform="translate(-50%, -50%)"
                                zIndex={3}
                            />

                            {/* Content Container */}
                            <Flex justify="space-between" align="center" px={4}>
                                {/* Left Side - Semester Info */}
                                <Box
                                    flex="1"
                                    mr={8}
                                    bg="white"
                                    p={4}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                    border={isCurrent ? `2px solid ${color}` : '1px solid gray.200'}
                                    position="relative"
                                    zIndex={2}
                                >
                                    <VStack align="start" spacing={2}>
                                        <HStack spacing={2}>
                                            <Icon as={FiBook} color={color} />
                                            <Text fontWeight="bold" fontSize="md">
                                                {semester.semesterName || `Semester ${semester.semesterNumber}`}
                                            </Text>
                                            {isCurrent && (
                                                <Badge colorScheme="blue" size="sm">
                                                    Selected
                                                </Badge>
                                            )}
                                        </HStack>

                                        <VStack align="start" spacing={1}>
                                            <HStack spacing={2}>
                                                <Icon as={FiCalendar} boxSize={4} color="gray.500" />
                                                <Text fontSize="sm" color="gray.600">
                                                    {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                                                </Text>
                                            </HStack>

                                            <HStack spacing={2}>
                                                <Icon as={FiClock} boxSize={4} color="gray.500" />
                                                <Text fontSize="sm" color="gray.600">
                                                    Duration: {calculateDuration(semester.startDate, semester.endDate)}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </VStack>
                                </Box>

                                {/* Right Side - Year Badge */}
                                <Box
                                    position="relative"
                                    zIndex={2}
                                >
                                    <Box
                                        bg={color}
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="sm"
                                        fontWeight="bold"
                                        transform="rotate(90deg)"
                                        whiteSpace="nowrap"
                                    >
                                        {semester.startDate ? new Date(semester.startDate).getFullYear() : 'N/A'}
                                    </Box>
                                </Box>
                            </Flex>

                            {/* Connecting Line */}
                            <Box
                                position="absolute"
                                left="50%"
                                top="50%"
                                width="8px"
                                height="1px"
                                bg="gray.300"
                                transform="translateX(-50%)"
                                zIndex={2}
                            />
                        </Box>
                    );
                })}
            </VStack>
        </Box>
    );
} 