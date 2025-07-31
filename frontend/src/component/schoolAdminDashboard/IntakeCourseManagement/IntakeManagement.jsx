import {
  Box,
  Button,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  Select,
  HStack,
  VStack,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Grid,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiDownload, FiCalendar, FiBook } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../../store/academic.js";
import { useShowToast } from "../../../store/utils/toast.js";
import ComfirmationMessage from "../../common/ComfirmationMessage.jsx";
import TitleInputList from "../../common/TitleInputList.jsx";
import MultiSelectPopover from "../../common/MultiSelectPopover.jsx";

export function IntakeManagement() {
  const {
    intakes,
    createIntake,
    updateIntake,
    deleteIntake,
    fetchIntakes,
    courses,
    fetchCourses,
    intakeCourses,
    fetchIntakeCourses,
    createIntakeCourse,
    updateIntakeCourse,
    deleteIntakeCourse
  } = useAcademicStore()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure()
  const showToast = useShowToast();

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [monthFilter, setMonthFilter] = useState("All")
  const [selectedIntake, setSelectedIntake] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    intakeName: "",
    intakeMonth: "",
    registrationStartDate: "",
    registrationEndDate: "",
    orientationDate: "",
    academicEvents: [],
    isActive: true,
    status: "planning",
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [intakeToDelete, setIntakeToDelete] = useState(null);

  // Course assignment state
  const [assignFormData, setAssignFormData] = useState({
    intakeId: "",
    courseIds: [],
    maxStudents: 30,
    feeStructure: {
      localStudent: 0,
      internationalStudent: 0
    },
    duration: 36,
    maxDuration: 48,
    requirements: [],
    status: "available"
  });

  // IntakeCourse editing state
  const [currentIntakeCourses, setCurrentIntakeCourses] = useState([]);
  const [selectedIntakeCourseIndex, setSelectedIntakeCourseIndex] = useState(-1);
  const [isEditMode, setIsEditMode] = useState(false);

  // Academic event state
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    type: "holiday",
    description: ""
  });

  useEffect(() => {
    if (intakes.length === 0) {
      fetchIntakes();
    }
    if (courses.length === 0) {
      fetchCourses();
    }
    if (intakeCourses.length === 0) {
      fetchIntakeCourses();
    }
  }, [])

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const filteredIntakes = intakes.filter((intake) => {
    if (!intake) return false;

    const intakeName = intake.intakeName || "";
    const intakeMonth = intake.intakeMonth || "";

    const matchesSearch =
      intakeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intakeMonth.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || intake.status === statusFilter
    const matchesMonth = monthFilter === "All" || intake.intakeMonth === monthFilter

    return matchesSearch && matchesStatus && matchesMonth
  })

  const getIntakeCoursesForIntake = (intakeId) => {
    return intakeCourses.filter(ic => ic.intakeId?._id === intakeId);
  }

  const handleSubmit = async () => {
    if (!formData.intakeName || !formData.intakeMonth || !formData.registrationStartDate || !formData.registrationEndDate) {
      showToast.error("Error", "Please fill in all required fields", "intake-validation");
      return
    }

    // Validate dates
    const regStart = new Date(formData.registrationStartDate);
    const regEnd = new Date(formData.registrationEndDate);

    if (regEnd <= regStart) {
      showToast.error("Error", "Registration end date must be after start date", "date-validation");
      return;
    }

    if (isEditing) {
      if (!selectedIntake || !selectedIntake._id) {
        showToast.error("Error", "No intake selected for editing", "intake-edit-error");
        return;
      }

      const res = await updateIntake(selectedIntake._id, formData)
      if (!res || !res.success) {
        showToast.error("Error", res.message, "id-2")
        return;
      }

      showToast.success("Success", "Intake updated successfully", "intake-update");
    } else {
      const newIntake = {
        intakeName: formData.intakeName,
        intakeMonth: formData.intakeMonth,
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
        orientationDate: formData.orientationDate,
        academicEvents: formData.academicEvents,
        isActive: formData.isActive,
        status: formData.status,
      };
      const res = await createIntake(newIntake)
      if (!res || !res.success) {
        showToast.error("Error", res.message, "id-2")
        return;
      }
      showToast.success("Success", "Intake added successfully", "intake-add");
    }

    await fetchIntakes();
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormData({
      intakeName: "",
      intakeMonth: "",
      registrationStartDate: "",
      registrationEndDate: "",
      orientationDate: "",
      academicEvents: [],
      isActive: true,
      status: "planning",
    })
    setSelectedIntake(null)
    setIsEditing(false)
  }

  const resetAssignForm = () => {
    setAssignFormData({
      intakeId: "",
      courseIds: [],
      maxStudents: 30,
      feeStructure: {
        localStudent: 0,
        internationalStudent: 0
      },
      duration: 36,
      maxDuration: 48,
      requirements: [],
      status: "available"
    });
    setCurrentIntakeCourses([]);
    setSelectedIntakeCourseIndex(-1);
    setIsEditMode(false);
  }

  const handleEdit = (intake) => {
    if (!intake) {
      showToast.error("Error", "Invalid intake data", "intake-edit-error");
      return;
    }

    setSelectedIntake(intake)
    setFormData({
      intakeName: intake.intakeName || "",
      intakeMonth: intake.intakeMonth || "",
      registrationStartDate: intake.registrationStartDate ? intake.registrationStartDate.split('T')[0] : "",
      registrationEndDate: intake.registrationEndDate ? intake.registrationEndDate.split('T')[0] : "",
      orientationDate: intake.orientationDate ? intake.orientationDate.split('T')[0] : "",
      academicEvents: intake.academicEvents || [],
      isActive: intake.isActive !== undefined ? intake.isActive : true,
      status: intake.status || "planning",
    });
    setIsEditing(true)
    onOpen()
  }

  const handleView = (intake) => {
    if (!intake) {
      showToast.error("Error", "Invalid intake data", "intake-view-error");
      return;
    }

    setSelectedIntake(intake)
    onViewOpen()
  }

  const handleAssignCourses = (intake) => {
    const existingIntakeCourses = getIntakeCoursesForIntake(intake._id);

    setCurrentIntakeCourses(existingIntakeCourses);
    setSelectedIntake(intake);

    if (existingIntakeCourses.length > 0) {
      // Load first existing intakeCourse
      setSelectedIntakeCourseIndex(0);
      loadIntakeCourseData(existingIntakeCourses[0]);
      setIsEditMode(true);
    } else {
      // No existing courses, start in create mode
      setSelectedIntakeCourseIndex(-1);
      setIsEditMode(false);
      setAssignFormData(prev => ({
        ...prev,
        intakeId: intake._id,
        courseIds: [],
        maxStudents: 30,
        feeStructure: {
          localStudent: 0,
          internationalStudent: 0
        },
        duration: 36,
        maxDuration: 48,
        requirements: [],
        status: "available"
      }));
    }

    onAssignOpen();
  }

  const loadIntakeCourseData = (intakeCourse) => {
    setAssignFormData(prev => ({
      ...prev,
      intakeId: intakeCourse.intakeId._id || intakeCourse.intakeId,
      courseIds: [intakeCourse.courseId._id || intakeCourse.courseId],
      maxStudents: intakeCourse.maxStudents,
      feeStructure: {
        localStudent: intakeCourse.feeStructure.localStudent,
        internationalStudent: intakeCourse.feeStructure.internationalStudent
      },
      duration: intakeCourse.duration || 36,
      maxDuration: intakeCourse.maxDuration,
      requirements: intakeCourse.requirements || [],
      status: intakeCourse.status
    }));
  }

  const handleToggleIntakeCourse = (index) => {
    if (index === -1) {
      // Switch to create new mode
      setSelectedIntakeCourseIndex(-1);
      setIsEditMode(false);
      setAssignFormData(prev => ({
        ...prev,
        courseIds: [],
        maxStudents: 30,
        feeStructure: {
          localStudent: 0,
          internationalStudent: 0
        },
        duration: 36,
        maxDuration: 48,
        requirements: [],
        status: "available"
      }));
    } else {
      // Switch to edit existing mode
      setSelectedIntakeCourseIndex(index);
      setIsEditMode(true);
      loadIntakeCourseData(currentIntakeCourses[index]);
    }
  }

  const handleCourseAssignment = async () => {
    if (!assignFormData.intakeId || assignFormData.courseIds.length === 0) {
      showToast.error("Error", "Please select intake and at least one course", "assignment-validation");
      return;
    }

    if (!assignFormData.feeStructure.localStudent || !assignFormData.feeStructure.internationalStudent) {
      showToast.error("Error", "Please set fee structure for both local and international students", "fee-validation");
      return;
    }

    try {
      if (isEditMode && selectedIntakeCourseIndex !== -1) {
        // Update existing IntakeCourse
        const currentIntakeCourse = currentIntakeCourses[selectedIntakeCourseIndex];
        const intakeCourseData = {
          intakeId: assignFormData.intakeId,
          courseId: assignFormData.courseIds[0], // Only one course in edit mode
          maxStudents: parseInt(assignFormData.maxStudents),
          currentEnrollment: currentIntakeCourse.currentEnrollment, // Keep existing enrollment
          feeStructure: {
            localStudent: parseFloat(assignFormData.feeStructure.localStudent),
            internationalStudent: parseFloat(assignFormData.feeStructure.internationalStudent)
          },
          duration: parseInt(assignFormData.duration),
          maxDuration: parseInt(assignFormData.maxDuration),
          requirements: assignFormData.requirements,
          isActive: true,
          status: assignFormData.status
        };

        const res = await updateIntakeCourse(currentIntakeCourse._id, intakeCourseData);
        if (!res || !res.success) {
          showToast.error("Error", `Failed to update course: ${res.message}`, "update-error");
          return;
        }

        showToast.success("Success", "Successfully updated course assignment", "update-success");
      } else {
        // Create IntakeCourse for each selected course
        for (const courseId of assignFormData.courseIds) {
          const intakeCourseData = {
            intakeId: assignFormData.intakeId,
            courseId: courseId,
            maxStudents: parseInt(assignFormData.maxStudents),
            currentEnrollment: 0,
            feeStructure: {
              localStudent: parseFloat(assignFormData.feeStructure.localStudent),
              internationalStudent: parseFloat(assignFormData.feeStructure.internationalStudent)
            },
            duration: parseInt(assignFormData.duration),
            maxDuration: parseInt(assignFormData.maxDuration),
            requirements: assignFormData.requirements,
            isActive: true,
            status: assignFormData.status
          };

          const res = await createIntakeCourse(intakeCourseData);
          if (!res || !res.success) {
            showToast.error("Error", `Failed to assign course: ${res.message}`, "assignment-error");
            return;
          }
        }

        showToast.success("Success", `Successfully assigned ${assignFormData.courseIds.length} course(s) to intake`, "assignment-success");
      }

      await fetchIntakeCourses();
      resetAssignForm();
      onAssignClose();
    } catch (error) {
      showToast.error("Error", isEditMode ? "Failed to update course" : "Failed to assign courses", "operation-error");
    }
  }

  const openDeleteDialog = (intakeId) => {
    setIntakeToDelete(intakeId);
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
    setIntakeToDelete(null);
  };

  const handleDelete = async () => {
    if (!intakeToDelete) {
      showToast.error("Error", "Invalid intake ID", "intake-delete-error");
      return;
    }
    await deleteIntake(intakeToDelete);
    showToast.success("Success", "Intake deleted successfully", "intake-delete");
    fetchIntakes();
    closeDeleteDialog();
  };

  const addAcademicEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.type) {
      showToast.error("Error", "Please fill in all event fields", "event-validation");
      return;
    }

    const event = {
      ...newEvent,
      date: new Date(newEvent.date).toISOString()
    };

    setFormData(prev => ({
      ...prev,
      academicEvents: [...prev.academicEvents, event]
    }));

    setNewEvent({
      name: "",
      date: "",
      type: "holiday",
      description: ""
    });
  };

  const removeAcademicEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      academicEvents: prev.academicEvents.filter((_, i) => i !== index)
    }));
  };

  const exportIntakes = () => {
    const csvContent = [
      ["Intake Name", "Month", "Registration Start", "Registration End", "Status", "Courses Count"],
      ...filteredIntakes.map((intake) => [
        intake.intakeName || "N/A",
        intake.intakeMonth || "N/A",
        intake.registrationStartDate ? new Date(intake.registrationStartDate).toLocaleDateString() : "N/A",
        intake.registrationEndDate ? new Date(intake.registrationEndDate).toLocaleDateString() : "N/A",
        intake.status || "N/A",
        getIntakeCoursesForIntake(intake._id).length
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "intakes.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Intake Management
            </Text>
            <Text color="gray.600">Manage student intake periods and course assignments</Text>
          </Box>
          <HStack>
            <Button leftIcon={<FiDownload />} variant="outline" onClick={exportIntakes}>
              Export
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => {
                resetForm()
                onOpen()
              }}
            >
              Add Intake
            </Button>
          </HStack>
        </HStack>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
              <InputGroup>
                <InputLeftElement>
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search intakes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="planning">Planning</option>
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
              <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="All">All Months</option>
                <option value="January">January</option>
                <option value="May">May</option>
                <option value="September">September</option>
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Intakes Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
              Intakes ({filteredIntakes.length})
            </Text>

            {/* Desktop Table View */}
            <Box display={{ base: "none", lg: "block" }}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Intake Name</Th>
                    <Th>Month</Th>
                    <Th>Registration Period</Th>
                    <Th>Status</Th>
                    <Th>Courses</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredIntakes.map((intake) => {
                    if (!intake) return null;
                    const assignedCourses = getIntakeCoursesForIntake(intake._id);

                    return (
                      <Tr key={intake._id}>
                        <Td>
                          <Box>
                            <Text fontWeight="medium">{intake.intakeName}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {intake.isActive ? "Active" : "Inactive"}
                            </Text>
                          </Box>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple">{intake.intakeMonth}</Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">
                              Start: {intake.registrationStartDate ? new Date(intake.registrationStartDate).toLocaleDateString() : "N/A"}
                            </Text>
                            <Text fontSize="sm">
                              End: {intake.registrationEndDate ? new Date(intake.registrationEndDate).toLocaleDateString() : "N/A"}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              intake.status === "completed" ? "green" :
                                intake.status === "in_progress" ? "blue" :
                                  intake.status === "registration_open" ? "orange" :
                                    intake.status === "registration_closed" ? "red" : "gray"
                            }
                          >
                            {intake.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <Badge colorScheme={assignedCourses.length > 0 ? "green" : "red"}>
                              {assignedCourses.length} courses
                            </Badge>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FiBook />}
                              onClick={() => handleAssignCourses(intake)}
                            >
                              Assign
                            </Button>
                          </HStack>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                            <MenuList>
                              <MenuItem icon={<FiEye />} onClick={() => handleView(intake)}>
                                View Details
                              </MenuItem>
                              <MenuItem icon={<FiEdit />} onClick={() => handleEdit(intake)}>
                                Edit
                              </MenuItem>
                              <MenuItem icon={<FiBook />} onClick={() => handleAssignCourses(intake)}>
                                Assign Courses
                              </MenuItem>
                              <MenuItem icon={<FiTrash2 />} onClick={() => openDeleteDialog(intake._id)} color="red.500">
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* Mobile Accordion View */}
            <Box display={{ base: "block", lg: "none" }}>
              <Accordion allowMultiple>
                {filteredIntakes.map((intake) => {
                  if (!intake) return null;
                  const assignedCourses = getIntakeCoursesForIntake(intake._id);

                  return (
                    <AccordionItem key={intake._id}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            <Text fontWeight="medium">{intake.intakeName}</Text>
                            <Text fontSize="sm" color="gray.600">{intake.intakeMonth}</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={3} align="stretch">
                          <Box>
                            <Text fontWeight="semibold">Status:</Text>
                            <Badge colorScheme={intake.status === "completed" ? "green" : "blue"}>
                              {intake.status}
                            </Badge>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Registration Period:</Text>
                            <Text fontSize="sm">
                              {intake.registrationStartDate ? new Date(intake.registrationStartDate).toLocaleDateString() : "N/A"} -
                              {intake.registrationEndDate ? new Date(intake.registrationEndDate).toLocaleDateString() : "N/A"}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Assigned Courses:</Text>
                            <Badge colorScheme={assignedCourses.length > 0 ? "green" : "red"}>
                              {assignedCourses.length} courses
                            </Badge>
                          </Box>
                          <HStack spacing={2} justify="center" pt={2}>
                            <Button size="sm" colorScheme="blue" onClick={() => handleView(intake)}>
                              <FiEye />
                            </Button>
                            <Button size="sm" colorScheme="blue" onClick={() => handleEdit(intake)}>
                              <FiEdit />
                            </Button>
                            <Button size="sm" colorScheme="green" onClick={() => handleAssignCourses(intake)}>
                              <FiBook />
                            </Button>
                            <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(intake._id)}>
                              <FiTrash2 />
                            </Button>
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </Box>
          </CardBody>
        </Card>

        {/* Add/Edit Intake Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent maxW="4xl">
            <ModalHeader>{isEditing ? "Edit Intake" : "Add New Intake"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>Basic Information</Tab>
                  <Tab>Academic Events</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Grid templateColumns="1fr 1fr" gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Intake Name</FormLabel>
                        <Input
                          value={formData.intakeName}
                          onChange={(e) => setFormData({ ...formData, intakeName: e.target.value })}
                          placeholder="January 2024 Intake"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Intake Month</FormLabel>
                        <Select
                          value={formData.intakeMonth}
                          onChange={(e) => setFormData({ ...formData, intakeMonth: e.target.value })}
                        >
                          <option value="">Select Month</option>
                          <option value="January">January</option>
                          <option value="May">May</option>
                          <option value="September">September</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Registration Start Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.registrationStartDate}
                          onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Registration End Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.registrationEndDate}
                          onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Orientation Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.orientationDate}
                          onChange={(e) => setFormData({ ...formData, orientationDate: e.target.value })}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="planning">Planning</option>
                          <option value="registration_open">Registration Open</option>
                          <option value="registration_closed">Registration Closed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Active Status</FormLabel>
                        <Select
                          value={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </Select>
                      </FormControl>
                    </Grid>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="semibold">Add Academic Event</Text>
                      <Grid templateColumns="1fr 1fr 1fr" gap={4}>
                        <FormControl>
                          <FormLabel>Event Name</FormLabel>
                          <Input
                            value={newEvent.name}
                            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                            placeholder="Mid-Term Break"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Event Date</FormLabel>
                          <Input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Event Type</FormLabel>
                          <Select
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                          >
                            <option value="holiday">Holiday</option>
                            <option value="exam">Exam</option>
                            <option value="break">Break</option>
                            <option value="registration">Registration</option>
                            <option value="orientation">Orientation</option>
                          </Select>
                        </FormControl>
                      </Grid>
                      <FormControl>
                        <FormLabel>Event Description</FormLabel>
                        <Textarea
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Event description..."
                          rows={2}
                        />
                      </FormControl>
                      <Button colorScheme="green" onClick={addAcademicEvent} leftIcon={<FiPlus />}>
                        Add Event
                      </Button>

                      <Divider />

                      <Text fontWeight="semibold">Academic Events ({formData.academicEvents.length})</Text>
                      {formData.academicEvents.map((event, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Text fontWeight="medium">{event.name}</Text>
                                  <Badge colorScheme="blue">{event.type}</Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(event.date).toLocaleDateString()}
                                </Text>
                                {event.description && (
                                  <Text fontSize="sm">{event.description}</Text>
                                )}
                              </VStack>
                              <IconButton
                                icon={<FiTrash2 />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAcademicEvent(index)}
                              />
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit}>
                {isEditing ? "Update" : "Add"} Intake
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Intake Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Intake Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedIntake && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Box>
                      <Text fontSize="xl" fontWeight="bold">
                        {selectedIntake.intakeName}
                      </Text>
                      <HStack>
                        <Badge colorScheme="purple">{selectedIntake.intakeMonth}</Badge>
                        <Badge colorScheme={selectedIntake.isActive ? "green" : "red"}>
                          {selectedIntake.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge colorScheme="blue">{selectedIntake.status}</Badge>
                      </HStack>
                    </Box>
                  </HStack>

                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                      <Text fontWeight="semibold">Registration Period:</Text>
                      <Text fontSize="sm">
                        {selectedIntake.registrationStartDate ? new Date(selectedIntake.registrationStartDate).toLocaleDateString() : "N/A"} -
                        {selectedIntake.registrationEndDate ? new Date(selectedIntake.registrationEndDate).toLocaleDateString() : "N/A"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Orientation Date:</Text>
                      <Text>{selectedIntake.orientationDate ? new Date(selectedIntake.orientationDate).toLocaleDateString() : "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Examination Period:</Text>
                      <Text fontSize="sm">
                        {selectedIntake.examinationStartDate ? new Date(selectedIntake.examinationStartDate).toLocaleDateString() : "N/A"} -
                        {selectedIntake.examinationEndDate ? new Date(selectedIntake.examinationEndDate).toLocaleDateString() : "N/A"}
                      </Text>
                    </Box>
                  </Grid>

                  <Box>
                    <Text fontWeight="semibold">Assigned Courses:</Text>
                    <HStack wrap="wrap" mt={2}>
                      {getIntakeCoursesForIntake(selectedIntake._id).map((ic) => (
                        <Badge key={ic._id} colorScheme="green">
                          {ic.courseId?.courseName || "Unknown Course"}
                        </Badge>
                      ))}
                      {getIntakeCoursesForIntake(selectedIntake._id).length === 0 && (
                        <Text color="gray.500">No courses assigned</Text>
                      )}
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontWeight="semibold">Academic Events ({selectedIntake.academicEvents?.length || 0}):</Text>
                    <VStack align="stretch" mt={2}>
                      {(selectedIntake.academicEvents || []).map((event, index) => (
                        <Card key={index} variant="outline" size="sm">
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Text fontWeight="medium" fontSize="sm">{event.name}</Text>
                                  <Badge size="sm" colorScheme="blue">{event.type}</Badge>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                  {new Date(event.date).toLocaleDateString()}
                                </Text>
                                {event.description && (
                                  <Text fontSize="xs">{event.description}</Text>
                                )}
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                      {(!selectedIntake.academicEvents || selectedIntake.academicEvents.length === 0) && (
                        <Text color="gray.500" fontSize="sm">No academic events scheduled</Text>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Assign Courses Modal */}
        <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isEditMode ? "Edit IntakeCourse Assignment" : "Assign Courses to Intake"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold">Intake:</Text>
                  <Text>{selectedIntake?.intakeName}</Text>
                </Box>

                {/* IntakeCourse Toggle Navigation */}
                {currentIntakeCourses.length > 0 && (
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      {isEditMode ? "Edit IntakeCourse" : "Create New IntakeCourse"}
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {currentIntakeCourses.map((ic, index) => {
                        const course = courses.find(c => c._id === (ic.courseId._id || ic.courseId));
                        return (
                          <Button
                            key={ic._id}
                            size="sm"
                            variant={selectedIntakeCourseIndex === index ? "solid" : "outline"}
                            colorScheme={selectedIntakeCourseIndex === index ? "blue" : "gray"}
                            onClick={() => handleToggleIntakeCourse(index)}
                          >
                            {course?.courseName || "Unknown Course"}
                          </Button>
                        );
                      })}
                      <Button
                        size="sm"
                        variant={selectedIntakeCourseIndex === -1 ? "solid" : "outline"}
                        colorScheme={selectedIntakeCourseIndex === -1 ? "green" : "gray"}
                        onClick={() => handleToggleIntakeCourse(-1)}
                        leftIcon={<FiPlus />}
                      >
                        Add New
                      </Button>
                    </HStack>
                  </Box>
                )}

                <FormControl isRequired>
                  {isEditMode ? (
                    <>
                      <FormLabel>Select Course</FormLabel>
                      <Text>{courses.filter(c => c._id == assignFormData.courseIds[0])[0].courseName}</Text>
                    </>

                  ) : (
                    <>
                      <FormLabel>Select Course</FormLabel>
                      <Select
                        value={assignFormData.courseIds[0] || ""}
                        onChange={(e) => setAssignFormData(prev => ({ ...prev, courseIds: [e.target.value] }))}
                      >
                        <option value="">Select a course...</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.courseName}
                          </option>
                        ))}
                      </Select>
                    </>
                  )}
                </FormControl>

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FormControl isRequired>
                    <FormLabel>Max Students</FormLabel>
                    <Input
                      type="number"
                      value={assignFormData.maxStudents}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                      min="1"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={assignFormData.status}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="available">Available</option>
                      <option value="full">Full</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Duration (Months)</FormLabel>
                    <Input
                      type="number"
                      value={assignFormData.duration}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, duration: e.target.value }))}
                      min="1"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Max Duration (Months)</FormLabel>
                    <Input
                      type="number"
                      value={assignFormData.maxDuration}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
                      min="1"
                    />
                  </FormControl>
                </Grid>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Fee Structure</Text>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormControl isRequired>
                      <FormLabel>Local Student Fee (RM)</FormLabel>
                      <Input
                        type="number"
                        value={assignFormData.feeStructure.localStudent}
                        onChange={(e) => setAssignFormData(prev => ({
                          ...prev,
                          feeStructure: { ...prev.feeStructure, localStudent: e.target.value }
                        }))}
                        min="0"
                        step="0.01"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>International Student Fee (RM)</FormLabel>
                      <Input
                        type="number"
                        value={assignFormData.feeStructure.internationalStudent}
                        onChange={(e) => setAssignFormData(prev => ({
                          ...prev,
                          feeStructure: { ...prev.feeStructure, internationalStudent: e.target.value }
                        }))}
                        min="0"
                        step="0.01"
                      />
                    </FormControl>
                  </Grid>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => {
                resetAssignForm();
                onAssignClose();
              }}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleCourseAssignment}>
                {isEditMode ? "Update IntakeCourse" : "Assign Courses"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>

      <ComfirmationMessage
        title="Confirm delete intake?"
        description="This intake will be permanently deleted and cannot be restored. All associated course assignments will also be removed."
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </Box>
  )
}