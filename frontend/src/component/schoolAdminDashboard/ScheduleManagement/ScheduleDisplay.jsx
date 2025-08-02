import {
    Box,
    Card,
    CardBody,
    VStack,
    HStack,
    Text,
    Badge,
    Icon,
    useColorModeValue,
    useBreakpointValue,
} from "@chakra-ui/react"
import React from "react"
import { FiClock, FiMapPin, FiUser } from "react-icons/fi"
import { ClusteredScheduleGrid, TimetableListView } from "./ClassScheduleCard.jsx"

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function ScheduleDisplay({
    viewMode,
    showExams,
    showClasses,
    scheduleData,
    filter,
    getTypeColor,
    onEditClick,
    classSchedules,
    examSchedules,
    bgColor,
    borderColor,
    gridBg,
}) {
    const isMobile = useBreakpointValue({ base: true, md: false })

    return (
        <>
            {viewMode === "weekly" ? (
                // Weekly View
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody p={0}>
                        {isMobile ? (
                            // Mobile Weekly View - Stacked Cards
                            <VStack spacing={4} p={4}>
                                {daysOfWeek.map((day) => {
                                    // Updated to use filtered data based on real schedule
                                    const dayItems = classSchedules?.filter((item) => item.dayOfWeek === day).map((item) => ({
                                        id: item._id,
                                        code: item.moduleId?.code ?? 'N/A',
                                        subject: item.moduleId?.moduleName ?? 'Unknown',
                                        room: item.roomId,
                                        lecturer: item.lecturerId?.userId?.name ?? 'Unassigned',
                                        startTime: item.startTime,
                                        endTime: item.endTime,
                                        type: "class",
                                        examType: "",
                                    })) || []

                                    return (
                                        // Mobile View
                                        <Card key={day} w="full" borderWidth="1px">
                                            <CardBody>
                                                <Text fontWeight="bold" mb={3} color="blue.600">
                                                    {day}
                                                </Text>
                                                {dayItems.length > 0 ? (
                                                    <VStack spacing={2} align="stretch">
                                                        {dayItems.map((item) => (
                                                            <Box
                                                                key={item.id}
                                                                p={3}
                                                                bg={`${getTypeColor(item.type, item.examType)}.50`}
                                                                borderLeft="4px solid"
                                                                borderLeftColor={`${getTypeColor(item.type, item.examType)}.400`}
                                                                borderRadius="md"
                                                                onClick={() => onEditClick(item)}
                                                                cursor="pointer"
                                                                _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
                                                                transition="all 0.2s"
                                                            >
                                                                <HStack justify="space-between" mb={1}>
                                                                    <Text fontWeight="bold" fontSize="sm">
                                                                        {item.code}
                                                                    </Text>
                                                                    <Badge colorScheme={getTypeColor(item.type, item.examType)} size="sm">
                                                                        {item.type === "exam" ? item.examType : "Class"}
                                                                    </Badge>
                                                                </HStack>
                                                                <Text fontSize="sm" mb={1}>
                                                                    {item.subject}
                                                                </Text>
                                                                <HStack fontSize="xs" color="gray.600" spacing={3}>
                                                                    <HStack>
                                                                        <Icon as={FiClock} />
                                                                        <Text>
                                                                            {item.startTime} - {item.endTime}
                                                                        </Text>
                                                                    </HStack>
                                                                    <HStack>
                                                                        <Icon as={FiMapPin} />
                                                                        <Text>
                                                                            {typeof item.room === 'object' && item.room
                                                                                ? `${item.room.block} ${item.room.roomNumber}`
                                                                                : item.room || 'TBD'
                                                                            }
                                                                        </Text>
                                                                    </HStack>
                                                                </HStack>
                                                                {item.lecturer && (
                                                                    <HStack fontSize="xs" color="gray.600" mt={1}>
                                                                        <Icon as={FiUser} />
                                                                        <Text>{item.lecturer}</Text>
                                                                    </HStack>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                ) : (
                                                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                                        No schedule
                                                    </Text>
                                                )}
                                            </CardBody>
                                        </Card>
                                    )
                                })}
                            </VStack>
                        ) : (
                            // Desktop Weekly View - Grid
                            <ClusteredScheduleGrid
                                daysOfWeek={daysOfWeek}
                                timeSlots={timeSlots}
                                gridBg={gridBg}
                                showExams={showExams}
                                showClasses={showClasses}
                                getTypeColor={getTypeColor}
                                allItems={scheduleData} // Pass combined data
                                filter={filter}
                                onEditClick={onEditClick}
                            />
                        )}
                    </CardBody>
                </Card>
            ) : (
                <TimetableListView
                    classSchedules={classSchedules}
                    examSchedules={examSchedules}
                    daysOfWeek={daysOfWeek}
                    bgColor={bgColor}
                    borderColor={borderColor}
                    showExams={showExams}
                    showClasses={showClasses}
                    filter={filter}
                    getTypeColor={getTypeColor}
                    onEditClick={onEditClick}
                />
            )}
        </>
    )
} 