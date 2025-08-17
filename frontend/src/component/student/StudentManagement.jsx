import {
    Box,
    Button,
    Card,
    CardBody,
    HStack,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Avatar,
    Text,
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
    useToast,
    useColorModeValue,
    VStack,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Flex,
    InputGroup,
    InputLeftElement
} from "@chakra-ui/react"
import { FiPlus, FiEdit, FiTrash2, FiDownload, FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../store/academic.js";
import { useShowToast } from "../../store/utils/toast.js";
import { useUserStore } from "../../store/user.js";
import { useAuthStore } from "../../store/auth.js";
import ComfirmationMessage from "../common/ComfirmationMessage.jsx";

export function StudentManagement({ selectedIntakeCourse, filterBy }) {
    // Basic hooks
    const { createUser, modifyUser } = useUserStore();
    const {
        students,
        courses,
        intakeCourses,
        fetchCoursesBySchoolId,
        fetchStudentsBySchoolId,
        fetchIntakeCoursesBySchoolId,
        createStudent,
        updateStudent,
        deleteStudent,
    } = useAcademicStore();
    const { initializeAuth } = useAuthStore();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const showToast = useShowToast();
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    // Simple state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        courseId: "",
        intakeId: "",
        currentYear: 1,
        currentSemester: 1,
    });
    const [isEdit, setIsEdit] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Simple validation
    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                return !value.trim() ? "Name is required" : "";
            case 'email':
                return !value.trim() ? "Email is required" : "";
            case 'password':
                return !isEdit && !value ? "Password is required" : "";
            case 'phoneNumber':
                return !value.trim() ? "Phone is required" : "";
            case 'courseId':
                return !value ? "Course is required" : "";
            case 'intakeId':
                return !value ? "Intake is required" : "";
            default:
                return "";
        }
    };

    // Simple form handling
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Check if form is valid
    const isFormValid = () => {
        return formData.name && formData.email && formData.phoneNumber &&
            formData.courseId && formData.intakeId &&
            (isEdit || formData.password);
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm ||
            student.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || student.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // CRUD Operations
    const handleSubmit = async () => {
        try {
            // Create user
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: "student"
            };
            const userResult = await createUser(userData);

            if (!userResult.success) {
                showToast.error("Error creating user", userResult.message);
                return;
            }

            // Create student
            const studentData = {
                userId: userResult.data._id,
                intakeCourseId: formData.intakeCourseId,
                currentYear: formData.currentYear,
                currentSemester: formData.currentSemester,
                status: "enrolled",
            };

            const studentResult = await createStudent(studentData);

            if (!studentResult.success) {
                showToast.error("Error creating student", studentResult.message);
                return;
            }

            showToast.success("Student created successfully");
            resetForm();
            onClose();
            fetchStudentsBySchoolId();
        } catch (error) {
            showToast.error("Error", error.message);
        }
    };

    const handleEdit = (student) => {
        setIsEdit(true);
        setSelectedStudent(student);
        setFormData({
            name: student.userId?.name || "",
            email: student.userId?.email || "",
            password: "",
            phoneNumber: student.userId?.phoneNumber || "",
            courseId: student.intakeCourseId?.courseId?._id || "",
            intakeId: student.intakeCourseId?.intakeId?._id || "",
            currentYear: student.currentYear || 1,
            currentSemester: student.currentSemester || 1,
        });
        onOpen();
    };

    const handleUpdate = async () => {
        try {
            // Update user
            const userData = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: "student"
            };

            if (formData.password) {
                userData.password = formData.password;
            }

            const userResult = await modifyUser(selectedStudent.userId._id, userData);

            if (!userResult.success) {
                showToast.error("Error updating user", userResult.message);
                return;
            }

            // Update student
            const studentData = {
                currentYear: formData.currentYear,
                currentSemester: formData.currentSemester,
            };

            const studentResult = await updateStudent(selectedStudent._id, studentData);

            if (!studentResult.success) {
                showToast.error("Error updating student", studentResult.message);
                return;
            }

            showToast.success("Student updated successfully");
            resetForm();
            onClose();
            fetchStudentsBySchoolId();
        } catch (error) {
            showToast.error("Error", error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteStudent(studentToDelete);
            if (result.success) {
                showToast.success("Student deleted successfully");
                fetchStudentsBySchoolId();
            } else {
                showToast.error("Error deleting student", result.message);
            }
        } catch (error) {
            showToast.error("Error", error.message);
        }
        setIsDeleteOpen(false);
        setStudentToDelete(null);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            courseId: "",
            intakeId: "",
            currentYear: 1,
            currentSemester: 1,
        });
        setIsEdit(false);
        setSelectedStudent(null);
    };

    const openAddModal = () => {
        resetForm();
        onOpen();
    };

    // Initialize data
    useEffect(() => {
        const init = async () => {
            const authResult = await initializeAuth();
            if (authResult.success) {
                fetchIntakeCoursesBySchoolId();
                fetchStudentsBySchoolId();
                fetchCoursesBySchoolId();
            }
        };
        init();
    }, []);

    // Update intakeCourseId when course or intake changes
    useEffect(() => {
        if (formData.courseId && formData.intakeId) {
            const found = intakeCourses.find(ic =>
                ic.courseId._id === formData.courseId &&
                ic.intakeId._id === formData.intakeId
            );
            if (found) {
                setFormData(prev => ({ ...prev, intakeCourseId: found._id }));
            }
        }
    }, [formData.courseId, formData.intakeId, intakeCourses]);

    return (
        <Box flex={1} minH="100vh">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="#333333">
                            Student Management
                        </Text>
                        <Text color="gray.600">Manage student accounts and information</Text>
                    </Box>
                    <HStack>
                        <Button leftIcon={<FiDownload />} variant="outline">
                            Export
                        </Button>
                        <Button leftIcon={<FiPlus />} bg="#344E41" color="white" onClick={openAddModal}>
                            Add Student
                        </Button>
                    </HStack>
                </HStack>

                {/* Filters */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4} mb={4}>
                            <Input
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                flex="1"
                            />
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                w="200px"
                            >
                                <option value="all">All Status</option>
                                <option value="enrolled">Enrolled</option>
                                <option value="graduated">Graduated</option>
                                <option value="dropped">Dropped</option>
                            </Select>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Students Table */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Student</Th>
                                    <Th>Course</Th>
                                    <Th>Year</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredStudents.map((student) => (
                                    <Tr key={student._id}>
                                        <Td>
                                            <HStack>
                                                <Avatar size="sm" name={student.userId?.name} />
                                                <Box>
                                                    <Text fontWeight="medium">{student.userId?.name}</Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {student.userId?.email}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            {student.intakeCourseId?.courseId?.courseName || "N/A"}
                                        </Td>
                                        <Td>{student.currentYear}</Td>
                                        <Td>
                                            <Badge colorScheme="green">{student.status}</Badge>
                                        </Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <Button size="sm" colorScheme="blue" onClick={() => handleEdit(student)}>
                                                    <FiEdit />
                                                </Button>
                                                <Button size="sm" colorScheme="red" onClick={() => {
                                                    setStudentToDelete(student._id);
                                                    setIsDeleteOpen(true);
                                                }}>
                                                    <FiTrash2 />
                                                </Button>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Add/Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            {isEdit ? "Edit Student" : "Add New Student"}
                        </ModalHeader>
                        <ModalCloseButton />

                        <ModalBody>
                            <VStack spacing={4}>
                                {/* User Information */}
                                <FormControl isRequired>
                                    <FormLabel>Full Name</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement>
                                            <FiUser />
                                        </InputLeftElement>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter full name"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement>
                                            <FiMail />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                    </InputGroup>
                                </FormControl>

                                {!isEdit && (
                                    <FormControl isRequired>
                                        <FormLabel>Password</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement>
                                                <FiLock />
                                            </InputLeftElement>
                                            <Input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="Enter password"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                )}

                                <FormControl isRequired>
                                    <FormLabel>Phone Number</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement>
                                            <FiPhone />
                                        </InputLeftElement>
                                        <Input
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                    </InputGroup>
                                </FormControl>

                                {/* Academic Information */}
                                <FormControl isRequired>
                                    <FormLabel>Course</FormLabel>
                                    <Select
                                        value={formData.courseId}
                                        onChange={(e) => handleInputChange('courseId', e.target.value)}
                                        placeholder="Select Course"
                                    >
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.courseName}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Intake</FormLabel>
                                    <Select
                                        value={formData.intakeId}
                                        onChange={(e) => handleInputChange('intakeId', e.target.value)}
                                        placeholder="Select Intake"
                                        disabled={!formData.courseId}
                                    >
                                        {intakeCourses
                                            .filter(ic => ic.courseId._id === formData.courseId)
                                            .map(ic => (
                                                <option key={ic.intakeId._id} value={ic.intakeId._id}>
                                                    {ic.intakeId.intakeName}
                                                </option>
                                            ))}
                                    </Select>
                                </FormControl>

                                <HStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Year</FormLabel>
                                        <Select
                                            value={formData.currentYear}
                                            onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value))}
                                        >
                                            {[1, 2, 3, 4].map(year => (
                                                <option key={year} value={year}>Year {year}</option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Semester</FormLabel>
                                        <Select
                                            value={formData.currentSemester}
                                            onChange={(e) => handleInputChange('currentSemester', parseInt(e.target.value))}
                                        >
                                            {[1, 2].map(semester => (
                                                <option key={semester} value={semester}>Semester {semester}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </HStack>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={isEdit ? handleUpdate : handleSubmit}
                                isDisabled={!isFormValid()}
                            >
                                {isEdit ? "Update" : "Create"}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation */}
                <ComfirmationMessage
                    title="Confirm delete student?"
                    description="Student deleted won't be able to be restored"
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={handleDelete}
                />
            </VStack>
        </Box>
    );
}
