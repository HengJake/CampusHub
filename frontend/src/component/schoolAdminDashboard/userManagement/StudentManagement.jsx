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
    Spacer,
    Divider
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiDownload } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../../store/academic.js";
import { useShowToast } from "../../../store/utils/toast.js";
import { useUserStore } from "../../../store/user.js";
import { Spinner } from "@chakra-ui/react";
import ComfirmationMessage from "../../common/ComfirmationMessage.jsx";

export function StudentManagement({ selectedIntakeCourse, filterBy }) {

    const { alertOpen, onAlertOpen, onAlertClose } = useDisclosure()
    const { createUser, modifyUser } = useUserStore();

    const {
        students,
        courses,
        intakes,
        intakeCourses,
        fetchCourses,
        fetchStudents,
        fetchIntakes,
        fetchIntakeCourses,
        createStudent,
        updateStudent,
        deleteStudent,
        loading,
    } = useAcademicStore();
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const showToast = useShowToast();
    const toast = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all") // Changed from "All" to "all"
    const [intakeCourseFilter, setIntakeCourseFilter] = useState("all")
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [step, setStep] = useState(0); // 0: User Info, 1: Academic Info, 2: Review/Submit
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchIntakeCourses();
        fetchStudents();
        fetchCourses();
        fetchIntakes();
    }, [])

    // Handle initial filtering when navigated from intake courses
    useEffect(() => {
        if (selectedIntakeCourse && filterBy === 'intakeCourse') {
            setIntakeCourseFilter(selectedIntakeCourse._id);
        }
    }, [selectedIntakeCourse, filterBy]);

    // Expanded formData
    const [formData, setFormData] = useState({
        // User fields
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        // Student fields
        userId: "",
        courseId: "", // NEW
        intakeId: "", // NEW
        intakeCourseId: "",
        currentYear: 0,
        currentSemester: 0,
        status: "",
        academicStanding: "",
    });
    const [sortOption, setSortOption] = useState("name-asc");

    let filteredStudents = students.filter((student) => {
        const name = student.userId && student.userId.name ? student.userId.name : "";
        const email = student.userId && student.userId.email ? student.userId.email : "";
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student._id ? student._id.toLowerCase().includes(searchTerm.toLowerCase()) : false);
        const matchesStatus = statusFilter === "all" || (student.status && student.status.toLowerCase() === statusFilter.toLowerCase());
        const matchesIntakeCourse = intakeCourseFilter === "all" || (student.intakeCourseId && student.intakeCourseId._id === intakeCourseFilter);
        return matchesSearch && matchesStatus && matchesIntakeCourse;
    });

    // Sorting logic

    let sortedStudents = [...filteredStudents];
    if (sortOption === "name-asc") {
        sortedStudents.sort((a, b) => {
            const aName = a.userId && a.userId.name ? a.userId.name : "";
            const bName = b.userId && b.userId.name ? b.userId.name : "";
            return aName.localeCompare(bName);
        });
    } else if (sortOption === "name-desc") {
        sortedStudents.sort((a, b) => {
            const aName = a.userId && a.userId.name ? a.userId.name : "";
            const bName = b.userId && b.userId.name ? b.userId.name : "";
            return bName.localeCompare(aName);
        });
    } else if (sortOption === "year-asc") {
        sortedStudents.sort((a, b) => {
            const aYear = a.year ? a.year : 0;
            const bYear = b.year ? b.year : 0;
            return aYear - bYear;
        });
    } else if (sortOption === "year-desc") {
        sortedStudents.sort((a, b) => {
            const aYear = a.year ? a.year : 0;
            const bYear = b.year ? b.year : 0;
            return bYear - aYear;
        });
    } else if (sortOption === "status-asc") {
        sortedStudents.sort((a, b) => {
            const aStatus = a.status ? a.status : "";
            const bStatus = b.status ? b.status : "";
            return aStatus.localeCompare(bStatus);
        });
    } else if (sortOption === "status-desc") {
        sortedStudents.sort((a, b) => {
            const aStatus = a.status ? a.status : "";
            const bStatus = b.status ? b.status : "";
            return bStatus.localeCompare(aStatus);
        });
    } else if (sortOption === "created-desc") {
        sortedStudents.sort((a, b) => {
            const aCreated = a.userId && a.userId.createdAt ? a.userId.createdAt : "";
            const bCreated = b.userId && b.userId.createdAt ? b.userId.createdAt : "";
            return bCreated.localeCompare(aCreated);
        });
    } else if (sortOption === "created-asc") {
        sortedStudents.sort((a, b) => {
            const aCreated = a.userId && a.userId.createdAt ? a.userId.createdAt : "";
            const bCreated = b.userId && b.userId.createdAt ? b.userId.createdAt : "";
            return aCreated.localeCompare(bCreated);
        });
    }

    const handleSubmit = async () => {
        // Only for adding a new student
        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            role: "student"
        };
        const res1 = await createUser(userData);
        if (!res1.success) {
            showToast.error("Error creating user", res1.message, "user-error");
            return;
        }
        const studentData = {
            userId: res1.data._id,
            intakeCourseId: formData.intakeCourseId,
            completionStatus: "in progress",
            currentYear: formData.currentYear,
            currentSemester: formData.currentSemester,
            cgpa: 0,
            status: "enrolled",
            totalCreditHours: 0,
            completedCreditHours: 0,
            academicStanding: "good",
        };

        const res2 = await createStudent(studentData);
        if (!res2.success) {
            showToast.error("Error Creating Student", res2.message, "create-student");
            return;
        }
        showToast.success("Student created successfully", res2.message, "create-student2");
        setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            userId: "",
            courseId: "",
            intakeId: "",
            intakeCourseId: "",
            currentYear: 0,
            currentSemester: 0,
        });
        setSelectedStudent(null);
        onClose();
        await fetchStudents();
    };

    const handleEdit = async (student) => {

        setIsEdit(true);

        // Open modal and populate form for editing
        setSelectedStudent(student);

        setFormData({
            name: student.userId && student.userId.name ? student.userId.name : "",
            email: student.userId && student.userId.email ? student.userId.email : "",
            phoneNumber: student.userId && student.userId.phoneNumber ? student.userId.phoneNumber : "",
            userId: student.userId && student.userId._id ? student.userId._id : "",
            courseId: student.intakeCourseId && student.intakeCourseId.courseId ? student.intakeCourseId.courseId._id : "",
            intakeId: student.intakeCourseId && student.intakeCourseId.intakeId ? student.intakeCourseId.intakeId._id : "",
            intakeCourseId: student.intakeCourseId ? student.intakeCourseId._id : "",
            currentYear: student.currentYear || 0,
            currentSemester: student.currentSemester || 0,
            completionStatus: student.completionStatus || "",
            status: student.status || "",
            academicStanding: student.academicStanding || "",
        });
        setStep(0);
        onOpen();
    };

    const handleUpdateStudent = async () => {
        // Called when editing and submitting the modal
        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            role: "student"
        };

        const res1 = await modifyUser(formData.userId, userData);

        if (!res1.success) {
            showToast.error("Error updating user", res.message, "update-student");
            return;
        }

        if (!selectedStudent) return;
        const studentUpdates = {
            userId: formData.userId,
            intakeCourseId: formData.intakeCourseId,
            completionStatus: formData.completionStatus,
            currentYear: formData.currentYear,
            currentSemester: formData.currentSemester,
            status: formData.status,
            academicStanding: formData.academicStanding,
        };


        const res = await updateStudent(selectedStudent._id, studentUpdates);
        if (!res.success) {
            showToast.error("Error updating student", res.message, "update-student");
            return;
        }
        showToast.success("Student updated successfully", res.message, "update-student2");
        setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            userId: "",
            courseId: "",
            intakeId: "",
            intakeCourseId: "",
            currentYear: 0,
            currentSemester: 0,
            status: "",
            academicStanding: "",
        });
        setSelectedStudent(null);
        onClose();
        await fetchStudents();
    };

    // to handle delete student
    const openDeleteDialog = (studentId) => {
        setStudentToDelete(studentId);
        setIsDeleteOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteOpen(false);
        setStudentToDelete(null);
    };

    const handleDelete = async () => {
        const id = studentToDelete;
        if (id) {
            const res = await deleteStudent(id);
            if (res && res.success) {
                showToast.success("Student deleted successfully", "", "delete-student");
                await fetchStudents();
            } else {
                showToast.error("Error deleting student", res && res.message ? res.message : "", "delete-student");
            }
        }

        closeDeleteDialog();
    };

    const exportStudents = () => {
        const csvContent = [
            ["Name", "Email", "Student ID", "Course", "Year", "Status"],
            ...filteredStudents.map((student) => [
                student.userId.name,
                student.userId.email,
                student.studentId,
                student.intakeCourseId.courseId.courseName,
                student.year,
                student.status,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "students.csv"
        a.click()
        window.URL.revokeObjectURL(url)
    }

    // Helper to get intakes for selected course
    const filteredIntakeCourses = formData.courseId
        ? intakeCourses.filter(ic => ic.courseId._id === formData.courseId)
        : [];

    // When courseId or intakeId changes, update intakeCourseId
    useEffect(() => {
        if (formData.courseId && formData.intakeId) {
            const found = intakeCourses.find(ic => ic.courseId._id === formData.courseId && ic.intakeId._id === formData.intakeId);
            setFormData(prev => ({ ...prev, intakeCourseId: found ? found._id : "" }));
        } else {
            setFormData(prev => ({ ...prev, intakeCourseId: "" }));
        }
    }, [formData.courseId, formData.intakeId, intakeCourses]);

    // Step content
    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Full Name</FormLabel>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </FormControl>

                        {!isEdit && (
                            <FormControl isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </FormControl>)
                        }

                        <FormControl isRequired>
                            <FormLabel>Phone Number</FormLabel>
                            <Input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                        </FormControl>
                    </VStack>
                );
            case 1:
                return (
                    <VStack spacing={4}>

                        <FormControl isRequired>
                            <FormLabel>Course</FormLabel>
                            <Select value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value, intakeId: "" })}>
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>{course.courseName}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Intake</FormLabel>
                            <Select
                                value={formData.intakeId}
                                onChange={e => setFormData({ ...formData, intakeId: e.target.value })}
                                disabled={!formData.courseId}
                            >
                                <option value="">Select Intake</option>
                                {filteredIntakeCourses.map(ic => (
                                    <option key={ic.intakeId._id} value={ic.intakeId._id}>{ic.intakeId.intakeName}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Year</FormLabel>
                            <Select
                                value={formData.currentYear}
                                onChange={e => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
                                disabled={!formData.intakeId}
                            >
                                <option value="">Select Year</option>
                                {(() => {
                                    const ic = filteredIntakeCourses.find(ic =>
                                        ic.intakeId._id === formData.intakeId
                                    )

                                    if (ic && ic.intakeId.totalYear) {
                                        return Array.from({ length: ic.intakeId.totalYear }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))
                                    }

                                    return null;
                                })()}
                            </Select>
                        </FormControl>

                        <FormControl>

                            <FormLabel> Current Semester</FormLabel>
                            <Select
                                value={formData.currentSemester}
                                onChange={e => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                                disabled={!formData.intakeId}
                            >
                                <option value="">Select Semester</option>

                                {(() => {
                                    const ic = filteredIntakeCourses.find(ic =>
                                        ic.intakeId._id === formData.intakeId
                                    )

                                    if (ic && ic.intakeId.totalSemester) {
                                        return Array.from({ length: ic.intakeId.totalSemester }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))
                                    }

                                    return null;
                                })()}
                            </Select>

                        </FormControl>
                    </VStack >
                );
            case 2:
                return (
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Status</FormLabel>
                            {
                                !isEdit ? (
                                    <Input value={"Enrolled"} readOnly />
                                ) : (
                                    <Select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="enrolled">Enrolled</option>
                                        <option value="active">Active</option>
                                        <option value="graduated">Graduated</option>
                                        <option value="dropped">Dropped</option>
                                        <option value="suspended">Suspended</option>
                                    </Select>
                                )
                            }
                        </FormControl>
                        <FormControl>
                            <FormLabel>Completion Status</FormLabel>
                            {
                                !isEdit ? (
                                    <Input value={"In Progress"} readOnly />
                                ) : (
                                    <Select value={formData.completionStatus} onChange={e => setFormData({ ...formData, completionStatus: e.target.value })}>
                                        <option value="completed">Completed</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="dropped">Dropped</option>
                                    </Select>
                                )
                            }
                        </FormControl>
                        <FormControl>
                            <FormLabel>Academic Standing</FormLabel>
                            {!isEdit ? (
                                <Input value={"Good"} readOnly />
                            ) : (
                                <Select value={formData.academicStanding} onChange={e => setFormData({ ...formData, academicStanding: e.target.value })}>
                                    <option value="good">Good</option>
                                    <option value="warning">Warning</option>
                                    <option value="probation">Probation</option>
                                    <option value="suspended">Suspended</option>
                                </Select>
                            )
                            }
                        </FormControl>
                    </VStack>
                );
            case 3:
                return (
                    <VStack spacing={4}>
                        <Text>Review all details before submitting...</Text>
                        {/* Display summary of formData here */}
                    </VStack>
                );
            default:
                return null;
        }
    };

    // Navigation handlers
    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

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
                        <Button leftIcon={<FiDownload />} variant="outline" onClick={exportStudents}>
                            Export
                        </Button>

                        {/* set student data to empty and change it to add student */}
                        <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={() => {
                            setIsEdit(false)
                            setFormData({
                                name: "",
                                email: "",
                                password: "",
                                phoneNumber: "",
                                userId: "",
                                courseId: "",
                                intakeId: "",
                                intakeCourseId: "",
                                currentYear: 0,
                                currentSemester: 0,
                            });
                            setSelectedStudent(null);
                            onOpen();
                        }}>
                            Add Student
                        </Button>
                    </HStack>
                </HStack>

                {/* Filters */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4} mb={4} flexWrap="wrap" gap={2}>
                            <Box flex="1" minW="200px">
                                <Input
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="md"
                                />
                            </Box>
                            <Select
                                w={{ base: "full", sm: "200px" }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="graduated">Graduated</option>
                                <option value="dropped">Dropped</option>
                                <option value="suspended">Suspended</option>
                            </Select>
                            <Select
                                w={{ base: "full", sm: "200px" }}
                                value={intakeCourseFilter}
                                onChange={(e) => setIntakeCourseFilter(e.target.value)}
                            >
                                <option value="all">All Intake Courses</option>
                                {intakeCourses.map(ic => (
                                    <option key={ic._id} value={ic._id}>
                                        {ic.intakeId?.intakeName} - {ic.courseId?.courseName}
                                    </option>
                                ))}
                            </Select>
                            <Select
                                w={{ base: "full", sm: "200px" }}
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                placeholder="Sort By"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="year-asc">Year (Ascending)</option>
                                <option value="year-desc">Year (Descending)</option>
                                <option value="status-asc">Status (A-Z)</option>
                                <option value="status-desc">Status (Z-A)</option>
                                <option value="created-asc">Created At (Oldest)</option>
                                <option value="created-desc">Created At (Most Recent)</option>
                            </Select>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Students Table */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        {/* Desktop Table View */}
                        <Box display={{ base: "none", lg: "block" }}>
                            {sortedStudents.length === 0 ? (
                                <Box textAlign="center" py={8}>
                                    <Text color="gray.500">No students found</Text>
                                </Box>
                            ) : (
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Student</Th>
                                            <Th>Student ID</Th>
                                            <Th>Course</Th>
                                            <Th>Intake</Th>
                                            <Th>Year</Th>
                                            <Th>Status</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody fontSize={12}>
                                        {sortedStudents.map((student) => {
                                            if (student) {

                                                return (
                                                    <Tr key={student._id}>
                                                        <Td>
                                                            <HStack>
                                                                <Avatar size="sm" name={student.userId.name} />
                                                                <Box>
                                                                    <Text fontWeight="medium">{student.userId.name}</Text>
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        {student.userId.email}
                                                                    </Text>
                                                                </Box>
                                                            </HStack>
                                                        </Td>
                                                        <Td>{student._id}</Td>
                                                        <Td>
                                                            {student.intakeCourseId && student.intakeCourseId.courseId
                                                                ? student.intakeCourseId.courseId.courseName
                                                                : "N/A"}
                                                        </Td>
                                                        <Td>
                                                            {student.intakeCourseId && student.intakeCourseId.intakeId
                                                                ? student.intakeCourseId.intakeId.intakeName
                                                                : "N/A"}
                                                        </Td>
                                                        <Td>{student.currentYear}</Td>
                                                        <Td>
                                                            <Badge colorScheme={student.status === "active" ? "green" : "red"}>{student.status}</Badge>
                                                        </Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                <Button size="sm" colorScheme="blue" onClick={() => handleEdit(student)}>
                                                                    <FiEdit />
                                                                </Button>
                                                                <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(student._id)}>
                                                                    <FiTrash2 />
                                                                </Button>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                )
                                            }
                                        }
                                        )}
                                    </Tbody>
                                </Table>
                            )}
                        </Box>

                        {/* Mobile Accordion View */}
                        <Box display={{ base: "block", lg: "none" }}>
                            {sortedStudents.length === 0 ? (
                                <Box textAlign="center" py={8}>
                                    <Text color="gray.500">No students found</Text>
                                </Box>
                            ) : (
                                <Accordion allowMultiple>
                                    {sortedStudents.map((student) => (
                                        <AccordionItem key={student._id}>
                                            <h2>
                                                <AccordionButton>
                                                    <Box as="span" flex="1" textAlign="left">
                                                        <HStack>
                                                            <Avatar size="sm" name={student.userId.name} />
                                                            <Box>
                                                                <Text fontWeight="medium">{student.userId.name}</Text>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    {student.userId.email}
                                                                </Text>
                                                            </Box>
                                                        </HStack>
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                <VStack spacing={3} align="stretch">
                                                    <Flex justify="space-between">
                                                        <Text fontWeight="medium">Student ID:</Text>
                                                        <Text>{student._id}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between">
                                                        <Text fontWeight="medium">Course:</Text>
                                                        <Text>{student.intakeCourseId && student.intakeCourseId.courseId ? student.intakeCourseId.courseId.courseName : "N/A"}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between">
                                                        <Text fontWeight="medium">Intake:</Text>
                                                        <Text>{student.intakeCourseId && student.intakeCourseId.intakeId ? student.intakeCourseId.intakeId.intakeName : "N/A"}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between">
                                                        <Text fontWeight="medium">Year:</Text>
                                                        <Text>{student.currentYear}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between">
                                                        <Text fontWeight="medium">Status:</Text>
                                                        <Badge colorScheme={student.status === "active" ? "green" : "red"}>
                                                            {student.status}
                                                        </Badge>
                                                    </Flex>
                                                    <HStack spacing={2} justify="center" pt={2}>
                                                        <Button size="sm" colorScheme="blue" onClick={() => handleEdit(student)}>
                                                            <FiEdit />
                                                        </Button>
                                                        <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(student._id)}>
                                                            <FiTrash2 />
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                        </Box>
                    </CardBody>
                </Card>

                {/* Add/Edit Student Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <VStack align={"start"}>
                                <Text>
                                    {selectedStudent ? "Edit Student" : "Add New Student"}
                                </Text>
                                <Text fontSize={"sm"} fontWeight={300}>{selectedStudent ? `ID: ${formData.userId}` : ""}</Text>
                            </VStack >
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {renderStepContent()}
                        </ModalBody>
                        <ModalFooter>
                            {step > 0 && <Button variant="ghost" mr={3} onClick={handleBack}>Back</Button>}
                            {step < 2 && <Button colorScheme="blue" onClick={handleNext}>Next</Button>}
                            {step === 2 && (
                                selectedStudent ? (
                                    <Button bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={handleUpdateStudent}>
                                        Update Student
                                    </Button>
                                ) : (
                                    <Button bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={handleSubmit}>
                                        Add Student
                                    </Button>
                                )
                            )}
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <ComfirmationMessage
                    title="Confirm delete student?"
                    description="Student deleted won't be able to be restored"
                    isOpen={isDeleteOpen}
                    onClose={closeDeleteDialog}
                    onConfirm={handleDelete}
                />
            </VStack>
        </Box>
    )
}