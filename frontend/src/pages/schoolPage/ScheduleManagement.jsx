"use client"

import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Button,
  ButtonGroup,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useBreakpointValue,
  Stack,
  SimpleGrid,
} from "@chakra-ui/react"
import { FiCalendar, FiClock, FiMapPin, FiUser, FiBook, FiAlertCircle, FiFilter } from "react-icons/fi"
import { useState } from "react"

// Mock data for schedules
const mockScheduleData = {
  semesters: ["Fall 2024", "Spring 2024", "Summer 2024"],
  weeks: [
    "Week 1 (Jan 15-21)",
    "Week 2 (Jan 22-28)",
    "Week 3 (Jan 29-Feb 4)",
    "Week 4 (Feb 5-11)",
    "Week 5 (Feb 12-18)",
  ],
  groups: ["Group A", "Group B", "Group C", "All Groups"],

  classes: [
    {
      id: "CL001",
      subject: "Data Structures & Algorithms",
      code: "CS301",
      type: "class",
      day: "Monday",
      date: "2024-01-15",
      startTime: "09:00",
      endTime: "11:00",
      room: "Room 101",
      building: "Computer Science Block",
      lecturer: "Dr. Sarah Johnson",
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 1 (Jan 15-21)",
    },
    {
      id: "CL002",
      subject: "Database Management Systems",
      code: "CS302",
      type: "class",
      day: "Monday",
      date: "2024-01-15",
      startTime: "14:00",
      endTime: "16:00",
      room: "Lab 201",
      building: "Computer Science Block",
      lecturer: "Prof. Michael Chen",
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 1 (Jan 15-21)",
    },
    {
      id: "CL003",
      subject: "Software Engineering",
      code: "CS303",
      type: "class",
      day: "Tuesday",
      date: "2024-01-16",
      startTime: "10:00",
      endTime: "12:00",
      room: "Room 205",
      building: "Computer Science Block",
      lecturer: "Dr. Emily Davis",
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 1 (Jan 15-21)",
    },
    {
      id: "CL004",
      subject: "Computer Networks",
      code: "CS304",
      type: "class",
      day: "Wednesday",
      date: "2024-01-17",
      startTime: "09:00",
      endTime: "11:00",
      room: "Room 301",
      building: "Computer Science Block",
      lecturer: "Dr. Robert Wilson",
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 1 (Jan 15-21)",
    },
    {
      id: "CL005",
      subject: "Linear Algebra",
      code: "MATH301",
      type: "class",
      day: "Thursday",
      date: "2024-01-18",
      startTime: "11:00",
      endTime: "13:00",
      room: "Room 401",
      building: "Mathematics Block",
      lecturer: "Prof. Lisa Anderson",
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 1 (Jan 15-21)",
    },
    {
      id: "CL006",
      subject: "Data Structures & Algorithms",
      code: "CS301",
      type: "class",
      day: "Friday",
      date: "2024-01-19",
      startTime: "14:00",
      endTime: "16:00",
      room: "Lab 101",
      building: "Computer Science Block",
      lecturer: "Dr. Sarah Johnson",
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 1 (Jan 15-21)",
    },
  ],

  exams: [
    {
      id: "EX001",
      subject: "Data Structures & Algorithms",
      code: "CS301",
      type: "exam",
      examType: "Midterm",
      day: "Monday",
      date: "2024-02-15",
      startTime: "09:00",
      endTime: "12:00",
      room: "Exam Hall A",
      building: "Main Academic Block",
      duration: "3 hours",
      totalMarks: 100,
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 5 (Feb 12-18)",
    },
    {
      id: "EX002",
      subject: "Database Management Systems",
      code: "CS302",
      type: "exam",
      examType: "Final",
      day: "Wednesday",
      date: "2024-02-18",
      startTime: "14:00",
      endTime: "17:00",
      room: "Exam Hall B",
      building: "Main Academic Block",
      duration: "3 hours",
      totalMarks: 100,
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 5 (Feb 12-18)",
    },
    {
      id: "EX003",
      subject: "Software Engineering",
      code: "CS303",
      type: "exam",
      examType: "Final",
      day: "Friday",
      date: "2024-02-20",
      startTime: "10:00",
      endTime: "13:00",
      room: "Exam Hall C",
      building: "Main Academic Block",
      duration: "3 hours",
      totalMarks: 100,
      group: "Group A",
      semester: "Fall 2024",
      week: "Week 5 (Feb 12-18)",
    },
  ],
}

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function ScheduleManagement() {
  const [selectedSemester, setSelectedSemester] = useState("Fall 2024")
  const [selectedWeek, setSelectedWeek] = useState("Week 1 (Jan 15-21)")
  const [selectedGroup, setSelectedGroup] = useState("Group A")
  const [viewMode, setViewMode] = useState("weekly") // weekly or list
  const [activeTab, setActiveTab] = useState(0) // 0 for classes, 1 for exams

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const gridBg = useColorModeValue("gray.50", "gray.700")

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })
  const cardDirection = useBreakpointValue({ base: "column", lg: "row" })

  // Filter data based on selected filters
  const filteredClasses = mockScheduleData.classes.filter(
    (item) =>
      item.semester === selectedSemester &&
      item.week === selectedWeek &&
      (selectedGroup === "All Groups" || item.group === selectedGroup),
  )

  const filteredExams = mockScheduleData.exams.filter(
    (item) =>
      item.semester === selectedSemester &&
      item.week === selectedWeek &&
      (selectedGroup === "All Groups" || item.group === selectedGroup),
  )

  const currentData = activeTab === 0 ? filteredClasses : filteredExams

  // Helper function to get items for a specific day and time
  const getItemsForSlot = (day, time) => {
    return currentData.filter((item) => {
      const itemStartTime = item.startTime.replace(":", "")
      const slotTime = time.replace(":", "")
      const itemEndTime = item.endTime.replace(":", "")

      return (
        item.day === day &&
        Number.parseInt(itemStartTime) <= Number.parseInt(slotTime) &&
        Number.parseInt(itemEndTime) > Number.parseInt(slotTime)
      )
    })
  }

  // Group items by day for list view
  const groupedByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = currentData.filter((item) => item.day === day)
    return acc
  }, {})

  const getTypeColor = (type, examType = null) => {
    if (type === "class") return "blue"
    if (type === "exam") {
      return examType === "Midterm" ? "orange" : "red"
    }
    return "gray"
  }

  const getTypeIcon = (type) => {
    return type === "class" ? FiBook : FiAlertCircle
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Academic Schedule Dashboard
          </Text>
          <Text color="gray.600">View your class schedule and exam timetable in one place</Text>
        </Box>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Stack direction={cardDirection} spacing={4} align="center">
              <HStack spacing={2}>
                <Icon as={FiFilter} color="gray.500" />
                <Text fontWeight="medium" fontSize="sm">
                  Filters:
                </Text>
              </HStack>

              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} flex="1">
                <Box>
                  <Text fontSize="sm" mb={1} color="gray.600">
                    Semester
                  </Text>
                  <Select size="sm" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                    {mockScheduleData.semesters.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" mb={1} color="gray.600">
                    Week
                  </Text>
                  <Select size="sm" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
                    {mockScheduleData.weeks.map((week) => (
                      <option key={week} value={week}>
                        {week}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" mb={1} color="gray.600">
                    Group
                  </Text>
                  <Select size="sm" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                    {mockScheduleData.groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>

              <ButtonGroup size="sm" isAttached variant="outline">
                <Button colorScheme={viewMode === "weekly" ? "blue" : "gray"} onClick={() => setViewMode("weekly")}>
                  Weekly View
                </Button>
                <Button colorScheme={viewMode === "list" ? "blue" : "gray"} onClick={() => setViewMode("list")}>
                  List View
                </Button>
              </ButtonGroup>
            </Stack>
          </CardBody>
        </Card>

        {/* Main Content */}
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FiBook} />
                <Text>Class Schedule</Text>
                <Badge colorScheme="blue" variant="subtle">
                  {filteredClasses.length}
                </Badge>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiAlertCircle} />
                <Text>Exam Schedule</Text>
                <Badge colorScheme="red" variant="subtle">
                  {filteredExams.length}
                </Badge>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={6}>
              {viewMode === "weekly" ? (
                // Weekly View
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody p={0}>
                    {isMobile ? (
                      // Mobile Weekly View - Stacked Cards
                      <VStack spacing={4} p={4}>
                        {daysOfWeek.map((day) => {
                          const dayItems = currentData.filter((item) => item.day === day)
                          return (
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
                                            <Text>{item.room}</Text>
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
                                    No {activeTab === 0 ? "classes" : "exams"} scheduled
                                  </Text>
                                )}
                              </CardBody>
                            </Card>
                          )
                        })}
                      </VStack>
                    ) : (
                      // Desktop Weekly View - Grid
                      <Box overflowX="auto">
                        <Grid templateColumns="80px repeat(7, 1fr)" gap={1} minW="800px">
                          {/* Header Row */}
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

                          {/* Time Slots */}
                          {timeSlots.map((time) => (
                            <>
                              <Box
                                key={time}
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
                                const items = getItemsForSlot(day, time)
                                return (
                                  <Box
                                    key={`${day}-${time}`}
                                    minH="60px"
                                    bg={gridBg}
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    p={1}
                                  >
                                    {items.map((item) => (
                                      <Box
                                        key={item.id}
                                        bg={`${getTypeColor(item.type, item.examType)}.100`}
                                        borderLeft="3px solid"
                                        borderLeftColor={`${getTypeColor(item.type, item.examType)}.400`}
                                        p={2}
                                        borderRadius="sm"
                                        mb={1}
                                        fontSize="xs"
                                      >
                                        <Text fontWeight="bold" mb={1}>
                                          {item.code}
                                        </Text>
                                        <Text mb={1} noOfLines={1}>
                                          {item.subject}
                                        </Text>
                                        <Text color="gray.600" noOfLines={1}>
                                          {item.room}
                                        </Text>
                                        {item.lecturer && (
                                          <Text color="gray.600" noOfLines={1}>
                                            {item.lecturer}
                                          </Text>
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                )
                              })}
                            </>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardBody>
                </Card>
              ) : (
                // List View
                <VStack spacing={4} align="stretch">
                  {daysOfWeek.map((day) => {
                    const dayItems = groupedByDay[day] || []
                    if (dayItems.length === 0) return null

                    return (
                      <Card key={day} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.600">
                            {day}
                          </Text>
                          <TableContainer>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Time</Th>
                                  <Th>Subject</Th>
                                  <Th>Location</Th>
                                  <Th>Type</Th>
                                  <Th>{activeTab === 0 ? "Lecturer" : "Duration"}</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {dayItems.map((item) => (
                                  <Tr key={item.id}>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium">
                                          {item.startTime} - {item.endTime}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {item.date}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium">{item.code}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {item.subject}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text>{item.room}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {item.building}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <Badge colorScheme={getTypeColor(item.type, item.examType)} variant="subtle">
                                        {item.type === "exam" ? item.examType : "Class"}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      <Text fontSize="sm">{item.lecturer || item.duration || "N/A"}</Text>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </CardBody>
                      </Card>
                    )
                  })}

                  {currentData.length === 0 && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                      <CardBody textAlign="center" py={12}>
                        <Icon as={FiCalendar} boxSize={12} color="gray.400" mb={4} />
                        <Text fontSize="lg" fontWeight="medium" color="gray.600" mb={2}>
                          No {activeTab === 0 ? "Classes" : "Exams"} Scheduled
                        </Text>
                        <Text color="gray.500">
                          There are no {activeTab === 0 ? "classes" : "exams"} scheduled for the selected filters.
                        </Text>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              )}
            </TabPanel>

            <TabPanel p={0} pt={6}>
              {/* Same content structure for exams */}
              {viewMode === "weekly" ? (
                // Weekly View for Exams
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody p={0}>
                    {isMobile ? (
                      // Mobile Weekly View - Stacked Cards
                      <VStack spacing={4} p={4}>
                        {daysOfWeek.map((day) => {
                          const dayItems = currentData.filter((item) => item.day === day)
                          return (
                            <Card key={day} w="full" borderWidth="1px">
                              <CardBody>
                                <Text fontWeight="bold" mb={3} color="red.600">
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
                                      >
                                        <HStack justify="space-between" mb={1}>
                                          <Text fontWeight="bold" fontSize="sm">
                                            {item.code}
                                          </Text>
                                          <Badge colorScheme={getTypeColor(item.type, item.examType)} size="sm">
                                            {item.examType}
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
                                            <Text>{item.room}</Text>
                                          </HStack>
                                        </HStack>
                                        <HStack fontSize="xs" color="gray.600" mt={1}>
                                          <Text>Duration: {item.duration}</Text>
                                          <Text>•</Text>
                                          <Text>Marks: {item.totalMarks}</Text>
                                        </HStack>
                                      </Box>
                                    ))}
                                  </VStack>
                                ) : (
                                  <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                    No exams scheduled
                                  </Text>
                                )}
                              </CardBody>
                            </Card>
                          )
                        })}
                      </VStack>
                    ) : (
                      // Desktop Weekly View - Grid (same as classes)
                      <Box overflowX="auto">
                        <Grid templateColumns="80px repeat(7, 1fr)" gap={1} minW="800px">
                          {/* Header Row */}
                          <Box />
                          {daysOfWeek.map((day) => (
                            <Box
                              key={day}
                              p={3}
                              bg="red.500"
                              color="white"
                              textAlign="center"
                              fontWeight="bold"
                              fontSize="sm"
                            >
                              {day}
                            </Box>
                          ))}

                          {/* Time Slots */}
                          {timeSlots.map((time) => (
                            <>
                              <Box
                                key={time}
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
                                const items = getItemsForSlot(day, time)
                                return (
                                  <Box
                                    key={`${day}-${time}`}
                                    minH="60px"
                                    bg={gridBg}
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    p={1}
                                  >
                                    {items.map((item) => (
                                      <Box
                                        key={item.id}
                                        bg={`${getTypeColor(item.type, item.examType)}.100`}
                                        borderLeft="3px solid"
                                        borderLeftColor={`${getTypeColor(item.type, item.examType)}.400`}
                                        p={2}
                                        borderRadius="sm"
                                        mb={1}
                                        fontSize="xs"
                                      >
                                        <Text fontWeight="bold" mb={1}>
                                          {item.code}
                                        </Text>
                                        <Text mb={1} noOfLines={1}>
                                          {item.subject}
                                        </Text>
                                        <Text color="gray.600" noOfLines={1}>
                                          {item.room}
                                        </Text>
                                        <Text color="gray.600" noOfLines={1}>
                                          {item.examType}
                                        </Text>
                                      </Box>
                                    ))}
                                  </Box>
                                )
                              })}
                            </>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardBody>
                </Card>
              ) : (
                // List View for Exams (same structure as classes)
                <VStack spacing={4} align="stretch">
                  {daysOfWeek.map((day) => {
                    const dayItems = groupedByDay[day] || []
                    if (dayItems.length === 0) return null

                    return (
                      <Card key={day} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <Text fontSize="lg" fontWeight="bold" mb={4} color="red.600">
                            {day}
                          </Text>
                          <TableContainer>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Time</Th>
                                  <Th>Subject</Th>
                                  <Th>Location</Th>
                                  <Th>Type</Th>
                                  <Th>Duration</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {dayItems.map((item) => (
                                  <Tr key={item.id}>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium">
                                          {item.startTime} - {item.endTime}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {item.date}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium">{item.code}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {item.subject}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text>{item.room}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {item.building}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <Badge colorScheme={getTypeColor(item.type, item.examType)} variant="subtle">
                                        {item.examType}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="sm">{item.duration}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {item.totalMarks} marks
                                        </Text>
                                      </VStack>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </CardBody>
                      </Card>
                    )
                  })}

                  {currentData.length === 0 && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                      <CardBody textAlign="center" py={12}>
                        <Icon as={FiAlertCircle} boxSize={12} color="gray.400" mb={4} />
                        <Text fontSize="lg" fontWeight="medium" color="gray.600" mb={2}>
                          No Exams Scheduled
                        </Text>
                        <Text color="gray.500">There are no exams scheduled for the selected filters.</Text>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}
