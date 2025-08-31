import {
    Box,
    Grid,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Badge,
    useColorModeValue,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Icon,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Flex,
    IconButton,
    useToast,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    Center,
} from "@chakra-ui/react"
import {
    FiBook,
    FiCalendar,
    FiClock,
    FiMapPin,
    FiSearch,
    FiDownload,
    FiRefreshCw,
    FiUser,
    FiGrid,
    FiList,
} from "react-icons/fi"
import { exportScheduleToPDF } from "../../utils/exportUtils"
import { useState, useEffect, useRef, useMemo } from "react"
import { useAcademicStore } from "../../store/academic"
import { useAuthStore } from "../../store/auth"

// Color mapping for different course types
const getColorForType = (type) => {
    const colorMap = {
        'Lecture': 'blue',
        'Lab': 'purple',
        'Tutorial': 'green',
        'Seminar': 'orange',
        'Workshop': 'teal',
        'default': 'gray'
    };
    return colorMap[type] || colorMap.default;
};

// Transform time from 24-hour format to 12-hour format
const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

// Transform class schedule data to match the expected format
const transformClassScheduleData = (classSchedules, rooms, modules, lecturers, intakeCourse) => {
    // Filter modules that belong to the user's intake course
    const userModules = intakeCourse ? modules.filter(module =>
        module.courseId && module.courseId.some(course =>
            course._id === intakeCourse.courseId._id
        )
    ) : modules;

    // Add safety check for empty arrays
    if (!classSchedules || classSchedules.length === 0) {
        return [];
    }

    return classSchedules
        .filter(schedule => {
            // Only include schedules for modules that belong to the user's intake course
            // Add null checks to prevent errors
            if (!schedule.semesterModuleId || !schedule.intakeCourseId || !intakeCourse) {
                return false;
            }

            // Get module from semesterModule
            const module = schedule.semesterModuleId?.moduleId ? modules.find(m => m._id === schedule.semesterModuleId.moduleId._id) : null;
            const filterModule = module && userModules.some(userModule => userModule._id === module._id) && schedule.intakeCourseId._id === intakeCourse._id;
            return filterModule;
        })
        .map(schedule => {
            // Add null checks for all related objects
            const room = schedule.roomId ? rooms.find(r => r._id === schedule.roomId._id) : null;
            const module = schedule.semesterModuleId?.moduleId ? modules.find(m => m._id === schedule.semesterModuleId.moduleId._id) : null;
            const lecturer = schedule.lecturerId ? lecturers.find(l => l._id === schedule.lecturerId._id) : null;

            return {
                id: schedule._id,
                courseCode: typeof module?.code === 'string' ? module.code : 'N/A',
                courseName: typeof module?.moduleName === 'string' ? module.moduleName : 'N/A',
                day: typeof schedule.dayOfWeek === 'string' ? schedule.dayOfWeek : 'N/A',
                time: `${formatTime(schedule.startTime || '')} - ${formatTime(schedule.endTime || '')}`,
                room: room && typeof room.block === 'string' && typeof room.roomNumber === 'string' ? `${room.block}-${room.roomNumber}` : 'N/A',
                building: typeof room?.block === 'string' ? room.block : 'N/A',
                instructor: typeof lecturer?.userId?.name === 'string' ? lecturer.userId.name : 'N/A',
                credits: module?.totalCreditHours || 0,
                type: 'Lecture', // Default type
                color: getColorForType('Lecture'),
                description: typeof module?.moduleDescription === 'string' ? module.moduleDescription : 'No description available',
                prerequisites: typeof module?.prerequisites === 'string' ? module.prerequisites : 'None',
                textbook: typeof module?.textbook === 'string' ? module.textbook : 'Not specified',
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                moduleStartDate: schedule.moduleStartDate,
                moduleEndDate: schedule.moduleEndDate,
                moduleId: module?._id,
                intakeCourseId: intakeCourse?._id,
                semesterId: schedule.semesterModuleId?.semesterId?._id || null,
            };
        });
};

export default function Schedule() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [filterDay, setFilterDay] = useState("all")
    const [viewMode, setViewMode] = useState("table")
    const [lastRefresh, setLastRefresh] = useState(new Date())
    const [selectedSemester, setSelectedSemester] = useState("")
    const [selectedYear, setSelectedYear] = useState("")

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const toast = useToast()
    const hasFetchedRef = useRef(false)

    // Get store functions and state
    const {
        fetchClassSchedulesByStudentId,
        fetchRoomsBySchoolId,
        fetchModulesBySchoolId,
        fetchLecturersBySchoolId,
        fetchIntakeCoursesBySchoolId,
        fetchSemesters,
        classSchedules,
        rooms,
        modules,
        lecturers,
        intakeCourses,
        semesters,
        loading,
        errors
    } = useAcademicStore()

    const { initializeAuth } = useAuthStore()
    const [currentUser, setCurrentUser] = useState(null)
    const [isInitializing, setIsInitializing] = useState(true)

    // Initialize auth and fetch data on component mount
    useEffect(() => {
        const initializeAndFetch = async () => {
            try {
                // Initialize authentication first
                const authResult = await initializeAuth();
                if (authResult.success) {
                    setCurrentUser(authResult.data);

                    // Only fetch data if user is authenticated
                    if (authResult.data && !hasFetchedRef.current) {
                        hasFetchedRef.current = true;

                        // Fetch all required data
                        await Promise.all([
                            fetchClassSchedulesByStudentId(authResult.data.student._id),
                            fetchRoomsBySchoolId(),
                            fetchModulesBySchoolId(),
                            fetchLecturersBySchoolId(),
                            fetchIntakeCoursesBySchoolId(),
                            fetchSemesters()
                        ]);
                    }
                } else {
                    console.error("Authentication failed:", authResult.message);
                    toast({
                        title: "Authentication Error",
                        description: "Please log in to view your schedule",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } catch (error) {
                console.error("Error initializing auth:", error);
                toast({
                    title: "Error",
                    description: "Failed to initialize authentication",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsInitializing(false);
            }
        };

        initializeAndFetch();
    }, [initializeAuth, fetchClassSchedulesByStudentId, fetchRoomsBySchoolId, fetchModulesBySchoolId, fetchLecturersBySchoolId, fetchIntakeCoursesBySchoolId, fetchSemesters, toast]);

    // Use useMemo to transform data when raw data changes
    const scheduleData = useMemo(() => {
        // Add safety checks for all required data
        if (!classSchedules || classSchedules.length === 0 ||
            !rooms || !modules || !lecturers || !intakeCourses || !semesters) {
            return {
                classSchedules: [],
                studentProfile: {
                    intakeCourse: "Loading...",
                    semester: "Loading...",
                    advisor: "Loading...",
                }
            };
        }

        // Get user's intake course
        if (!currentUser) {
            return {
                classSchedules: [],
                studentProfile: {
                    intakeCourse: "Loading...",
                    semester: "Loading...",
                    advisor: "Loading...",
                }
            };
        }

        const userIntakeCourseId = currentUser?.student?.intakeCourseId;
        const userIntakeCourse = intakeCourses.find(ic => ic._id === userIntakeCourseId);

        // Filter class schedules by selected semester/year if specified
        let filteredClassSchedules = classSchedules;
        if (selectedSemester && selectedYear) {
            filteredClassSchedules = classSchedules.filter(schedule => {
                if (!schedule.semesterId || !schedule.semesterId._id) return false;

                const semester = semesters.find(s => s._id === schedule.semesterId._id);
                if (!semester) return false;

                return semester.semesterNumber.toString() === selectedSemester &&
                    semester.year.toString() === selectedYear;
            });
        }

        // Transform the data
        const transformedClassSchedules = transformClassScheduleData(
            filteredClassSchedules,
            rooms,
            modules,
            lecturers,
            userIntakeCourse
        );

        // Get current semester/year info
        let semesterInfo = "Current Semester";
        if (selectedSemester && selectedYear) {
            semesterInfo = `Year ${selectedYear} Semester ${selectedSemester}`;
        } else if (selectedSemester) {
            semesterInfo = `Semester ${selectedSemester}`;
        } else if (selectedYear) {
            semesterInfo = `Year ${selectedYear}`;
        }

        // Ensure intakeCourse is always a string
        let intakeCourseDisplay = "N/A";
        if (userIntakeCourse) {
            const intakeName = userIntakeCourse.intakeId?.intakeName || 'N/A';
            const courseName = userIntakeCourse.courseId?.courseName || 'N/A';
            intakeCourseDisplay = `${intakeName} - ${courseName}`;
        }

        return {
            classSchedules: transformedClassSchedules,
            studentProfile: {
                intakeCourse: intakeCourseDisplay,
                semester: semesterInfo,
                advisor: "Academic Advisor",
            }
        };
    }, [classSchedules, rooms, modules, lecturers, intakeCourses, semesters, selectedSemester, selectedYear, currentUser?.student?.intakeCourseId]);

    const handleRefresh = async () => {
        try {
            if (!currentUser?.student._id) {
                toast({
                    title: "Refresh Failed",
                    description: "No student ID available",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            await Promise.all([
                fetchClassSchedulesByStudentId(currentUser.student._id),
                fetchRoomsBySchoolId(),
                fetchModulesBySchoolId(),
                fetchLecturersBySchoolId(),
                fetchIntakeCoursesBySchoolId(),
                fetchSemesters()
            ]);

            setLastRefresh(new Date());
            toast({
                title: "Schedule Refreshed",
                description: "Class schedule has been updated",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh schedule data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const handleExport = async () => {
        try {
            const result = await exportScheduleToPDF(
                scheduleData,
                scheduleData.studentProfile,
                filteredSchedule,
                {
                    fileName: 'class_schedule',
                    onSuccess: (fileName) => {
                        toast({
                            title: "Schedule & Course Info Exported",
                            description: "Your class schedule and course information have been exported as PDF",
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                        })
                    },
                    onError: (error) => {
                        toast({
                            title: "Export Failed",
                            description: "Failed to export schedule as PDF",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                        })
                    }
                }
            )

            if (!result.success) {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error('Error exporting PDF:', error)
            toast({
                title: "Export Failed",
                description: "Failed to export schedule as PDF",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }



    // Filter schedule based on search and filters
    const filteredSchedule = scheduleData.classSchedules.filter((item) => {
        const matchesSearch =
            item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.room.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === "all" || item.type.toLowerCase() === filterType.toLowerCase()
        const matchesDay = filterDay === "all" || item.day.toLowerCase() === filterDay.toLowerCase()

        return matchesSearch && matchesType && matchesDay
    })

    // Calculate statistics
    const totalCredits = scheduleData.classSchedules.reduce((sum, course) => sum + course.credits, 0)
    const lectureCount = scheduleData.classSchedules.filter((course) => course.type === "Lecture").length
    const labCount = scheduleData.classSchedules.filter((course) => course.type === "Lab").length

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Get available semesters and years from the data
    const availableSemesters = useMemo(() => {
        if (!semesters || !classSchedules) return [];

        const semesterNumbers = [...new Set(
            classSchedules
                .filter(schedule => schedule.semesterId && schedule.semesterId._id)
                .map(schedule => {
                    const semester = semesters.find(s => s._id === schedule.semesterId._id);
                    return semester?.semesterNumber;
                })
                .filter(Boolean)
        )].sort((a, b) => a - b);

        return semesterNumbers;
    }, [semesters, classSchedules]);

    const availableYears = useMemo(() => {
        if (!semesters || !classSchedules) return [];

        const years = [...new Set(
            classSchedules
                .filter(schedule => schedule.semesterId && schedule.semesterId._id)
                .map(schedule => {
                    const semester = semesters.find(s => s._id === schedule.semesterId._id);
                    return semester?.year;
                })
                .filter(Boolean)
        )].sort((a, b) => a - b);

        return years;
    }, [semesters, classSchedules]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setFilterType("all");
        setFilterDay("all");
        setSelectedSemester("");
        setSelectedYear("");
    };

    // Show loading state
    if (isInitializing || loading.classSchedules || loading.rooms) {
        return (
            <Box p={6} minH="100vh">
                <Center h="50vh">
                    <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text>{isInitializing ? "Initializing..." : "Loading schedule data..."}</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    // Show error state
    if (errors.classSchedules || errors.rooms) {
        return (
            <Box p={6} minH="100vh">
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Error loading schedule data!</AlertTitle>
                        <AlertDescription>
                            {errors.classSchedules || errors.rooms}
                        </AlertDescription>
                    </Box>
                </Alert>
            </Box>
        );
    }

    // Show authentication error
    if (!currentUser) {
        return (
            <Box p={6} minH="100vh">
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Authentication Required</AlertTitle>
                        <AlertDescription>
                            Please log in to view your schedule
                        </AlertDescription>
                    </Box>
                </Alert>
            </Box>
        );
    }

    return (
        <Box minH="100vh" w="100%" maxW="100%">
            <VStack spacing={6} align="stretch" w="100%">
                {/* Header */}
                <Flex justify="space-between" align="start" direction={{ base: "column", md: "row" }} gap={4}>
                    <Box flex="1" minW="0">
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2} noOfLines={1}>
                            Class Schedule
                        </Text>
                        <Text color="gray.600" noOfLines={2}>
                            {scheduleData.studentProfile.intakeCourse}
                        </Text>
                        {/* Current Semester/Year Display */}
                        <HStack mt={2} spacing={3}>
                            <Badge 
                                colorScheme="blue" 
                                variant="solid" 
                                fontSize="sm"
                                px={3}
                                py={1}
                            >
                                {scheduleData.studentProfile.semester}
                            </Badge>
                            {selectedSemester && selectedYear && (
                                <Badge 
                                    colorScheme="green" 
                                    variant="outline" 
                                    fontSize="sm"
                                    px={3}
                                    py={1}
                                >
                                    Filtered: Year {selectedYear} Semester {selectedSemester}
                                </Badge>
                            )}
                        </HStack>
                    </Box>
                    <HStack flexShrink={0}>
                        <Text fontSize="sm" color="gray.500" display={{ base: "none", sm: "block" }}>
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </Text>
                        <IconButton
                            icon={<FiRefreshCw />}
                            size="sm"
                            variant="ghost"
                            onClick={handleRefresh}
                            aria-label="Refresh schedule"
                        />
                    </HStack>
                </Flex>

                {/* Filter Summary */}
                {(selectedSemester || selectedYear || searchTerm || filterType !== "all" || filterDay !== "all") && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <HStack justify="space-between" align="center">
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                        Active Filters:
                                    </Text>
                                    <HStack spacing={2} wrap="wrap">
                                        {selectedSemester && (
                                            <Badge colorScheme="blue" variant="subtle">
                                                Semester {selectedSemester}
                                            </Badge>
                                        )}
                                        {selectedYear && (
                                            <Badge colorScheme="green" variant="subtle">
                                                Year {selectedYear}
                                            </Badge>
                                        )}
                                        {searchTerm && (
                                            <Badge colorScheme="purple" variant="subtle">
                                                Search: "{searchTerm}"
                                            </Badge>
                                        )}
                                        {filterType !== "all" && (
                                            <Badge colorScheme="orange" variant="subtle">
                                                Type: {filterType}
                                            </Badge>
                                        )}
                                        {filterDay !== "all" && (
                                            <Badge colorScheme="teal" variant="subtle">
                                                Day: {filterDay}
                                            </Badge>
                                        )}
                                    </HStack>
                                </VStack>
                                <Text fontSize="sm" color="gray.600">
                                    {filteredSchedule.length} course{filteredSchedule.length !== 1 ? 's' : ''} found
                                </Text>
                            </HStack>
                        </CardBody>
                    </Card>
                )}

                {/* Quick Stats */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(1, 1fr)", lg: "repeat(5, 1fr)" }} gap={6}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Current Period</StatLabel>
                                <StatNumber color="purple.500" fontSize="lg">
                                    {selectedSemester && selectedYear 
                                        ? `Y${selectedYear} S${selectedSemester}` 
                                        : 'All Periods'
                                    }
                                </StatNumber>
                                <StatHelpText>
                                    <Icon as={FiCalendar} mr={1} />
                                    {scheduleData.studentProfile.semester}
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Credits</StatLabel>
                                <StatNumber color="blue.500">{totalCredits}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiBook} mr={1} />
                                    {selectedSemester && selectedYear ? 'Selected Period' : 'All Periods'}
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Enrolled Courses</StatLabel>
                                <StatNumber color="green.500">{scheduleData.classSchedules.length}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiCalendar} mr={1} />
                                    Active Courses
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Lectures</StatLabel>
                                <StatNumber color="purple.500">{lectureCount}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiUser} mr={1} />
                                    Theory Classes
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Lab Sessions</StatLabel>
                                <StatNumber color="orange.500">{labCount}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiClock} mr={1} />
                                    Practical Classes
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Controls */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <Flex direction={{ base: "column", md: "row" }} gap={4} align={{ md: "center" }} justify="space-between">
                                <HStack spacing={4} flex={1} wrap="wrap" gap={2}>
                                    <InputGroup maxW={{ base: "100%", sm: "300px" }} minW="200px">
                                        <InputLeftElement>
                                            <Icon as={FiSearch} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search courses, instructors, rooms..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>

                                    <Select maxW={{ base: "100%", sm: "150px" }} minW="120px" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                        <option value="all">All Types</option>
                                        <option value="lecture">Lectures</option>
                                        <option value="lab">Labs</option>
                                    </Select>

                                    <Select maxW={{ base: "100%", sm: "150px" }} minW="120px" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                                        <option value="all">All Days</option>
                                        {days.map((day) => (
                                            <option key={day} value={day.toLowerCase()}>
                                                {day}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        maxW={{ base: "100%", sm: "150px" }}
                                        minW="120px"
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        placeholder="Semester"
                                    >
                                        <option value="">All Semesters</option>
                                        {availableSemesters.map(semester => (
                                            <option key={semester} value={semester}>
                                                Semester {semester}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        maxW={{ base: "100%", sm: "150px" }}
                                        minW="120px"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        placeholder="Year"
                                    >
                                        <option value="">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>
                                                Year {year}
                                            </option>
                                        ))}
                                    </Select>
                                </HStack>

                                <HStack flexShrink={0} gap={2}>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleResetFilters}
                                        colorScheme="gray"
                                    >
                                        Reset Filters
                                    </Button>

                                    <HStack bg="gray.100" p={1} borderRadius="md" display={{ base: "none", lg: "flex" }}>
                                        <IconButton
                                            icon={<FiList />}
                                            size="sm"
                                            variant={viewMode === "table" ? "solid" : "ghost"}
                                            colorScheme={viewMode === "table" ? "blue" : "gray"}
                                            onClick={() => setViewMode("table")}
                                            aria-label="Table view"
                                        />
                                        <IconButton
                                            icon={<FiGrid />}
                                            size="sm"
                                            variant={viewMode === "grid" ? "solid" : "ghost"}
                                            colorScheme={viewMode === "grid" ? "blue" : "gray"}
                                            onClick={() => setViewMode("grid")}
                                            aria-label="Grid view"
                                        />
                                        <IconButton
                                            icon={<FiCalendar />}
                                            size="sm"
                                            variant={viewMode === "calendar" ? "solid" : "ghost"}
                                            colorScheme={viewMode === "calendar" ? "blue" : "gray"}
                                            onClick={() => setViewMode("calendar")}
                                            aria-label="Calendar view"
                                        />
                                    </HStack>

                                    <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={handleExport}>
                                        Export Schedule & Course Info
                                    </Button>
                                </HStack>
                            </Flex>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Schedule Summary */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                    Schedule Summary
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    {filteredSchedule.length} course{filteredSchedule.length !== 1 ? 's' : ''} • {scheduleData.studentProfile.semester}
                                </Text>
                            </VStack>
                            <HStack spacing={3}>
                                {selectedSemester && selectedYear && (
                                    <Badge colorScheme="green" variant="solid">
                                        Year {selectedYear} Semester {selectedSemester}
                                    </Badge>
                                )}
                                {!selectedSemester && !selectedYear && (
                                    <Badge colorScheme="blue" variant="solid">
                                        All Semesters
                                    </Badge>
                                )}
                            </HStack>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Schedule Display */}
                {/* Show table and grid views only on lg screens and up */}
                <Box display={{ base: "none", lg: "block" }}>
                    {viewMode === "table" && (
                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <HStack justify="space-between" align="center" mb={4}>
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Course Schedule - Table View
                                    </Text>
                                    {selectedSemester && selectedYear && (
                                        <Badge colorScheme="green" variant="solid">
                                            Year {selectedYear} Semester {selectedSemester}
                                        </Badge>
                                    )}
                                </HStack>

                                {filteredSchedule.length === 0 ? (
                                    <Center py={8}>
                                        <Text color="gray.500">No courses found matching your criteria</Text>
                                    </Center>
                                ) : (
                                    <Box overflowX="auto" w="100%">
                                        <TableContainer minW="800px">
                                            <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                                <Thead>
                                                    <Tr>
                                                        <Th minW="120px">Course</Th>
                                                        <Th minW="100px">Day & Time</Th>
                                                        <Th minW="120px">Location</Th>
                                                        <Th minW="100px">Instructor</Th>
                                                        <Th minW="80px">Credits</Th>
                                                        <Th minW="80px">Type</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredSchedule.map((schedule) => {                                                        
                                                        return(
                                                        <Tr key={schedule.id}>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <Text fontWeight="medium" noOfLines={1}>{schedule.courseCode}</Text>
                                                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                                        {schedule.courseName}
                                                                    </Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <Badge colorScheme={schedule.color} variant="subtle" fontSize="xs">
                                                                        {schedule.day}
                                                                    </Badge>
                                                                    <Text fontSize="sm" noOfLines={1}>{schedule.time}</Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <HStack>
                                                                        <Icon as={FiMapPin} color="gray.400" boxSize={3} />
                                                                        <Text fontWeight="medium" noOfLines={1}>{schedule.roomId?.block}-{schedule.roomId?.roomNumber}</Text>
                                                                    </HStack>
                                                                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                                                        {schedule.building}
                                                                    </Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                <Text noOfLines={2}>{schedule.instructor}</Text>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme="blue" variant="outline" fontSize="xs">
                                                                    {schedule.credits} Credits
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme={schedule.type === "Lab" ? "purple" : "green"} variant="subtle" fontSize="xs">
                                                                    {schedule.type}
                                                                </Badge>
                                                            </Td>
                                                        </Tr>
                                                    )})}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {viewMode === "grid" && (
                        <Box>
                            <HStack justify="space-between" align="center" mb={4}>
                                <Text fontSize="lg" fontWeight="semibold">
                                    Course Schedule - Grid View
                                </Text>
                                {selectedSemester && selectedYear && (
                                    <Badge colorScheme="green" variant="solid">
                                        Year {selectedYear} Semester {selectedSemester}
                                    </Badge>
                                )}
                            </HStack>
                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                            {filteredSchedule.map((course) => (
                                <Card key={course.id} bg={bgColor} borderColor={borderColor} borderWidth="1px" _hover={{ shadow: "md" }}>
                                    <CardBody>
                                        <VStack align="stretch" spacing={4}>
                                            <HStack justify="space-between">
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="lg">
                                                        {course.courseCode}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {course.courseName}
                                                    </Text>
                                                </VStack>
                                                <Badge colorScheme={course.type === "Lab" ? "purple" : "green"} variant="solid">
                                                    {course.type}
                                                </Badge>
                                            </HStack>

                                            <Divider />

                                            <VStack align="stretch" spacing={2}>
                                                <HStack>
                                                    <Icon as={FiCalendar} color={`${course.color}.500`} />
                                                    <Text fontWeight="medium">{course.day}</Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiClock} color={`${course.color}.500`} />
                                                    <Text fontSize="sm">{course.time}</Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiMapPin} color={`${course.color}.500`} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="medium">
                                                            {course.room}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {course.building}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiUser} color={`${course.color}.500`} />
                                                    <Text fontSize="sm">{course.instructor}</Text>
                                                </HStack>
                                            </VStack>

                                            <Divider />

                                            <HStack justify="space-between">
                                                <Badge colorScheme="blue" variant="outline">
                                                    {course.credits} Credits
                                                </Badge>
                                                <Text fontSize="xs" color="gray.500">
                                                    {course.prerequisites}
                                                </Text>
                                            </HStack>

                                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                {course.description}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </Grid>
                        </Box>
                    )}
                </Box>

                {/* Always show calendar view on md screens and smaller */}
                <Box display={{ base: "block", lg: "none" }}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Flex justify="space-between" align="center" mb={4}>
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Weekly Schedule - Calendar View
                                    </Text>
                                    {selectedSemester && selectedYear && (
                                        <Text fontSize="sm" color="green.600" fontWeight="medium">
                                            Year {selectedYear} Semester {selectedSemester}
                                        </Text>
                                    )}
                                </VStack>
                                <VStack align="end" spacing={1}>
                                    <Badge colorScheme="blue" variant="subtle" display={{ base: "block", lg: "none" }}>
                                        Mobile View
                                    </Badge>
                                    {selectedSemester && selectedYear && (
                                        <Badge colorScheme="green" variant="solid" display={{ base: "block", lg: "none" }}>
                                            Y{selectedYear} S{selectedSemester}
                                        </Badge>
                                    )}
                                </VStack>
                            </Flex>

                            <Box overflowX="auto" w="100%">
                                <Grid
                                    templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(7, 1fr)" }}
                                    gap={2}
                                    minW={{ base: "100%", lg: "800px" }}
                                >
                                    {days.map((day) => {
                                        const daySchedules = filteredSchedule.filter(schedule =>
                                            schedule.day === day
                                        );

                                        return (
                                            <Box key={day} p={3} bg="gray.100" borderRadius="md" minH="200px">
                                                <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center" noOfLines={1}>
                                                    {day}
                                                </Text>
                                                <VStack spacing={2} align="stretch">
                                                    {daySchedules.map((session, index) => (
                                                        <Box
                                                            key={index}
                                                            p={2}
                                                            bg={`${session.color}.100`}
                                                            borderRadius="md"
                                                            borderLeft="4px solid"
                                                            borderColor={`${session.color}.500`}
                                                        >
                                                            <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                                                {session.courseCode}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                                {session.time}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                                {session.room}
                                                            </Text>
                                                            <Badge size="xs" colorScheme={session.type === "Lab" ? "purple" : "green"} variant="subtle">
                                                                {session.type}
                                                            </Badge>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        </CardBody>
                    </Card>
                </Box>

                {/* Course Details */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Text fontSize="lg" fontWeight="semibold" mb={4}>
                            Academic Timeline
                        </Text>

                        <Alert status="info" borderRadius="md" mb={6}>
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Academic Advisor:</AlertTitle>
                                <AlertDescription>{scheduleData.studentProfile.advisor}</AlertDescription>
                            </Box>
                        </Alert>

                        {filteredSchedule.length === 0 ? (
                            <Center py={8}>
                                <Text color="gray.500">No courses found to display</Text>
                            </Center>
                        ) : (
                            <Box>
                                {/* Timeline Container */}
                                <VStack spacing={0} align="stretch">
                                    {/* Group modules by semester */}
                                    {(() => {
                                        // Group modules by semester
                                        const modulesBySemester = {};
                                        
                                        // Get unique semesters from the schedule data
                                        const uniqueSemesters = [...new Set(
                                            filteredSchedule
                                                .filter(course => course.semesterId && typeof course.semesterId === 'string')
                                                .map(course => {
                                                    const semester = semesters.find(s => s._id === course.semesterId);
                                                    return semester ? `${semester.year}-${semester.semesterNumber}` : null;
                                                })
                                                .filter(Boolean)
                                        )].sort();

                                        // If no semester data, group by intake course
                                        if (uniqueSemesters.length === 0) {
                                            const intakeCourse = intakeCourses.find(ic => 
                                                ic._id === currentUser?.student?.intakeCourseId
                                            );
                                            if (intakeCourse) {
                                                modulesBySemester['Current Intake'] = filteredSchedule;
                                            }
                                        } else {
                                            uniqueSemesters.forEach(semesterKey => {
                                                const [year, semesterNum] = semesterKey.split('-');
                                                const semesterModules = filteredSchedule.filter(course => {
                                                    if (!course.semesterId || typeof course.semesterId !== 'string') return false;
                                                    const semester = semesters.find(s => 
                                                        s._id === course.semesterId
                                                    );
                                                    return semester && 
                                                           semester.year.toString() === year && 
                                                           semester.semesterNumber.toString() === semesterNum;
                                                });
                                                modulesBySemester[semesterKey] = semesterModules;
                                            });
                                        }

                                        return Object.entries(modulesBySemester).map(([semesterKey, modules], semesterIndex) => {
                                            const [year, semesterNum] = semesterKey.split('-');
                                            const semesterLabel = year && semesterNum 
                                                ? `Year ${year} - Semester ${semesterNum}`
                                                : semesterKey;
                                            
                                            return (
                                                <Box key={semesterKey} position="relative">
                                                    {/* Semester Header */}
                                                    <Box
                                                        bg="blue.50"
                                                        border="2px solid"
                                                        borderColor="blue.200"
                                                        borderRadius="lg"
                                                        p={4}
                                                        mb={4}
                                                        position="relative"
                                                        _before={{
                                                            content: '""',
                                                            position: 'absolute',
                                                            left: { base: '50%', lg: '20px' },
                                                            top: { base: '100%', lg: '50%' },
                                                            transform: { base: 'translateX(-50%)', lg: 'translateY(-50%)' },
                                                            width: { base: '2px', lg: '20px' },
                                                            height: { base: '20px', lg: '2px' },
                                                            bg: 'blue.200',
                                                            display: semesterIndex === Object.keys(modulesBySemester).length - 1 ? 'none' : 'block'
                                                        }}
                                                    >
                                                        <HStack justify="space-between" align="center">
                                                            <VStack align={{ base: "center", lg: "start" }} spacing={2}>
                                                                <Text 
                                                                    fontSize={{ base: "lg", lg: "xl" }} 
                                                                    fontWeight="bold" 
                                                                    color="blue.700"
                                                                    textAlign={{ base: "center", lg: "left" }}
                                                                >
                                                                    {semesterLabel}
                                                                </Text>
                                                                <Text 
                                                                    fontSize="sm" 
                                                                    color="blue.600"
                                                                    textAlign={{ base: "center", lg: "left" }}
                                                                >
                                                                    {modules.length} Module{modules.length !== 1 ? 's' : ''}
                                                                </Text>
                                                            </VStack>
                                                            <Badge 
                                                                colorScheme="blue" 
                                                                variant="solid" 
                                                                fontSize={{ base: "xs", lg: "sm" }}
                                                                display={{ base: "none", lg: "block" }}
                                                            >
                                                                {modules.reduce((total, module) => total + (module.credits || 0), 0)} Credits
                                                            </Badge>
                                                        </HStack>
                                                    </Box>

                                                    {/* Modules Grid */}
                                                    <Box 
                                                        ml={{ base: 0, lg: '40px' }}
                                                        position="relative"
                                                        _before={{
                                                            content: '""',
                                                            position: 'absolute',
                                                            left: { base: '50%', lg: '0' },
                                                            top: { base: '0', lg: '50%' },
                                                            transform: { base: 'translateX(-50%)', lg: 'translateY(-50%)' },
                                                            width: { base: '2px', lg: '2px' },
                                                            height: { base: '20px', lg: '100%' },
                                                            bg: 'blue.200',
                                                            display: semesterIndex === Object.keys(modulesBySemester).length - 1 ? 'none' : 'block'
                                                        }}
                                                    >
                                                        <Grid 
                                                            templateColumns={{ 
                                                                base: "1fr", 
                                                                lg: "repeat(auto-fit, minmax(280px, 1fr))" 
                                                            }} 
                                                            gap={4}
                                                            mb={6}
                                                        >
                                                            {modules.map((module, moduleIndex) => (
                                                                <Box 
                                                                    key={module.id || moduleIndex}
                                                                    p={4} 
                                                                    bg="white" 
                                                                    borderRadius="lg" 
                                                                    borderWidth="1px"
                                                                    borderColor="gray.200"
                                                                    boxShadow="sm"
                                                                    position="relative"
                                                                    _hover={{
                                                                        boxShadow: "md",
                                                                        transform: "translateY(-2px)",
                                                                        transition: "all 0.2s"
                                                                    }}
                                                                    transition="all 0.2s"
                                                                    _before={{
                                                                        content: '""',
                                                                        position: 'absolute',
                                                                        left: { base: '50%', lg: '-20px' },
                                                                        top: { base: '0', lg: '50%' },
                                                                        transform: { base: 'translateX(-50%)', lg: 'translateY(-50%)' },
                                                                        width: { base: '12px', lg: '12px' },
                                                                        height: { base: '12px', lg: '12px' },
                                                                        bg: 'blue.400',
                                                                        borderRadius: '50%',
                                                                        border: '3px solid white',
                                                                        boxShadow: '0 0 0 2px blue.200'
                                                                    }}
                                                                >
                                                                    <VStack align="stretch" spacing={3}>
                                                                        <HStack justify="space-between">
                                                                            <Text 
                                                                                fontWeight="bold" 
                                                                                fontSize={{ base: "sm", lg: "md" }}
                                                                                noOfLines={1}
                                                                                color="gray.800"
                                                                            >
                                                                                {module.courseCode}
                                                                            </Text>
                                                                            <Badge 
                                                                                colorScheme="blue" 
                                                                                variant="subtle" 
                                                                                flexShrink={0}
                                                                                fontSize={{ base: "xs", lg: "sm" }}
                                                                            >
                                                                                {module.credits || 0} Credits
                                                                            </Badge>
                                                                        </HStack>
                                                                        
                                                                        <Text 
                                                                            fontSize={{ base: "sm", lg: "md" }} 
                                                                            fontWeight="medium" 
                                                                            noOfLines={2}
                                                                            color="gray.700"
                                                                        >
                                                                            {module.courseName}
                                                                        </Text>
                                                                        
                                                                        <Text 
                                                                            fontSize={{ base: "xs", lg: "sm" }} 
                                                                            color="gray.600" 
                                                                            noOfLines={3}
                                                                        >
                                                                            {module.description}
                                                                        </Text>
                                                                        
                                                                        <Divider />
                                                                        
                                                                        <VStack align="stretch" spacing={2}>
                                                                            <HStack justify="space-between" fontSize={{ base: "xs", lg: "sm" }}>
                                                                                <Text color="gray.500" fontWeight="medium">Instructor:</Text>
                                                                                <Text color="gray.700" noOfLines={1}>
                                                                                    {module.instructor}
                                                                                </Text>
                                                                            </HStack>
                                                                            
                                                                            <HStack justify="space-between" fontSize={{ base: "xs", lg: "sm" }}>
                                                                                <Text color="gray.500" fontWeight="medium">Schedule:</Text>
                                                                                <Text color="gray.700" noOfLines={1}>
                                                                                    {module.day} • {module.time}
                                                                                </Text>
                                                                            </HStack>
                                                                            
                                                                            <HStack justify="space-between" fontSize={{ base: "xs", lg: "sm" }}>
                                                                                <Text color="gray.500" fontWeight="medium">Room:</Text>
                                                                                <Text color="gray.700" noOfLines={1}>
                                                                                    {module.room}
                                                                                </Text>
                                                                            </HStack>
                                                                        </VStack>
                                                                    </VStack>
                                                                </Box>
                                                            ))}
                                                        </Grid>
                                                    </Box>
                                                </Box>
                                            );
                                        });
                                    })()}
                                </VStack>
                            </Box>
                        )}
                    </CardBody>
                </Card>
            </VStack>
        </Box >
    )
}
