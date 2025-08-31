import React, { useState, useMemo } from 'react';
import {
    Box,
    Text,
    Collapse,
    VStack,
    HStack,
    Badge,
    Grid,
    Card,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Icon,
    Tooltip,
    Divider,
    Flex,
    Spacer
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, TimeIcon, CalendarIcon } from '@chakra-ui/icons';
import { MapPin, BookOpen, AlertCircle, User, Clock, Calendar } from 'lucide-react';
import { FaUsers } from "react-icons/fa";
import { useDisclosure } from '@chakra-ui/react';

// Shared helper functions
const transformExamData = (examData) => {
    return examData
        .map(exam => {
            if (typeof exam !== 'object' || !exam) {
                return null;
            }

            try {
                // Use the existing dayOfWeek if available, otherwise calculate from examDate
                let dayOfWeek = exam.dayOfWeek;
                let startTime = exam.startTime;
                let endTime = exam.endTime;

                // If dayOfWeek is not available, calculate from examDate
                if (!dayOfWeek && exam.examDate) {
                    const examDate = new Date(exam.examDate);
                    dayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'long' });
                }

                // If startTime is not available, use examTime
                if (!startTime && exam.examTime) {
                    startTime = exam.examTime;
                }

                // If endTime is not available, calculate from startTime and duration
                if (!endTime && startTime && exam.durationMinute) {
                    const [hours, minutes] = startTime.split(':').map(Number);
                    const startDate = new Date();
                    startDate.setHours(hours, minutes, 0, 0);
                    const endDate = new Date(startDate.getTime() + (exam.durationMinute * 60000));
                    endTime = endDate.toTimeString().slice(0, 5);
                }

                const transformedExam = {
                    id: exam._id,
                    code: exam.code || (exam.semesterModuleId?.moduleId?.code ?? 'N/A'),
                    subject: exam.subject || (exam.semesterModuleId?.moduleId?.moduleName ?? 'Unknown'),
                    room: exam.room || exam.roomId,
                    building: exam.building || (exam.roomId?.block ?? 'TBD'),
                    lecturer: exam.lecturer || (exam.invigilators?.length > 0
                        ? `${exam.invigilators.length} Invigilator(s)`
                        : 'No Invigilator'),
                    startTime: startTime,
                    endTime: endTime,
                    date: exam.date || (exam.examDate ? new Date(exam.examDate).toLocaleDateString() : ''),
                    dayOfWeek: dayOfWeek,
                    type: "exam",
                    examType: "Final",
                    duration: `${exam.durationMinute} min`,
                    examDate: exam.examDate,
                    invigilators: exam.invigilators,
                    durationMinute: exam.durationMinute,
                    intakeCourseId: exam.intakeCourseId,
                    courseId: exam.courseId || (exam.intakeCourseId?.courseId?._id),
                    moduleId: exam.semesterModuleId?.moduleId?._id,
                    year: exam.semesterModuleId?.semesterId?.year,
                    semesterId: exam.semesterModuleId?.semesterId?._id
                };

                return transformedExam;
            } catch (e) {
                console.error('Error transforming exam data:', e, exam);
                return null;
            }
        })
        .filter(Boolean);
};

const transformClassData = (classData) => {
    return classData
        .map(classItem => {
            if (typeof classItem !== 'object' || !classItem || !classItem.startTime) {
                return null;
            }

            try {
                const transformedClass = {
                    id: classItem._id,
                    code: classItem.semesterModuleId?.moduleId?.code ?? 'N/A',
                    subject: classItem.semesterModuleId?.moduleId?.moduleName ?? 'Unknown',
                    room: classItem.roomId,
                    building: classItem.roomId?.block ?? 'TBD',
                    lecturer: classItem.lecturerId?.userId?.name ?? 'Unassigned',
                    startTime: classItem.startTime,
                    endTime: classItem.endTime,
                    date: new Date().toLocaleDateString(),
                    dayOfWeek: classItem.dayOfWeek,
                    type: "class",
                    examType: "",
                    intakeCourseId: classItem.intakeCourseId,
                    courseId: classItem.intakeCourseId?.courseId?._id || classItem.courseId,
                    moduleId: classItem.semesterModuleId?.moduleId?._id, // Get moduleId from semesterModule
                    lecturerId: classItem.lecturerId,
                    year: classItem.semesterModuleId?.semesterId?.year,
                    semesterId: classItem.semesterModuleId?.semesterId, // Get semesterId from semesterModule
                    schoolId: classItem.schoolId,
                    moduleEndDate: classItem.moduleEndDate,
                    moduleStartDate: classItem.moduleStartDate,
                    semesterModuleId: classItem.semesterModuleId,
                };

                return transformedClass;
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);
};

// Shared function to combine and filter data
const getCombinedAndFilteredData = (
    classSchedules = [],
    examSchedules = [],
    showClasses,
    showExams,
    filter
) => {
    let allItems = [];

    // Always include both class and exam schedules
    if (classSchedules) {
        allItems = [...allItems, ...transformClassData(classSchedules)];
    }

    if (examSchedules) {
        allItems = [...allItems, ...transformExamData(examSchedules)];
    }

    // Defensive: filter out nulls
    allItems = allItems.filter(Boolean);

    // Apply filters
    const filteredItems = allItems.filter(item => {

        // Check if required filters are selected
        if (!filter.selectedCourse || !filter.selectedIntake || !filter.selectedYear || !filter.selectedSemester) {
            return false;
        }

        // Include all items regardless of type
        let include = true;

        // Filter by intake (deep path check)
        if (
            filter?.selectedIntake &&
            item.intakeCourseId?.intakeId?._id !== filter.selectedIntake
        ) {
            return false;
        }

        // Filter by course (assuming courseId is under intakeCourseId.courseId._id)
        if (
            filter?.selectedCourse &&
            item.intakeCourseId?.courseId?._id !== filter.selectedCourse
        ) {
            return false;
        }

        // Filter by module
        if (
            filter?.selectedModule &&
            item.moduleId?._id !== filter.selectedModule
        ) {
            return false;
        }

        // Filter by year 
        if (
            filter?.selectedYear &&
            item.semesterId?.year !== parseInt(filter.selectedYear)
        ) {
            return false;
        }

        // Filter by semester
        if (
            filter?.selectedSemester &&
            item.semesterId?.semesterNumber !== filter.selectedSemester.semesterNumber
        ) {
            return false;
        }

        return include;
    });
    return filteredItems;
};

// Component for rendering individual class item
export const ClassItem = ({ item, getTypeColor, rowSpan = 1, onEditClick }) => {
    const colors = getTypeColor(item.type);
    const isExam = item.type === 'exam';

    return (
        <Box
            bg={colors.bg}
            borderLeft="3px solid"
            borderLeftColor={colors.border}
            p={2}
            borderRadius="sm"
            mb={1}
            minH={rowSpan > 1 ? `${rowSpan * 60}px` : "auto"}
            position="relative"
            _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
            transition="all 0.2s"
            onClick={() => onEditClick(item)}
            cursor="pointer"
        >
            <VStack align="start" spacing={1}>
                {/* Type Badge */}
                <HStack justify="space-between" width="100%">
                    <Badge
                        colorScheme={isExam ? 'red' : 'blue'}
                        size="sm"
                        variant="solid"
                    >
                        {isExam ? 'EXAM' : 'CLASS'}
                    </Badge>
                    {isExam && (
                        <Badge colorScheme="orange" size="xs">
                            {item.durationMinute}min
                        </Badge>
                    )}
                </HStack>

                {/* Module Code and Name */}
                <VStack align="start" spacing={0}>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={colors.text}
                        lineHeight="1.2"
                    >
                        {item.code}
                    </Text>
                    <Text
                        fontSize="xs"
                        color={colors.text}
                        opacity={0.8}
                        lineHeight="1.2"
                    >
                        {item.subject}
                    </Text>
                </VStack>

                {/* Time */}
                <HStack spacing={1}>
                    <TimeIcon color={colors.border} />
                    <Text fontSize="xs" color={colors.text}>
                        {item.startTime} - {item.endTime}
                    </Text>
                </HStack>

                {/* Exam Date (only for exams) */}
                {isExam && item.examDate && (
                    <HStack spacing={1}>
                        <CalendarIcon color={colors.text} />
                        <Text fontSize="xs" color={colors.text}>
                            {new Date(item.examDate).toLocaleDateString()}
                        </Text>
                    </HStack>
                )}

                {/* Lecturer/Invigilator */}
                <HStack spacing={1}>
                    <FaUsers />
                    <Text fontSize="xs" color={colors.text} noOfLines={1}>
                        {isExam
                            ? (item.invigilators?.length > 0 ? `${item.invigilators.length} Invigilator(s)` : 'No Invigilator')
                            : (item.lecturer?.userId?.name || 'No Lecturer')
                        }
                    </Text>
                </HStack>

                {/* Room */}
                {item.room && (
                    <HStack spacing={1}>
                        <MapPin color={colors.border} />
                        <Text fontSize="xs" color={colors.text} noOfLines={1}>
                            {typeof item.room === 'object'
                                ? `${item.room.block} ${item.room.roomNumber}`
                                : item.room
                            }
                        </Text>
                    </HStack>
                )}
            </VStack>

            {/* Exam indicator line */}
            {isExam && (
                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    width="4px"
                    height="100%"
                    bg="red.400"
                    borderRadius="0 sm sm 0"
                />
            )}
        </Box>
    );
};

// Helper function to find consecutive classes
const findConsecutiveClasses = (items, timeSlots) => {
    const consecutiveGroups = new Map();

    items.forEach(item => {
        const timeIndex = timeSlots.indexOf(item.time);
        if (timeIndex === -1) return;

        const key = `${item.day}-${item.code}-${item.subject}`;

        if (!consecutiveGroups.has(key)) {
            consecutiveGroups.set(key, {
                item,
                startIndex: timeIndex,
                endIndex: timeIndex,
                timeSlots: [item.time]
            });
        } else {
            const group = consecutiveGroups.get(key);
            if (timeIndex === group.endIndex + 1) {
                group.endIndex = timeIndex;
                group.timeSlots.push(item.time);
            }
        }
    });

    return consecutiveGroups;
};

// Enhanced table row component for list view
const EnhancedTableRow = ({ item, getTypeColor, onEditClick }) => {
    const isExam = item.type === "exam";

    return (
        <Tr
            _hover={{ bg: isExam ? "red.50" : "blue.50" }}
            borderLeft={`4px solid`}
            borderLeftColor={isExam ? "red.400" : "blue.400"}
            onClick={() => onEditClick(item)}
            cursor="pointer"
        >
            <Td>
                <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                        <Icon as={Clock} boxSize={4} color={isExam ? "red.500" : "blue.500"} />
                        <Text fontWeight="medium" fontSize="sm">
                            {item.startTime} - {item.endTime}
                        </Text>
                    </HStack>
                    <HStack spacing={2}>
                        <Icon as={Calendar} boxSize={3} color="gray.400" />
                        <Text fontSize="xs" color="gray.500">
                            {item.date}
                        </Text>
                    </HStack>
                    {isExam && (
                        <HStack spacing={2}>
                            <Icon as={AlertCircle} boxSize={3} color="orange.400" />
                            <Text fontSize="xs" color="orange.600" fontWeight="medium">
                                {item.duration}
                            </Text>
                        </HStack>
                    )}
                </VStack>
            </Td>

            <Td>
                <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                        <Icon as={BookOpen} boxSize={4} color={isExam ? "red.500" : "blue.500"} />
                        <Text fontWeight="bold" fontSize="sm">{item.code}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {item.subject}
                    </Text>
                </VStack>
            </Td>

            <Td>
                <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                        <Icon as={MapPin} boxSize={4} color="gray.500" />
                        <Text fontWeight="medium" fontSize="sm">
                            {typeof item.room === 'object' && item.room
                                ? `${item.room.block} ${item.room.roomNumber}`
                                : item.room || 'TBD'
                            }
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                        {typeof item.room === 'object' && item.room
                            ? item.room.block
                            : item.building || 'TBD'
                        }
                    </Text>
                </VStack>
            </Td>

            <Td>
                <VStack align="start" spacing={1}>
                    <Badge
                        colorScheme={isExam ? "red" : "blue"}
                        variant="solid"
                        size="sm"
                    >
                        {item.type === "exam" ? `${item.examType} Exam` : "Class"}
                    </Badge>
                    {isExam && (
                        <Badge colorScheme="orange" variant="outline" size="xs">
                            {item.durationMinute}min
                        </Badge>
                    )}
                </VStack>
            </Td>

            <Td>
                <HStack spacing={2}>
                    <Icon as={User} boxSize={4} color="gray.500" />
                    <Tooltip label={item.lecturer} placement="top">
                        <Text fontSize="sm" noOfLines={2}>
                            {item.lecturer || "N/A"}
                        </Text>
                    </Tooltip>
                </HStack>
            </Td>
        </Tr>
    );
};

// Statistics component for list view
const DayStatistics = ({ dayItems }) => {
    const classCount = dayItems.filter(item => item.type === 'class').length;
    const examCount = dayItems.filter(item => item.type === 'exam').length;

    return (
        <HStack spacing={4} mb={3}>
            <Badge colorScheme="blue" variant="outline">
                {classCount} Class{classCount !== 1 ? 'es' : ''}
            </Badge>
            {examCount > 0 && (
                <Badge colorScheme="red" variant="outline">
                    {examCount} Exam{examCount !== 1 ? 's' : ''}
                </Badge>
            )}
            <Spacer />
            <Text fontSize="xs" color="gray.500">
                Total: {dayItems.length} item{dayItems.length !== 1 ? 's' : ''}
            </Text>
        </HStack>
    );
};

// Timetable List View Component
export const TimetableListView = ({
    classSchedules = [],
    examSchedules = [],
    daysOfWeek,
    bgColor,
    borderColor,
    showExams = true,
    showClasses = true,
    filter,
    getTypeColor,
    onEditClick
}) => {
    // Combine and filter data using shared function
    const combinedData = useMemo(() => {
        return getCombinedAndFilteredData(classSchedules, examSchedules, showClasses, showExams, filter);
    }, [classSchedules, examSchedules, showClasses, showExams, filter]);

    // Group data by day
    const groupedByDay = useMemo(() => {
        return daysOfWeek.reduce((acc, day) => {
            const dayItems = combinedData
                .filter(item => item.dayOfWeek === day)
                .sort((a, b) => {
                    // Sort by start time
                    const timeA = a.startTime.split(':').map(Number);
                    const timeB = b.startTime.split(':').map(Number);
                    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                });

            if (dayItems.length > 0) {
                acc[day] = dayItems;
            }
            return acc;
        }, {});
    }, [combinedData, daysOfWeek]);

    if (Object.keys(groupedByDay).length === 0) {
        return (
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                    <VStack spacing={4} py={8}>
                        <Icon as={Calendar} boxSize={12} color="gray.300" />
                        <Text color="gray.500" textAlign="center">
                            No schedule items found for the selected filters.
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            {Object.entries(groupedByDay).map(([day, dayItems]) => (
                <Card key={day} bg={bgColor} borderColor={borderColor} borderWidth="1px" shadow="sm">
                    <CardBody>
                        <Flex align="center" mb={4}>
                            <Text fontSize="xl" fontWeight="bold" color="blue.600">
                                {day}
                            </Text>
                            <Spacer />
                            <DayStatistics dayItems={dayItems} />
                        </Flex>

                        <Divider mb={4} />

                        <TableContainer>
                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr bg="gray.50">
                                        <Th>
                                            <HStack spacing={2}>
                                                <Icon as={Clock} boxSize={4} />
                                                <Text>Time & Duration</Text>
                                            </HStack>
                                        </Th>
                                        <Th>
                                            <HStack spacing={2}>
                                                <Icon as={BookOpen} boxSize={4} />
                                                <Text>Subject</Text>
                                            </HStack>
                                        </Th>
                                        <Th>
                                            <HStack spacing={2}>
                                                <Icon as={MapPin} boxSize={4} />
                                                <Text>Location</Text>
                                            </HStack>
                                        </Th>
                                        <Th>Type</Th>
                                        <Th>
                                            <HStack spacing={2}>
                                                <Icon as={User} boxSize={4} />
                                                <Text>Staff</Text>
                                            </HStack>
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {dayItems.map((item) => (
                                        <EnhancedTableRow
                                            key={item.id}
                                            item={item}
                                            getTypeColor={getTypeColor}
                                            onEditClick={onEditClick}
                                        />
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </CardBody>
                </Card>
            ))}
        </VStack>
    );
};

// Main clustered schedule grid component
export const ClusteredScheduleGrid = ({
    daysOfWeek,
    timeSlots,
    gridBg,
    getTypeColor,
    allItems = [],
    filter,
    showExams = true,
    showClasses = true,
    onEditClick
}) => {
    // Updated getItemsForSlot function
    const getItemsForSlot = (day, time) => {
        const items = allItems.filter(item => {
            // Check if required filters are selected
            if (!filter.selectedCourse || !filter.selectedIntake || !filter.selectedYear || !filter.selectedSemester) {
                return false;
            }

            const itemDay = item.dayOfWeek;
            const itemStartTime = item.startTime;

            // Check if item matches time slot
            const isTimeMatch = itemDay === day && itemStartTime === time;
            if (!isTimeMatch) return false;

            // Include all items regardless of type
            let include = true;

            // Filter by intake (deep path check)
            if (
                filter?.selectedIntake &&
                item.intakeCourseId?.intakeId?._id !== filter.selectedIntake
            ) return false;

            // Filter by course (assuming courseId is under intakeCourseId.courseId._id)
            if (
                filter?.selectedCourse &&
                item.intakeCourseId?.courseId?._id !== filter.selectedCourse
            ) return false;

            // Filter by year - use transformed data structure
            if (
                filter?.selectedYear &&
                item.semesterModuleId?.semesterId?.year != filter.selectedYear
            ) return false;

            // Filter by semester - use transformed data structure
            if (
                filter?.selectedSemester &&
                item.semesterModuleId?.semesterId?.semesterNumber != filter.selectedSemester.semesterNumber
            ) return false;

            // Filter by module - use transformed data structure
            if (
                filter?.selectedModule &&
                item.semesterModuleId.moduleId?._id != filter.selectedModule
            ) return false;

            return include;
        });


        return {
            items,
            count: items.length,
            shouldCluster: items.length > 1
        };
    };

    // State to track expanded clusters
    const [expandedClusters, setExpandedClusters] = useState(new Set());

    // Helper function to toggle cluster expansion
    const toggleCluster = (day, time) => {
        const clusterId = `${day}-${time}`;
        const newExpanded = new Set(expandedClusters);

        if (newExpanded.has(clusterId)) {
            newExpanded.delete(clusterId);
        } else {
            newExpanded.add(clusterId);
        }

        setExpandedClusters(newExpanded);
    };

    // Find consecutive classes for merging
    const consecutiveGroups = findConsecutiveClasses(allItems, timeSlots);
    const mergedSlots = new Set(); // Track which slots are part of merged cells

    // Enhanced ClusteredClasses component
    const ClusteredClasses = ({ day, time, slotData }) => {
        const clusterId = `${day}-${time}`;
        const isExpanded = expandedClusters.has(clusterId);
        const { items, count, shouldCluster } = slotData;

        if (count === 0) return null;

        if (mergedSlots.has(`${day}-${time}`)) {
            return null;
        }

        if (!shouldCluster) {
            const item = items[0];
            const groupKey = `${day}-${item.code}-${item.subject}`;
            const group = consecutiveGroups.get(groupKey);

            if (group && group.timeSlots.length > 1 && group.timeSlots[0] === time) {
                const rowSpan = group.timeSlots.length;

                for (let i = 1; i < group.timeSlots.length; i++) {
                    mergedSlots.add(`${day}-${group.timeSlots[i]}`);
                }

                return (
                    <ClassItem
                        item={item}
                        getTypeColor={getTypeColor}
                        rowSpan={rowSpan}
                        onEditClick={onEditClick}
                    />
                );
            } else if (group && group.timeSlots[0] !== time) {
                return null;
            }

            return <ClassItem item={item} getTypeColor={getTypeColor} onEditClick={onEditClick} />;
        }

        // Group items by type for better clustering display
        const examItems = items.filter(item => item.type === 'exam');
        const classItems = items.filter(item => item.type === 'class');

        return (
            <Box>
                <Box
                    bg="blue.50"
                    borderLeft="3px solid"
                    borderLeftColor="blue.400"
                    p={2}
                    borderRadius="sm"
                    mb={1}
                    cursor="pointer"
                    onClick={() => toggleCluster(day, time)}
                    _hover={{ bg: "blue.100" }}
                    transition="background-color 0.2s"
                >
                    <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.600" whiteSpace="nowrap" mb={3}>
                                Click to {isExpanded ? 'collapse' : 'expand'}
                            </Text>
                            <VStack spacing={2}>
                                <Badge colorScheme="blue" size="sm">
                                    {count} Total
                                </Badge>
                                {examItems.length > 0 && (
                                    <Badge colorScheme="red" size="sm">
                                        {examItems.length} Exam{examItems.length > 1 ? 's' : ''}
                                    </Badge>
                                )}
                                {classItems.length > 0 && (
                                    <Badge colorScheme="green" size="sm">
                                        {classItems.length} Class{classItems.length > 1 ? 'es' : ''}
                                    </Badge>
                                )}
                            </VStack>
                        </VStack>
                        {isExpanded ? (
                            <ChevronUpIcon boxSize={4} color="blue.500" />
                        ) : (
                            <ChevronDownIcon boxSize={4} color="blue.500" />
                        )}
                    </HStack>
                </Box>

                <Collapse in={isExpanded} animateOpacity>
                    <VStack spacing={1} align="stretch" pl={2}>
                        {/* Show exams first, then classes */}
                        {examItems.map((item) => (
                            <ClassItem
                                key={item.id}
                                item={item}
                                getTypeColor={getTypeColor}
                                onEditClick={onEditClick}
                            />
                        ))}
                        {classItems.map((item) => (
                            <ClassItem
                                key={item.id}
                                item={item}
                                getTypeColor={getTypeColor}
                                onEditClick={onEditClick}
                            />
                        ))}
                    </VStack>
                </Collapse>
            </Box>
        );
    };

    return (
        <Box overflowX="auto">
            <Grid templateColumns="80px repeat(7, 1fr)" gap={1} minW="800px">
                <Box />
                {daysOfWeek.map((day) => (
                    <Box
                        key={day}
                        p={3}
                        bg="blue.500"
                        color="white"
                        textAlign="center"
                        fontWeight="bold"
                        fontSize="sm"
                    >
                        {day}
                    </Box>
                ))}

                {timeSlots.map((time) => (
                    <React.Fragment key={time}>
                        <Box
                            p={2}
                            bg="gray.100"
                            textAlign="center"
                            fontSize="sm"
                            fontWeight="medium"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {time}
                        </Box>
                        {daysOfWeek.map((day) => {
                            let slotData = getItemsForSlot(day, time);

                            if (mergedSlots.has(`${day}-${time}`)) {
                                return null;
                            }

                            return (
                                <Box
                                    key={`${day}-${time}`}
                                    minH="60px"
                                    bg={gridBg}
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    p={1}
                                >
                                    <ClusteredClasses
                                        day={day}
                                        time={time}
                                        slotData={slotData}
                                    />
                                </Box>
                            );
                        })}
                    </React.Fragment>
                ))}
            </Grid>
        </Box>
    );
};