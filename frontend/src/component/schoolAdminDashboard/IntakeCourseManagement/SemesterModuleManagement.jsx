import {
  Box,
  Text,
  VStack,
  HStack,
  Grid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  Icon,
  Card,
  CardBody,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Input,
  Select,
  Textarea,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAcademicStore } from "../../../store/academic";
import { FiRefreshCw, FiPlus, FiEdit, FiTrash2, FiEye, FiMoreVertical, FiCalendar, FiBookOpen } from "react-icons/fi";

export function SemesterModuleManagement() {
  const { 
    semesters, 
    fetchSemestersBySchoolId, 
    modules, 
    fetchModulesBySchoolId,
    intakeCourses,
    fetchIntakeCoursesBySchoolId,
    createSemester,
    updateSemester,
    deleteSemester
  } = useAcademicStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [semesterForm, setSemesterForm] = useState({
    courseId: '',
    semesterNumber: '',
    year: '',
    semesterName: '',
    startDate: '',
    endDate: '',
    durationMonths: '',
    registrationStartDate: '',
    registrationEndDate: '',
    registrationDurationDays: '',
    examStartDate: '',
    examEndDate: '',
    examDurationDays: '',
    status: 'upcoming',
    description: '',
    academicCalendar: []
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (semesters.length === 0) {
      fetchSemestersBySchoolId();
    }
    if (modules.length === 0) {
      fetchModulesBySchoolId();
    }
    if (intakeCourses.length === 0) {
      fetchIntakeCoursesBySchoolId();
    }
  }, []);

  const resetForm = () => {
    setSemesterForm({
      courseId: '',
      semesterNumber: '',
      year: '',
      semesterName: '',
      startDate: '',
      endDate: '',
      durationMonths: '',
      registrationStartDate: '',
      registrationEndDate: '',
      registrationDurationDays: '',
      examStartDate: '',
      examEndDate: '',
      examDurationDays: '',
      status: 'upcoming',
      description: '',
      academicCalendar: []
    });
  };

  const handleOpenModal = (semester = null) => {
    if (semester) {
      setSelectedSemester(semester);
      setIsEditMode(true);
      setSemesterForm({
        courseId: semester.courseId._id || semester.courseId,
        semesterNumber: semester.semesterNumber?.toString() || '',
        year: semester.year?.toString() || '',
        semesterName: semester.semesterName || '',
        startDate: semester.startDate ? new Date(semester.startDate).toISOString().split('T')[0] : '',
        endDate: semester.endDate ? new Date(semester.endDate).toISOString().split('T')[0] : '',
        durationMonths: semester.durationMonths?.toString() || '',
        registrationStartDate: semester.registrationStartDate ? new Date(semester.registrationStartDate).toISOString().split('T')[0] : '',
        registrationEndDate: semester.registrationEndDate ? new Date(semester.registrationEndDate).toISOString().split('T')[0] : '',
        registrationDurationDays: semester.registrationDurationDays?.toString() || '',
        examStartDate: semester.examStartDate ? new Date(semester.examStartDate).toISOString().split('T')[0] : '',
        examEndDate: semester.examEndDate ? new Date(semester.examEndDate).toISOString().split('T')[0] : '',
        examDurationDays: semester.examDurationDays?.toString() || '',
        status: semester.status || 'upcoming',
        description: semester.description || '',
        academicCalendar: semester.academicCalendar || []
      });
    } else {
      setSelectedSemester(null);
      setIsEditMode(false);
      resetForm();
    }
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    resetForm();
    setSelectedSemester(null);
    setIsEditMode(false);
  };

  const handleFormChange = (field, value) => {
    setSemesterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!semesterForm.courseId || !semesterForm.semesterNumber || !semesterForm.year || 
        !semesterForm.semesterName || !semesterForm.startDate || !semesterForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const semesterData = {
        ...semesterForm,
        semesterNumber: parseInt(semesterForm.semesterNumber),
        year: parseInt(semesterForm.year),
        durationMonths: semesterForm.durationMonths ? parseInt(semesterForm.durationMonths) : undefined,
        registrationDurationDays: semesterForm.registrationDurationDays ? parseInt(semesterForm.registrationDurationDays) : undefined,
        examDurationDays: semesterForm.examDurationDays ? parseInt(semesterForm.examDurationDays) : undefined
      };

      let result;
      if (isEditMode) {
        result = await updateSemester(selectedSemester._id, semesterData);
      } else {
        result = await createSemester(semesterData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: isEditMode ? "Semester updated successfully" : "Semester created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        await fetchSemestersBySchoolId();
        handleCloseModal();
      } else {
        toast({
          title: "Error",
          description: result.message || "Operation failed",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (semesterId) => {
    if (window.confirm("Are you sure you want to delete this semester?")) {
      try {
        const result = await deleteSemester(semesterId);
        if (result.success) {
          toast({
            title: "Success",
            description: "Semester deleted successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          await fetchSemestersBySchoolId();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete semester",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchSemestersBySchoolId(),
      fetchModulesBySchoolId(),
      fetchIntakeCoursesBySchoolId()
    ]);
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'blue';
      case 'active': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getCourseName = (courseId) => {
    const intakeCourse = intakeCourses.find(ic => ic.courseId._id === courseId);
    return intakeCourse ? intakeCourse.courseId.courseName : 'Unknown Course';
  };

  if (isLoading && semesters.length === 0) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading semester modules...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Semester Module Management
          </Text>
          <Text color="gray.600">
            Manage academic semesters, module assignments, and academic calendar
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            onClick={handleRefresh}
            isLoading={isLoading}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="blue"
            onClick={() => handleOpenModal()}
            size="sm"
          >
            Add Semester
          </Button>
        </HStack>
      </Flex>

      {/* Statistics Cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Total Semesters</Text>
              <Text fontSize="2xl" fontWeight="bold">{semesters.length}</Text>
            </VStack>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Active Semesters</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {semesters.filter(s => s.status === 'active').length}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Upcoming Semesters</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {semesters.filter(s => s.status === 'upcoming').length}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Semesters Table */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
            Academic Semesters ({semesters.length})
          </Text>
          
          {/* Desktop Table View */}
          <Box display={{ base: "none", lg: "block" }}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Semester</Th>
                  <Th>Course</Th>
                  <Th>Duration</Th>
                  <Th>Registration Period</Th>
                  <Th>Exam Period</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {semesters.map((semester) => (
                  <Tr key={semester._id}>
                    <Td>
                      <Box>
                        <Text fontWeight="medium">{semester.semesterName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Year {semester.year} - Sem {semester.semesterNumber}
                        </Text>
                      </Box>
                    </Td>
                    <Td>{getCourseName(semester.courseId)}</Td>
                    <Td>
                      <Text>{semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'N/A'}</Text>
                      <Text fontSize="sm" color="gray.600">to</Text>
                      <Text>{semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'N/A'}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {semester.registrationStartDate ? new Date(semester.registrationStartDate).toLocaleDateString() : 'N/A'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        to {semester.registrationEndDate ? new Date(semester.registrationEndDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {semester.examStartDate ? new Date(semester.examStartDate).toLocaleDateString() : 'N/A'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        to {semester.examEndDate ? new Date(semester.examEndDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(semester.status)}>
                        {semester.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEye />} onClick={() => handleOpenModal(semester)}>
                            View Details
                          </MenuItem>
                          <MenuItem icon={<FiEdit />} onClick={() => handleOpenModal(semester)}>
                            Edit
                          </MenuItem>
                          <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(semester._id)} color="red.500">
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Mobile Accordion View */}
          <Box display={{ base: "block", lg: "none" }}>
            <Accordion allowMultiple>
              {semesters.map((semester) => (
                <AccordionItem key={semester._id}>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        <Text fontWeight="medium">{semester.semesterName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {getCourseName(semester.courseId)}
                        </Text>
                      </Box>
                      <Badge colorScheme={getStatusColor(semester.status)} mr={2}>
                        {semester.status}
                      </Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text fontWeight="semibold">Duration:</Text>
                        <Text fontSize="sm">
                          {semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'N/A'} - 
                          {semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">Registration Period:</Text>
                        <Text fontSize="sm">
                          {semester.registrationStartDate ? new Date(semester.registrationStartDate).toLocaleDateString() : 'N/A'} - 
                          {semester.registrationEndDate ? new Date(semester.registrationEndDate).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">Exam Period:</Text>
                        <Text fontSize="sm">
                          {semester.examStartDate ? new Date(semester.examStartDate).toLocaleDateString() : 'N/A'} - 
                          {semester.examEndDate ? new Date(semester.examEndDate).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Box>
                      <HStack spacing={2} justify="center" pt={2}>
                        <Button size="sm" colorScheme="blue" onClick={() => handleOpenModal(semester)}>
                          <FiEye />
                        </Button>
                        <Button size="sm" colorScheme="blue" onClick={() => handleOpenModal(semester)}>
                          <FiEdit />
                        </Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleDelete(semester._id)}>
                          <FiTrash2 />
                        </Button>
                      </HStack>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </CardBody>
      </Card>

      {/* Add/Edit Semester Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Edit Semester" : "Add New Semester"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="1fr 1fr" gap={4}>
              <FormControl isRequired>
                <FormLabel>Course</FormLabel>
                <Select
                  value={semesterForm.courseId}
                  onChange={(e) => handleFormChange('courseId', e.target.value)}
                  placeholder="Select Course"
                >
                  {intakeCourses.map((ic) => (
                    <option key={ic._id} value={ic.courseId._id}>
                      {ic.courseId.courseName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Semester Number</FormLabel>
                <Input
                  type="number"
                  value={semesterForm.semesterNumber}
                  onChange={(e) => handleFormChange('semesterNumber', e.target.value)}
                  placeholder="1"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Year</FormLabel>
                <Input
                  type="number"
                  value={semesterForm.year}
                  onChange={(e) => handleFormChange('year', e.target.value)}
                  placeholder="2024"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={semesterForm.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>
            </Grid>
            
            <FormControl mt={4} isRequired>
              <FormLabel>Semester Name</FormLabel>
              <Input
                value={semesterForm.semesterName}
                onChange={(e) => handleFormChange('semesterName', e.target.value)}
                placeholder="Year 1 Semester 1"
              />
            </FormControl>

            <Grid templateColumns="1fr 1fr" gap={4} mt={4}>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={semesterForm.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={semesterForm.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns="1fr 1fr" gap={4} mt={4}>
              <FormControl>
                <FormLabel>Registration Start</FormLabel>
                <Input
                  type="date"
                  value={semesterForm.registrationStartDate}
                  onChange={(e) => handleFormChange('registrationStartDate', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Registration End</FormLabel>
                <Input
                  type="date"
                  value={semesterForm.registrationEndDate}
                  onChange={(e) => handleFormChange('registrationEndDate', e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns="1fr 1fr" gap={4} mt={4}>
              <FormControl>
                <FormLabel>Exam Start Date</FormLabel>
                <Input
                  type="date"
                  value={semesterForm.examStartDate}
                  onChange={(e) => handleFormChange('examStartDate', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Exam End Date</FormLabel>
                <Input
                  type="date"
                  value={semesterForm.examEndDate}
                  onChange={(e) => handleFormChange('examEndDate', e.target.value)}
                />
              </FormControl>
            </Grid>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={semesterForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Semester description..."
                rows={3}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {isEditMode ? "Update" : "Add"} Semester
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
