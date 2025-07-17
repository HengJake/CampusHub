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
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiDownload } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../store/academic";
import { useShowToast } from "../../store/utils/toast";
import { ModuleManagement } from "../../component/schoolAdminDashboard/ModuleManagement";
import ComfirmationMessage from "../common/ComfirmationMessage.jsx";

export function CourseManagement() {
    const { courses, addCourse, updateCourse, deleteCourse, fetchCourses, fetchModules, modules, fetchLecturers, lecturers } = useAcademicStore()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const showToast = useShowToast();

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [departmentFilter, setDepartmentFilter] = useState("All")
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        courseCode: "",
        courseName: "",
        description: "",
        credits: "",
        department: "",
        duration: "",
        isActive: true,
    })
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    useEffect(() => {
        if (courses.length == 0) {
            fetchCourses();
        }
        if (modules.length == 0) {
            fetchModules();
        }
        if (lecturers.length == 0) {
            fetchLecturers();
        }
    }, [])

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    const filteredCourses = courses.filter((course) => {
        // Defensive programming: Check if course exists and has required properties
        if (!course) return false;

        const courseName = course.courseName ? course.courseName : "";
        const courseCode = course.courseCode ? course.courseCode : "";
        const description = course.description ? course.description : "";

        const matchesSearch =
            courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "All" ||
            (statusFilter === "true" && course.isActive === true) ||
            (statusFilter === "false" && course.isActive === false)

        const department = course.departmentId && course.departmentId.departmentName ? course.departmentId.departmentName : "";
        const matchesDepartment = departmentFilter === "All" || department === departmentFilter

        return matchesSearch && matchesStatus && matchesDepartment
    })

    const handleSubmit = () => {
        if (!formData.courseCode || !formData.courseName || !formData.credits) {
            showToast.error("Error", "Please fill in all required fields", "course-validation");
            return
        }

        if (isEditing) {
            if (!selectedCourse || !selectedCourse.id) {
                showToast.error("Error", "No course selected for editing", "course-edit-error");
                return;
            }

            updateCourse(selectedCourse.id, formData)
            showToast.success("Success", "Course updated successfully", "course-update");
        } else {
            addCourse({ ...formData, modules: [], lecturers: [], students: [] })
            showToast.success("Success", "Course added successfully", "course-add");
        }

        resetForm()
        onClose()
    }

    const resetForm = () => {
        setFormData({
            courseCode: "",
            courseName: "",
            description: "",
            credits: "",
            department: "",
            duration: "",
            isActive: true,
        })
        setSelectedCourse(null)
        setIsEditing(false)
    }

    const handleEdit = (course) => {
        if (!course) {
            showToast.error("Error", "Invalid course data", "course-edit-error");
            return;
        }

        setSelectedCourse(course)
        setFormData({
            courseCode: course.courseCode || "",
            courseName: course.courseName || "",
            description: course.description || "",
            credits: course.credits || course.totalCreditHours || "",
            department: course.department || "",
            duration: course.duration || "",
            isActive: course.isActive !== undefined ? course.isActive : true,
        })
        setIsEditing(true)
        onOpen()
    }

    const handleView = (course) => {
        if (!course) {
            showToast.error("Error", "Invalid course data", "course-view-error");
            return;
        }

        setSelectedCourse(course)
        onViewOpen()
    }

    const openDeleteDialog = (courseId) => {
        setCourseToDelete(courseId);
        setIsDeleteOpen(true);
    };
    const closeDeleteDialog = () => {
        setIsDeleteOpen(false);
        setCourseToDelete(null);
    };
    const handleDelete = async () => {
        if (!courseToDelete) {
            showToast.error("Error", "Invalid course ID", "course-delete-error");
            return;
        }
        await deleteCourse(courseToDelete);
        showToast.success("Success", "Course deleted successfully", "course-delete");
        fetchCourses();
        closeDeleteDialog();
    };

    return (
        <Box p={6} minH="100vh" flex={1}>
            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab>Courses</Tab>
                    <Tab>Modules</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <VStack spacing={6} align="stretch">
                            {/* Header */}
                            <HStack justify="space-between">
                                <Box>
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                                        Course Management
                                    </Text>
                                    <Text color="gray.600">Manage courses and curriculum</Text>
                                </Box>
                                <HStack>
                                    <Button leftIcon={<FiDownload />} variant="outline">
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
                                        Add Course
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
                                                placeholder="Search courses..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                            <option value="All">All Status</option>
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </Select>
                                        <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                                            <option value="All">All Departments</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Information Technology">Information Technology</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Business">Business</option>
                                            <option value="Arts">Arts</option>
                                        </Select>
                                    </Grid>
                                </CardBody>
                            </Card>

                            {/* Courses Table */}
                            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                                <CardBody>
                                    <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                                        Courses ({filteredCourses.length})
                                    </Text>
                                    {/* Desktop Table View */}
                                    <Box display={{ base: "none", lg: "block" }}>
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Course Code</Th>
                                                    <Th>Course Name</Th>
                                                    <Th>Department</Th>
                                                    <Th>Total Credit Hour</Th>
                                                    <Th>Duration (Month)</Th>
                                                    <Th>Modules</Th>
                                                    <Th>Status</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredCourses.map((course) => {
                                                    if (!course) return null;

                                                    return (
                                                        <Tr key={course._id || course.id}>
                                                            <Td>
                                                                <Text fontWeight="medium">{course.courseCode || "N/A"}</Text>
                                                            </Td>
                                                            <Td>
                                                                <Box>
                                                                    <Text fontWeight="medium">{course.courseName || "N/A"}</Text>
                                                                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                                                        {course.courseDescription || course.description || "No description"}
                                                                    </Text>
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                {course.departmentId && course.departmentId.departmentName
                                                                    ? course.departmentId.departmentName
                                                                    : course.department || "N/A"}
                                                            </Td>
                                                            <Td>{course.totalCreditHours || course.credits || "N/A"}</Td>
                                                            <Td>{course.duration || "N/A"}</Td>
                                                            <Td>
                                                                <Badge colorScheme={modules.filter(module => module.courseId === course._id).length < 1 ? "red" : "blue"}>
                                                                    {modules.filter(module => module.courseId === course._id).length} modules
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme={course.isActive ? "green" : "red"}>
                                                                    {course.isActive ? "Active" : "Not Active"}
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                <Menu>
                                                                    <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                                                                    <MenuList>
                                                                        <MenuItem icon={<FiEye />} onClick={() => handleView(course)}>
                                                                            View Details
                                                                        </MenuItem>
                                                                        <MenuItem icon={<FiEdit />} onClick={() => handleEdit(course)}>
                                                                            Edit
                                                                        </MenuItem>
                                                                        <MenuItem icon={<FiTrash2 />} onClick={() => openDeleteDialog(course._id || course.id)} color="red.500">
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
                                            {filteredCourses.map((course) => {
                                                if (!course) return null;

                                                return (
                                                    <AccordionItem key={course._id || course.id}>
                                                        <h2>
                                                            <AccordionButton>
                                                                <Box as="span" flex="1" textAlign="left">
                                                                    <Text fontWeight="medium">{course.courseName || "N/A"}</Text>
                                                                    <Text fontSize="sm" color="gray.600">{course.courseCode || "N/A"}</Text>
                                                                </Box>
                                                                <AccordionIcon />
                                                            </AccordionButton>
                                                        </h2>
                                                        <AccordionPanel pb={4}>
                                                            <VStack spacing={3} align="stretch">
                                                                <Box>
                                                                    <Text fontWeight="semibold">Department:</Text>
                                                                    <Text>
                                                                        {course.departmentId && course.departmentId.departmentName
                                                                            ? course.departmentId.departmentName
                                                                            : course.department || "N/A"}
                                                                    </Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Total Credit Hour:</Text>
                                                                    <Text>{course.totalCreditHours || course.credits || "N/A"}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Duration (Month):</Text>
                                                                    <Text>{course.duration || "N/A"}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Modules:</Text>
                                                                    <Badge colorScheme={modules.filter(module => module.courseId === course._id).length < 1 ? "red" : "blue"}>
                                                                        {modules.filter(module => module.courseId === course._id).length} modules
                                                                    </Badge>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Status:</Text>
                                                                    <Badge colorScheme={course.isActive ? "green" : "red"}>
                                                                        {course.isActive ? "Active" : "Not Active"}
                                                                    </Badge>
                                                                </Box>
                                                                <HStack spacing={2} justify="center" pt={2}>
                                                                    <Button size="sm" colorScheme="blue" onClick={() => handleView(course)}>
                                                                        <FiEye />
                                                                    </Button>
                                                                    <Button size="sm" colorScheme="blue" onClick={() => handleEdit(course)}>
                                                                        <FiEdit />
                                                                    </Button>
                                                                    <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(course._id || course.id)}>
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

                            {/* Add/Edit Course Modal */}
                            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>{isEditing ? "Edit Course" : "Add New Course"}</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <Grid templateColumns="1fr 1fr" gap={4}>
                                            <FormControl isRequired>
                                                <FormLabel>Course Code</FormLabel>
                                                <Input
                                                    value={formData.courseCode}
                                                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                                    placeholder="CS101"
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel>Credits</FormLabel>
                                                <Input
                                                    type="number"
                                                    value={formData.credits}
                                                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                                    placeholder="3"
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel>Department</FormLabel>
                                                <Select
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="Computer Science">Computer Science</option>
                                                    <option value="Information Technology">Information Technology</option>
                                                    <option value="Engineering">Engineering</option>
                                                    <option value="Business">Business</option>
                                                    <option value="Arts">Arts</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Duration</FormLabel>
                                                <Select
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                >
                                                    <option value="">Select Duration</option>
                                                    <option value="1 Semester">1 Semester</option>
                                                    <option value="2 Semesters">2 Semesters</option>
                                                    <option value="1 Year">1 Year</option>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <FormControl mt={4} isRequired>
                                            <FormLabel>Course Name</FormLabel>
                                            <Input
                                                value={formData.courseName}
                                                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                                placeholder="Introduction to Computer Science"
                                            />
                                        </FormControl>
                                        <FormControl mt={4}>
                                            <FormLabel>Description</FormLabel>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Course description..."
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormControl mt={4}>
                                            <FormLabel>Status</FormLabel>
                                            <Select value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}>
                                                <option value={true}>Active</option>
                                                <option value={false}>Inactive</option>
                                            </Select>
                                        </FormControl>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button variant="ghost" mr={3} onClick={onClose}>
                                            Cancel
                                        </Button>
                                        <Button colorScheme="blue" onClick={handleSubmit}>
                                            {isEditing ? "Update" : "Add"} Course
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>

                            {/* View Course Modal */}
                            <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Course Details</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        {selectedCourse && (
                                            <VStack spacing={4} align="stretch">
                                                <HStack>
                                                    <Box>
                                                        <Text fontSize="xl" fontWeight="bold">
                                                            {selectedCourse.courseName || "N/A"}
                                                        </Text>
                                                        <Text color="gray.600">{selectedCourse.courseCode || "N/A"}</Text>
                                                        <Badge colorScheme={selectedCourse.isActive ? "green" : "red"}>
                                                            {selectedCourse.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </Box>
                                                </HStack>
                                                <Grid templateColumns="1fr 1fr" gap={4}>
                                                    <Box>
                                                        <Text fontWeight="semibold">Department:</Text>
                                                        <Text>
                                                            {selectedCourse.departmentId && selectedCourse.departmentId.departmentName
                                                                ? selectedCourse.departmentId.departmentName
                                                                : selectedCourse.department || "N/A"}
                                                        </Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="semibold">Level:</Text>
                                                        <Text>{selectedCourse.courseLevel || "N/A"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="semibold">Type:</Text>
                                                        <Text>{selectedCourse.courseType || "N/A"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="semibold">Total Credit Hours:</Text>
                                                        <Text>{selectedCourse.totalCreditHours || selectedCourse.credits || "N/A"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="semibold">Minimum CGPA:</Text>
                                                        <Text>{selectedCourse.minimumCGPA || "N/A"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="semibold">Duration (months):</Text>
                                                        <Text>{selectedCourse.duration || "N/A"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="semibold">Modules:</Text>
                                                        <Text>
                                                            {modules.filter(module => module.courseId === selectedCourse._id).length || 0} modules
                                                        </Text>
                                                    </Box>
                                                </Grid>
                                                <Box>
                                                    <Text fontWeight="semibold">Description:</Text>
                                                    <Text>{selectedCourse.courseDescription || selectedCourse.description || "No description available"}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Entry Requirements:</Text>
                                                    <VStack align="start">
                                                        {(selectedCourse.entryRequirements || []).length > 0
                                                            ? selectedCourse.entryRequirements.map((req, idx) => (
                                                                <Badge key={idx} colorScheme="purple">{req}</Badge>
                                                            ))
                                                            : <Text color="gray.500">None</Text>
                                                        }
                                                    </VStack>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Career Prospects:</Text>
                                                    <VStack align="start">
                                                        {(selectedCourse.careerProspects || []).length > 0
                                                            ? selectedCourse.careerProspects.map((prospect, idx) => (
                                                                <Badge key={idx} colorScheme="orange">{prospect}</Badge>
                                                            ))
                                                            : <Text color="gray.500">None</Text>
                                                        }
                                                    </VStack>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Assigned Modules:</Text>
                                                    <HStack wrap="wrap">
                                                        {modules.filter((module) => module.courseId === selectedCourse._id).map((module) => (
                                                            <Badge key={module._id} colorScheme="blue">
                                                                {module.moduleName || "Unnamed Module"}
                                                            </Badge>
                                                        ))}
                                                    </HStack>
                                                </Box>
                                            </VStack>
                                        )}
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button onClick={onViewClose}>Close</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </VStack>
                        <ComfirmationMessage
                            title="Confirm delete course?"
                            description="This course will be permanently deleted and cannot be restored."
                            isOpen={isDeleteOpen}
                            onClose={closeDeleteDialog}
                            onConfirm={handleDelete}
                        />
                    </TabPanel>

                    <TabPanel>
                        <ModuleManagement />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}
