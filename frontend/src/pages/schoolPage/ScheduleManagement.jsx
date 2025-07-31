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
  FormControl,
  FormLabel,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Center,
  Spinner,
  IconButton,
  Checkbox,
} from "@chakra-ui/react"
import React from "react"
import { FiDownload, FiCalendar, FiClock, FiMapPin, FiUser, FiBook, FiAlertCircle, FiFilter } from "react-icons/fi"
import { useState, useEffect, useMemo, useRef } from "react"
import { useGeneralStore } from "../../store/general.js"
import { useAcademicStore } from "../../store/academic.js"
import { useShowToast } from "../../store/utils/toast.js";
import generateClassSchedule from "../../component/schoolAdminDashboard/ScheduleManagement/generateClassSchedule.js"
import generateExamSchedule from "../../component/schoolAdminDashboard/ScheduleManagement/generateExamSchedule.js"
import { FiRefreshCcw } from "react-icons/fi";
import * as XLSX from "xlsx"
import { IoIosSwap } from "react-icons/io";
import { ClassItem, ClusteredScheduleGrid, TimetableListView } from "../../component/schoolAdminDashboard/ScheduleManagement/ClassScheduleCard.jsx"
import UpdateScheduleModal from "../../component/schoolAdminDashboard/ScheduleManagement/UpdateScheduleModal.jsx";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function ScheduleManagement() {
  const { semesters, fetchSemesters, fetchSemestersByIntakeCourse, createClassSchedule, createExamSchedule, classSchedules, fetchClassSchedules, lecturers, rooms, fetchIntakeCourses, fetchLecturers, fetchRooms, intakeCourses, modules, fetchModules, examSchedules, fetchExamSchedules } = useAcademicStore();
  const { exportTemplate } = useGeneralStore();
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2
  } = useDisclosure();

  const fileInputRef = useRef(null)

  const [viewMode, setViewMode] = useState("weekly") // weekly or list
  const [csvData, setCsvData] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const gridBg = useColorModeValue("gray.50", "gray.700")

  // Template export state
  const [selectedIntake, setSelectedIntake] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false)

  const [showExams, setShowExams] = useState(true);
  const [showClasses, setShowClasses] = useState(true);

  const [generateExam, setGenerateExam] = useState(false);

  // Single modal state
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [triggerDownload, setTriggerDownload] = useState(false);

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    fetchIntakeCourses();
    fetchModules();
    fetchLecturers();
    fetchRooms();
    fetchClassSchedules();
    fetchExamSchedules();
    fetchSemesters();
  }, [])

  // Fetch semesters when intake and course are selected
  useEffect(() => {
    const fetchSemestersForIntakeCourse = async () => {
      if (selectedIntake && selectedCourse) {
        // Find the selected intake course
        const selectedIntakeCourse = intakeCourses?.find(
          ic => ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse
        );

        if (selectedIntakeCourse) {
          try {
            const response = await fetchSemestersByIntakeCourse(selectedIntakeCourse._id);
            if (response.success) {
              setAvailableSemesters(response.data);
              setCurrentSemesterIndex(0);
              // Auto-select first semester if available
              if (response.data.length > 0) {
                setSelectedSemester(response.data[0]._id);
              } else {
                setSelectedSemester("");
              }
            }
          } catch (error) {
            console.error("Error fetching semesters:", error);
            setAvailableSemesters([]);
            setSelectedSemester("");
          }
        }
      } else {
        setAvailableSemesters([]);
        setSelectedSemester("");
        setCurrentSemesterIndex(0);
      }
    };

    fetchSemestersForIntakeCourse();
  }, [selectedIntake, selectedCourse, intakeCourses]);

  console.log("🚀 ~ ScheduleManagement ~ semesters:", semesters)
  console.log("🚀 ~ ScheduleManagement ~ availableSemesters:", availableSemesters)

  // Handler for opening the edit modal
  const handleEditClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  // Handler for closing the edit modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  // Helper function to transform exam data to schedule format
  const transformExamToScheduleFormat = () => {
    return examSchedules.map(exam => {
      // Convert exam date to day of week
      const examDate = new Date(exam.examDate);
      const dayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Calculate end time based on duration
      const startTime = exam.examTime;
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate.getTime() + (exam.durationMinute * 60000));
      const endTime = endDate.toTimeString().slice(0, 5);

      // console.log("🚀 ~ transformExamToScheduleFormat ~ exam:", exam)
      return {
        id: exam._id,
        type: 'exam', // Add type field
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        moduleId: exam.moduleId,
        intakeCourseId: exam.intakeCourseId,
        courseId: exam.courseId,
        roomId: exam.roomId,
        schoolId: exam.schoolId,
        examDate: exam.examDate,
        durationMinute: exam.durationMinute,
        invigilators: exam.invigilators,
        // Additional exam-specific fields
        subject: exam.moduleId?.moduleName || 'Unknown Module',
        code: exam.moduleId?.code || 'Unknown Code',
        room: exam.roomId, // Assuming roomId has room details
        lecturer: exam.invigilators?.[0] || null, // First invigilator as primary
      };
    });
  };

  // Helper function to transform class schedule data
  const transformClassToScheduleFormat = () => {
    return classSchedules.map(classItem => ({
      id: classItem._id,
      type: 'class', // Add type field
      dayOfWeek: classItem.dayOfWeek,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      moduleId: classItem.moduleId,
      intakeCourseId: classItem.intakeCourseId,
      lecturerId: classItem.lecturerId,
      roomId: classItem.roomId,
      schoolId: classItem.schoolId,
      // Additional class-specific fields
      subject: classItem.moduleId?.moduleName || 'Unknown Module',
      code: classItem.moduleId?.code || 'Unknown Code',
      room: classItem.roomId,
      lecturer: classItem.lecturerId,
    }));
  };

  // Main function to combine schedules
  const combineScheduleData = () => {
    const transformedClasses = transformClassToScheduleFormat();
    const transformedExams = transformExamToScheduleFormat();

    return [...transformedClasses, ...transformedExams];
  };

  let scheduleData = combineScheduleData();

  const getTypeColor = (type, examType = null) => {
    if (type === "class") {
      return { bg: 'gray.100', border: 'gray.400', text: 'gray.800' };
    }
    if (type === 'exam') {
      return {
        bg: 'red.100',
        border: 'red.400',
        text: 'red.800'
      };
    }
  }

  const proceedGenerateSchedule = async () => {
    onClose();

    try {
      // Configuration for schedule generation (optional - can be made configurable via UI)
      const scheduleConfig = {
        classesPerWeek: 2,
        moduleDurationWeeks: 12,
        semesterStartDate: new Date(), // You might want to make this configurable
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { start: "08:00", end: "10:00" },
          { start: "10:00", end: "12:00" },
          { start: "12:00", end: "14:00" },
          { start: "14:00", end: "16:00" },
          { start: "16:00", end: "18:00" }
        ]
      };

      // Get selected intake course for filename
      const selectedIntakeCourse = await intakeCourses?.find(
        ic => ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse
      );
      // Generate class schedule with new configuration
      const { schedule, summary } = await generateClassSchedule(
        selectedIntake,
        selectedCourse,
        selectedIntakeCourse,
        modules,
        rooms,
        lecturers,
        scheduleConfig,
        selectedSemester
      );

      if (schedule.length === 0) {
        showToast.error("No classes generated", "Unable to generate schedule with current resources", "no-schedule");
        return;
      }

      // Prepare combined schedule data
      let combinedScheduleData = [];

      // Add class schedules with type identifier
      const formattedClassSchedule = schedule.map(item => ({
        type: "class", // Add type identifier
        intakeCourseId: item.intakeCourseId,
        courseId: item.courseId,
        courseName: item.courseName,
        courseCode: item.courseCode,
        moduleId: item.moduleId,
        moduleName: item.moduleName,
        moduleCode: item.moduleCode,
        intakeId: item.intakeId,
        intakeName: item.intakeName,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        moduleStartDate: item.moduleStartDate ? new Date(item.moduleStartDate).toLocaleDateString() : '',
        moduleEndDate: item.moduleEndDate ? new Date(item.moduleEndDate).toLocaleDateString() : '',
        roomId: item.roomId,
        roomName: item.roomName,
        lecturerId: item.lecturerId,
        lecturerName: item.lecturerName,
        schoolId: item.schoolId,
        // Exam-specific fields (empty for class schedules)
        examDate: "",
        examTime: "",
        durationMinute: "",
        invigilators: ""
      }));

      combinedScheduleData = [...formattedClassSchedule];

      // Add exam schedules if checkbox is checked
      if (generateExam) {
        const examSchedule = generateExamSchedule(schedule, rooms, lecturers, selectedSemester);

        const formattedExamSchedule = examSchedule.map(item => ({
          type: "exam", // Add type identifier
          intakeCourseId: item.intakeCourseId,
          courseId: "", // Not applicable for exams
          courseName: "",
          courseCode: "",
          moduleId: item.moduleId,
          moduleName: "", // Could be populated if needed
          moduleCode: "",
          intakeId: "", // Not applicable for exams
          intakeName: "",
          dayOfWeek: "", // Not applicable for exams
          startTime: "", // Use examTime instead
          endTime: "", // Not applicable for exams
          moduleStartDate: "",
          moduleEndDate: "",
          roomId: item.roomId,
          roomName: "",
          lecturerId: "", // Not applicable for exams (use invigilators)
          lecturerName: "",
          schoolId: item.schoolId,
          // Exam-specific fields
          examDate: item.examDate,
          examTime: item.examTime,
          durationMinute: item.durationMinute,
          invigilators: item.invigilators.join(', ')
        }));

        combinedScheduleData = [...combinedScheduleData, ...formattedExamSchedule];
      }

      // Define unified columns for combined schedule template
      const combinedColumns = [
        { header: "type", key: "type", width: 15 }, // Type identifier
        { header: "intakeCourseId", key: "intakeCourseId", width: 25 },
        { header: "courseId", key: "courseId", width: 25 },
        { header: "courseName", key: "courseName", width: 30 },
        { header: "courseCode", key: "courseCode", width: 30 },
        { header: "moduleId", key: "moduleId", width: 25 },
        { header: "moduleName", key: "moduleName", width: 30 },
        { header: "moduleCode", key: "moduleCode", width: 15 },
        { header: "intakeId", key: "intakeId", width: 15 },
        { header: "intakeName", key: "intakeName", width: 15 },
        { header: "dayOfWeek", key: "dayOfWeek", width: 15 },
        { header: "startTime", key: "startTime", width: 15 },
        { header: "endTime", key: "endTime", width: 15 },
        { header: "moduleStartDate", key: "moduleStartDate", width: 20 },
        { header: "moduleEndDate", key: "moduleEndDate", width: 20 },
        { header: "roomId", key: "roomId", width: 25 },
        { header: "roomName", key: "roomName", width: 20 },
        { header: "lecturerId", key: "lecturerId", width: 25 },
        { header: "lecturerName", key: "lecturerName", width: 25 },
        { header: "schoolId", key: "schoolId", width: 25 },
        // Exam-specific columns
        { header: "examDate", key: "examDate", width: 20 },
        { header: "examTime", key: "examTime", width: 15 },
        { header: "durationMinute", key: "durationMinute", width: 15 },
        { header: "invigilators", key: "invigilators", width: 30 }
      ];

      const fileName = generateExam
        ? `CombinedSchedule-${selectedIntakeCourse?.intakeId?.intakeName}-${selectedIntakeCourse?.courseId?.courseCode}`
        : `ClassSchedule-${selectedIntakeCourse?.intakeId?.intakeName}-${selectedIntakeCourse?.courseId?.courseCode}`;

      await exportTemplate(combinedColumns, combinedScheduleData, fileName);

      showToast.success("Schedule Templates Generated Successfully", "Excel files have been downloaded. Import them to add schedules to the database.", "schedule-success");

    } catch (error) {
      console.error("Error generating class schedule:", error);
      showToast.error("Generation Failed", error.message || "Unable to generate class or exam schedule", "generation-error");
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        setCsvData(parsedData); // Set state for other UI use
        setIsSubmitting(true);
        showToast.success("File Uploaded", `${parsedData.length} rows extracted`, "id-1");

        // ✅ Process each row here - differentiate by type
        let classCount = 0;
        let examCount = 0;
        let errorCount = 0;

        for (const scheduleData of parsedData) {
          try {
            const scheduleType = scheduleData.type?.toLowerCase();

            if (scheduleType === "class") {
              // Process as class schedule
              const res = await createClassSchedule(scheduleData);
              if (res.success) {
                classCount++;
              } else {
                showToast.error("Error creating class schedule", res.message, `class-error-${classCount}`);
                errorCount++;
              }
            } else if (scheduleType === "exam") {
              // Process as exam schedule - convert invigilators back to array
              const examData = {
                ...scheduleData,
                invigilators: scheduleData.invigilators ? scheduleData.invigilators.split(', ').filter(inv => inv.trim()) : []
              };

              const res = await createExamSchedule(examData);
              if (res.success) {
                examCount++;
              } else {
                showToast.error("Error creating exam schedule", res.message, `exam-error-${examCount}`);
                errorCount++;
              }
            } else {
              showToast.error("Invalid schedule type", `Unknown type: ${scheduleType}. Expected 'class' or 'exam'`, `type-error-${errorCount}`);
              errorCount++;
            }
          } catch (error) {
            console.error("Error processing schedule:", error);
            showToast.error("Processing error", error.message, `process-error-${errorCount}`);
            errorCount++;
          }
        }

        // Show summary
        if (classCount > 0 || examCount > 0) {
          showToast.success(
            "Import completed",
            `Successfully imported: ${classCount} class schedules, ${examCount} exam schedules${errorCount > 0 ? `. ${errorCount} errors occurred.` : ''}`,
            "import-success"
          );
        }

        // Refresh UI for both types
        await fetchClassSchedules();
        await fetchExamSchedules();
      } catch (error) {
        console.error("Error reading file:", error);
        showToast.error("Upload Error", "Invalid Excel format", "id");
      } finally {
        setIsLoading(false);
        onClose2();
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      showToast.error("Read Error", "Failed to read file", "error");
    };

    reader.readAsArrayBuffer(file);
  };


  // Shared helper functions
  const transformExamData = (examData) => {
    return examData.map(exam => {
      const examDate = new Date(exam.examDate);
      const dayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'long' });

      const startTime = exam.examTime;
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate.getTime() + (exam.durationMinute * 60000));
      const endTime = endDate.toTimeString().slice(0, 5);

      return {
        id: exam._id,
        code: exam.moduleId?.code ?? 'N/A',
        subject: exam.moduleId?.moduleName ?? 'Unknown',
        room: exam.roomId?.roomNumber
          ? `${exam.roomId.block || 'Block'} ${exam.roomId.roomNumber}`
          : 'TBD',
        building: exam.roomId?.block ?? 'TBD',
        lecturer: exam.invigilators?.length > 0
          ? `${exam.invigilators.length} Invigilator(s)`
          : 'No Invigilator',
        startTime: startTime,
        endTime: endTime,
        date: examDate.toLocaleDateString(),
        dayOfWeek: dayOfWeek,
        type: "exam",
        examType: "Final",
        duration: `${exam.durationMinute} min`,
        examDate: exam.examDate,
        invigilators: exam.invigilators,
        durationMinute: exam.durationMinute,
        intakeCourseId: exam.intakeCourseId,
        courseId: exam.courseId,
        moduleId: exam.moduleId
      };
    });
  };

  const transformClassData = (classData) => {
    return classData.map(classItem => ({
      id: classItem._id,
      code: classItem.moduleId?.code ?? 'N/A',
      subject: classItem.moduleId?.moduleName ?? 'Unknown',
      room: classItem.roomId?.roomNumber
        ? `${classItem.roomId.block} ${classItem.roomId.roomNumber}`
        : 'TBD',
      building: classItem.roomId?.block ?? 'TBD',
      lecturer: classItem.lecturerId?.userId?.name ?? 'Unassigned',
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      date: new Date().toLocaleDateString(),
      dayOfWeek: classItem.dayOfWeek,
      type: "class",
      examType: "",
      intakeCourseId: classItem.intakeCourseId,
      courseId: classItem.courseId,
      moduleId: classItem.moduleId,
      lecturerId: classItem.lecturerId
    }));
  };


  const getCombinedAndFilteredData = () => {
    let allItems = [];

    if (showClasses && classSchedules) {
      allItems = [...allItems, ...transformClassData(classSchedules)];
    }

    if (showExams && examSchedules) {
      allItems = [...allItems, ...transformExamData(examSchedules)];
    }

    // Apply filters
    return allItems.filter(item => {

      if (!selectedCourse || !selectedIntake) return false


      if (
        (selectedCourse &&
          item.intakeCourseId?.courseId?._id !== selectedCourse) ||
        (selectedIntake &&
          item.intakeCourseId?.intakeId?._id !== selectedIntake)
      ) return false;

      // Filter by semester if selected
      if (selectedSemester && item.semesterId?._id !== selectedSemester) return false;

      if (selectedModule &&
        item.moduleId?._id !== selectedModule) return false


      return true;
    });
  };

  // console.log(classSchedules);
  let allItems = getCombinedAndFilteredData();

  // Download exam schedule template
  const handleDownloadClassTemplate = async () => {
    if (allItems.length > 0) {
      showToast.error("Schedule already existed", "You can either delete all schedule to generate new one; or modify an existing one!", "id2")
      return;
    }


    if (!selectedCourse || !selectedIntake) {
      showToast.error("Please select intake and course to generate template", "", "class-template");
      return;
    }

    if (!selectedSemester) {
      showToast.error("Please select a semester to generate template", "", "semester-template");
      return;
    }

    if (!rooms || rooms.length === 0) {
      showToast.error("No rooms available", "Please add rooms first", "no-rooms");
      return;
    }

    if (!lecturers || lecturers.length === 0) {
      showToast.error("No lecturers available", "Please add lecturers first", "no-lecturers");
      return;
    }

    onOpen(); // Open Chakra UI modal
  };

  useEffect(() => {
    if (triggerDownload) {
      handleDownloadClassTemplate();
      setTriggerDownload(false);
    }
  }, [showClasses, showExams, allItems]);

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify={"space-between"}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Academic Schedule Dashboard
            </Text>
            <Text color="gray.600">View your class schedule and exam timetable in one place</Text>
          </Box>
          <Button colorScheme={"green"}
            onClick={() => onOpen2()}
          >
            Import Schedule
          </Button>
        </HStack>

        {/* Export Template Section */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>

            <HStack justify="space-between" align="end" flexWrap="wrap" spacing={4}>
              <HStack spacing={4} flex={1}>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">
                    <Badge colorScheme="green">Intake</Badge>
                  </FormLabel>
                  <Select
                    placeholder="Select Intake"
                    value={selectedIntake}
                    onChange={e => {
                      setSelectedIntake(e.target.value);
                      setSelectedCourse("");
                      setSelectedModule("");
                      setSelectedSemester("");
                      setAvailableSemesters([]);
                      setCurrentSemesterIndex(0);
                    }}
                  >
                    {intakeCourses?.map(intakeCourse => (
                      <option key={intakeCourse._id} value={intakeCourse.intakeId._id}>
                        {intakeCourse.intakeId.intakeName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW="300px">
                  <FormLabel fontSize="sm">
                    <Badge colorScheme="blue">Course</Badge>
                  </FormLabel>
                  <Select
                    disabled={selectedIntake === ""}
                    placeholder="Select Course"
                    value={selectedCourse}
                    onChange={e => {
                      setSelectedCourse(e.target.value);
                      setSelectedSemester("");
                      setAvailableSemesters([]);
                      setCurrentSemesterIndex(0);
                    }}
                  >
                    {intakeCourses?.map(intakeCourse => {
                      if (intakeCourse.intakeId._id === selectedIntake) {
                        return (
                          <option key={intakeCourse._id} value={intakeCourse.courseId._id}>
                            {intakeCourse.courseId.courseName}
                          </option>
                        );
                      }
                      return null;
                    })}
                  </Select>
                </FormControl>

                <FormControl maxW="250px">
                  <FormLabel fontSize="sm">
                    <Badge colorScheme="purple">Semester</Badge>
                  </FormLabel>
                  <Select
                    disabled={selectedCourse === "" || selectedIntake === "" || availableSemesters.length === 0}
                    placeholder="Select Semester"
                    value={selectedSemester}
                    onChange={e => setSelectedSemester(e.target.value)}
                  >
                    {availableSemesters?.map(semester => (
                      <option key={semester._id} value={semester._id}>
                        {semester.semesterName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW="300px">
                  <FormLabel fontSize="sm">
                    <Badge>Module (Optional)</Badge>
                  </FormLabel>
                  <Select
                    disabled={selectedCourse === "" || selectedIntake === ""}
                    placeholder="Select Module"
                    value={selectedCourse === "" || selectedIntake === "" ? "" : selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
                  >
                    {modules?.filter(m => {
                      return m.courseId.some(c => c._id === selectedCourse);
                    }).map(m => (
                      <option key={m._id} value={m._id}>
                        {m.moduleName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

              </HStack>

              <VStack>
                <Button
                  leftIcon={allItems.length > 0 ? "" : <FiRefreshCcw />}
                  colorScheme={allItems.length > 0 ? "gray" : "blue"}
                  onClick={() => {
                    setShowClasses(true);
                    setShowExams(true);
                    setTriggerDownload(true);
                  }}
                  isDisabled={!selectedCourse || !selectedIntake || !selectedSemester || allItems.length > 0}
                >                  {(allItems.length > 0) ? "Schedule for selected intake course existed" : "Generate"}
                </Button>
              </VStack>
            </HStack>

            {(!selectedCourse || !selectedIntake || !selectedSemester) && (
              <Text color="gray.500" fontSize="sm" mt={2}>
                Select an intake, course, and semester to download/ generate class schedule template
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Main Content */}

        <HStack justify="space-between">
          <HStack>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button colorScheme={viewMode === "weekly" ? "blue" : "gray"} onClick={() => setViewMode("weekly")}>
                Weekly View
              </Button>
              <Button colorScheme={viewMode === "list" ? "blue" : "gray"} onClick={() => setViewMode("list")}>
                List View
              </Button>
            </ButtonGroup>
            <Badge colorScheme={"purple"}>{allItems.filter(i => i.type == "class").length} classes</Badge>
            <Badge colorScheme={"red"}>{allItems.filter(i => i.type == "exam").length} exams</Badge>
          </HStack>

          <VStack>
            <ButtonGroup display="flex" alignItems="center" gap={2}>
              <Button
                size="sm"
                disabled={availableSemesters.length === 0 || currentSemesterIndex === 0}
                onClick={() => {
                  if (currentSemesterIndex > 0) {
                    const newIndex = currentSemesterIndex - 1;
                    setCurrentSemesterIndex(newIndex);
                    setSelectedSemester(availableSemesters[newIndex]._id);
                  }
                }}
              >
                <GrLinkPrevious />
              </Button>
              <VStack>
                <Text>Semester Navigation</Text>
                <Text p={1} minW="60px" textAlign="center">
                  {availableSemesters.length > 0 && selectedSemester
                    ? availableSemesters.find(s => s._id === selectedSemester)?.semesterNumber || "N/A"
                    : "N/A"
                  }
                </Text>
              </VStack>
              <Button
                size="sm"
                disabled={availableSemesters.length === 0 || currentSemesterIndex === availableSemesters.length - 1}
                onClick={() => {
                  if (currentSemesterIndex < availableSemesters.length - 1) {
                    const newIndex = currentSemesterIndex + 1;
                    setCurrentSemesterIndex(newIndex);
                    setSelectedSemester(availableSemesters[newIndex]._id);
                  }
                }}
              >
                <GrLinkNext />
              </Button>
            </ButtonGroup>
            {availableSemesters.length > 0 && selectedSemester && (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                {availableSemesters.find(s => s._id === selectedSemester)?.semesterName}
              </Text>
            )}
          </VStack>

          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              colorScheme={showExams ? "blue" : "gray"}
              onClick={() => setShowExams(!showExams)}
            >
              Exams
            </Button>
            <Button
              colorScheme={showClasses ? "blue" : "gray"}
              onClick={() => setShowClasses(!showClasses)}
            >
              Classes
            </Button>
          </ButtonGroup>
        </HStack>


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
                    })) || [];

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
                                  onClick={() => handleEditClick(item)}
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
                    );
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
                  filter={{
                    selectedIntake: selectedIntake,
                    selectedCourse: selectedCourse,
                    selectedModule: selectedModule,
                  }}
                  onEditClick={handleEditClick}
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
            filter={{
              selectedIntake: selectedIntake,
              selectedCourse: selectedCourse,
              selectedModule: selectedModule,
            }}
            getTypeColor={getTypeColor}
            onEditClick={handleEditClick}
          />
        )}
      </VStack>

      {/* Single Modal for Editing */}
      <UpdateScheduleModal
        schedule={selectedSchedule}
        isOpenEdit={isModalOpen}
        onCloseEdit={handleModalClose}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule Generation Info</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>
              This will generate an <strong>Excel template file</strong> for class schedules.
            </Text>
            <Text mb={2}>
              Each module will have <strong>2 classes per week</strong> for 12 weeks.
            </Text>
            <Text mb={2}>
              <strong>Lecturers and rooms are assigned randomly</strong> for now.
            </Text>
            <Text mb={2}>
              <strong>Note:</strong> If you check "Include Exam Schedule", both class and exam schedules will be combined in a single Excel file with a "type" column to differentiate them.
            </Text>
            <Text mb={2}>
              <strong>Import:</strong> You will need to import the generated Excel file to add schedules to the database.
            </Text>
            <Text>
              Do you wish to proceed?
            </Text>
            <Checkbox
              mt={3}
              isChecked={generateExam}
              onChange={(e) => setGenerateExam(e.target.checked)}
            >
              Include Exam Schedule
            </Checkbox>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={proceedGenerateSchedule}>
              Yes, Proceed
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen2} onClose={onClose2} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Student Results (CSV)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">CSV Format Required:</AlertTitle>
                  <AlertDescription fontSize="sm">
                    dayOfWeek,	startTime,	endTime,	moduleStartDate,	moduleEndDate,	roomId, lecturerId
                  </AlertDescription>
                </Box>
              </Alert>
              <FormControl>
                <FormLabel>Select CSV File</FormLabel>
                <Input
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  p={1}
                  border="2px dashed"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                />
              </FormControl>
              {isLoading && (
                <Center py={4}>
                  <VStack>
                    <Spinner color="blue.500" />
                    <Text fontSize="sm" color="gray.600">
                      Processing CSV file...
                    </Text>
                  </VStack>
                </Center>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={() => fileInputRef.current?.click()} isDisabled={isLoading}>
              Choose File
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


    </Box>
  )
}
