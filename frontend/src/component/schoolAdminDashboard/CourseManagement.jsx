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
import ComfirmationMessage from "../common/ComfirmationMessage.jsx";
import TitleInputList from "../common/TitleInputList.jsx";
import MultiSelectPopover from "../common/MultiSelectPopover.jsx";

export function CourseManagement() {
    const {
        courses,
        createCourse,
        updateCourse,
        deleteCourse,
        fetchCourses,
        fetchModules,
        modules,
        fetchLecturers,
        lecturers,
        fetchDepartments,
        departments
    } = useAcademicStore()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const showToast = useShowToast();

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [departmentFilter, setDepartmentFilter] = useState("All")
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        courseName: "",            // String
        courseCode: "",            // String
        courseDescription: "",     // String
        courseLevel: "",           // 'Diploma' | 'Bachelor' | 'Master' | 'PhD'
        courseType: "Full Time",   // 'Full Time' | 'Part Time' | 'Distance Learning'
        totalCreditHours: 0,      // Number
        minimumCGPA: 2.0,          // Number (default)
        departmentId: "",          // ObjectId (select from Department list)
        duration: "",              // Number (in months)
        entryRequirements: [],     // Array of strings
        entryRequirementsInput: "",     // helper value
        careerProspects: [],       // Array of strings
        careerProspectsInput: "",       // helper
        isActive: true,            // Boolean
        schoolId: "",              // ObjectId (select from School list)
    });
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
        if (departments.length == 0) {
            fetchDepartments();
        }
    }, [])
    // console.log(courses)


    // useEffect(() => {
    //     console.log(formData);
    // }, [formData])
    console.log("🚀 ~ useEffect ~ courses:", courses)

    // helper function
    const removeFromArrayField = (field, idx) => {
        const updated = [...formData[field]];
        updated.splice(idx, 1);
        setFormData({ ...formData, [field]: updated });
    };

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

        const department = course.departmentId._id && course.departmentId.departmentName ? course.departmentId.departmentName : "";
        const matchesDepartment = departmentFilter === "All" || department === departmentFilter

        return matchesSearch && matchesStatus && matchesDepartment
    })

    const handleSubmit = async () => {
        if (!formData.courseCode || !formData.courseName || !formData.minimumCGPA) {
            showToast.error("Error", "Please fill in all required fields", "course-validation");
            return
        }

        if (isEditing) {
            if (!selectedCourse || !selectedCourse._id) {
                showToast.error("Error", "No course selected for editing", "course-edit-error");
                return;
            }

            const res = await updateCourse(selectedCourse._id, formData)
            if (!res || !res.success) {
                showToast.error("Error", res.message, "id-2")
                return;
            }

            showToast.success("Success", "Course updated successfully", "course-update");
        } else {
            // TODO:check for values
            const newCourse = {
                courseName: formData.courseName,
                courseCode: formData.courseCode,
                courseDescription: formData.courseDescription,
                courseLevel: formData.courseLevel,
                courseType: formData.courseType,
                totalCreditHours: Number(formData.totalCreditHours),
                minimumCGPA: parseFloat(formData.minimumCGPA), // force float
                departmentId: formData.departmentId,
                duration: Number(formData.duration),
                entryRequirements: formData.entryRequirements,
                careerProspects: formData.careerProspects,
                isActive: formData.isActive,
                schoolId: formData.schoolId,
            };
            const res = await createCourse(newCourse)
            if (!res || !res.success) {
                showToast.error("Error", res.message, "id-2")
                return;
            }
            showToast.success("Success", "Course added successfully", "course-add");
        }

        await fetchCourses();
        resetForm()
        onClose()
    }

    const resetForm = () => {
        setFormData({
            courseName: "",            // String
            courseCode: "",            // String
            courseDescription: "",     // String
            courseLevel: "",           // 'Diploma' | 'Bachelor' | 'Master' | 'PhD'
            courseType: "Full Time",   // 'Full Time' | 'Part Time' | 'Distance Learning'
            totalCreditHours: 0,      // Number
            minimumCGPA: 2.0,          // Number (default)
            departmentId: "",          // ObjectId (select from Department list)
            duration: "",              // Number (in months)
            entryRequirements: [],     // Array of strings
            entryRequirementsInput: "",     // helper value
            careerProspects: [],       // Array of strings
            careerProspectsInput: "",       // helper
            isActive: true,            // Boolean
            schoolId: "",              // ObjectId (select from School list)
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
        // TODO:change the form value
        setFormData({
            courseName: course.courseName || "",
            courseCode: course.courseCode || "",
            courseDescription: course.courseDescription || "",
            courseLevel: course.courseLevel || "",                 // e.g., 'Diploma'
            courseType: course.courseType || "Full Time",          // default fallback
            totalCreditHours: course.totalCreditHours || "",       // Number
            minimumCGPA: course.minimumCGPA ?? 2.0,                // Allow 0 as valid
            departmentId: course.departmentId._id || "",               // ObjectId
            duration: course.duration || "",                       // Number
            entryRequirements: course.entryRequirements || [],     // Array
            careerProspects: course.careerProspects || [],         // Array
            isActive: course.isActive !== undefined ? course.isActive : true,
            schoolId: course.schoolId || "",                       // ObjectId
        });
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

    // change csv with the new attribute
    const exportCourses = () => {
        const csvContent = [
            ["Course Code", "Course Name", "Description", "Credits", "Department", "Duration", "Status"],
            ...filteredCourses.map((course) => [
                course.courseCode || "N/A",
                course.courseName || "N/A",
                course.description || "N/A",
                course.credits || course.totalCreditHours || "N/A",
                course.departmentId?.departmentName || course.department || "N/A",
                course.duration || "N/A",
                course.isActive ? "Active" : "Inactive",
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "courses.csv"
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
                            Course Management
                        </Text>
                        <Text color="gray.600">Manage courses and curriculum</Text>
                    </Box>
                    <HStack>
                        <Button leftIcon={<FiDownload />} variant="outline" onClick={exportCourses}>
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
                                                    {course.departmentId.departmentName}
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
                                        placeholder="BCS"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Course Name</FormLabel>
                                    <Input
                                        value={formData.courseName}
                                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                        placeholder="Bachelor of Computer Science (Hons)"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Course Level</FormLabel>
                                    <Select
                                        value={formData.courseLevel}
                                        onChange={(e) => setFormData({ ...formData, courseLevel: e.target.value })}
                                    >
                                        <option value="">Select Level</option>
                                        <option value="Diploma">Diploma</option>
                                        <option value="Bachelor">Bachelor</option>
                                        <option value="Master">Master</option>
                                        <option value="PhD">PhD</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Course Type</FormLabel>
                                    <Select
                                        value={formData.courseType}
                                        onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                                    >
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Distance Learning">Distance Learning</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Total Credit Hours</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.totalCreditHours}
                                        onChange={(e) => setFormData({ ...formData, totalCreditHours: e.target.value })}
                                        placeholder="120"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Minimum CGPA</FormLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={formData.minimumCGPA}
                                        onChange={(e) => setFormData({ ...formData, minimumCGPA: e.target.value })}
                                        placeholder="2.0"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Duration (Months)</FormLabel>
                                    <Select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    >
                                        <option value="">Select Duration</option>
                                        <option value="12">1 Year</option>
                                        <option value="24">2 Years</option>
                                        <option value="36">3 Years</option>
                                        <option value="48">4 Years</option>
                                        <option value="60">5 Years</option>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <FormControl mt={4}>
                                <FormLabel>Course Description</FormLabel>
                                <Textarea
                                    value={formData.courseDescription}
                                    onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
                                    placeholder="Detailed course description..."
                                    rows={3}
                                />
                            </FormControl>

                            <FormControl mt={4}>
                                {/*TODO:use multie select */}
                                <MultiSelectPopover
                                    label={"Entry Requirement"}
                                    items={modules}
                                    selectedIds={formData.entryRequirements}
                                    onChange={selected => setFormData({ ...formData, entryRequirements: selected })}
                                    isRequired={false}
                                    getLabel={module => module.moduleName}
                                    getId={module => module._id}
                                />
                            </FormControl>

                            <FormControl mt={4}>
                                <TitleInputList
                                    label="Career Prospects"
                                    placeholder="Add Prospects"
                                    values={formData.careerProspects.length === 0 ? [] : formData.careerProspects}
                                    inputValue={formData.careerProspectsInput || ""}
                                    setInputValue={val => setFormData({ ...formData, careerProspectsInput: val })}
                                    onAdd={val => {
                                        if (val && !formData.careerProspects.includes(val)) {
                                            setFormData({ ...formData, careerProspects: [...formData.careerProspects, val], careerProspectsInput: "" });
                                        }
                                    }}
                                    onRemove={idx => removeFromArrayField("careerProspects", idx)}
                                />
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
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
        </Box>
    )
}
