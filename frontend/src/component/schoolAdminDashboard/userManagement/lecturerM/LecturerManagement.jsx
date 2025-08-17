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
    Divider,
    InputGroup,
    InputLeftElement,
    InputRightElement
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiDownload, FiUser, FiMail, FiPhone, FiLock, FiBookOpen, FiAward, FiClock } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../../../store/academic.js";
import ComfirmationMessage from "../../../common/ComfirmationMessage.jsx";
import MultiSelectPopover from "../../../common/MultiSelectPopover.jsx";
import { useUserStore } from "../../../../store/user.js";
import TitleInputList from "../../../common/TitleInputList.jsx";
import { IoIosRemoveCircle } from "react-icons/io";
import { useShowToast } from "../../../../store/utils/toast.js"
import { useAuthStore } from "../../../../store/auth.js";

export function LecturerManagement() {
    const {
        lecturers,
        departments,
        modules,
        fetchLecturersBySchoolId,
        fetchDepartmentsBySchoolId,
        fetchModulesBySchoolId,
        createLecturer,
        updateLecturer,
        deleteLecturer
    } = useAcademicStore();

    const { initializeAuth } = useAuthStore();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const showToast = useShowToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [lecturerToDelete, setLecturerToDelete] = useState(null);
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const { createUser, modifyUser } = useUserStore();

    // Form validation states
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const initializeAndFetch = async () => {
            // First initialize auth from cookies
            const authResult = await initializeAuth();
            if (authResult.success) {
                // Then fetch data only if not already loaded
                if (lecturers.length == 0) {
                    fetchLecturersBySchoolId();
                }

                if (departments.length == 0) {
                    fetchDepartmentsBySchoolId();
                }

                if (modules.length == 0) {
                    fetchModulesBySchoolId();
                }
            }
        };

        initializeAndFetch();
    }, []);

    // Validation functions
    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                if (!value.trim()) return "Full name is required";
                if (value.trim().length < 2) return "Name must be at least 2 characters";
                return "";
            case 'email':
                if (!value.trim()) return "Email is required";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return "Please enter a valid email address";
                return "";
            case 'password':
                if (!isEdit && !value) return "Password is required";
                if (!isEdit && value.length < 8) return "Password must be at least 8 characters";
                return "";
            case 'phoneNumber':
                if (!value.trim()) return "Phone number is required";
                const phoneRegex = /^(\+?60|60|0|01)?[1-9][0-9]{7,8}$/;
                if (!phoneRegex.test(value.replace(/\s+/g, ''))) return "Please enter a valid Malaysian phone number";
                return "";
            case 'departmentId':
                if (!value) return "Department is required";
                return "";
            case 'qualification':
                if (!value.trim()) return "Qualification is required";
                return "";
            case 'experience':
                if (value < 0) return "Experience cannot be negative";
                return "";
            default:
                return "";
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (touched[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field]);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const isFormValid = () => {
        const requiredFields = ['name', 'email', 'phoneNumber', 'departmentId', 'qualification'];
        if (!isEdit) requiredFields.push('password');

        return requiredFields.every(field => {
            const error = validateField(field, formData[field]);
            return !error;
        });
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        userId: "",
        title: [],
        titleInput: "",
        departmentId: "",
        moduleIds: [],
        specialization: [],
        specializationInput: "",
        qualification: "",
        experience: 0,
        isActive: true,
        officeHours: [
        ],
        schoolId: ""
    });


    // Filtering
    const filteredLecturers = lecturers.filter((lecturer) => {
        const matchesSearch =
            (lecturer.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lecturer.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || (lecturer.isActive === (statusFilter === "active"));
        const matchesDepartment = departmentFilter === "all" || (lecturer.departmentId?._id === departmentFilter);
        return matchesSearch && matchesStatus && matchesDepartment;
    });

    // Handlers
    const handleSubmit = async () => {
        // Validate user fields
        if (!formData.name || !formData.email || (!isEdit && !formData.password) || !formData.phoneNumber) {
            showToast({ title: "Error", description: "Please fill in all user fields", status: "error" });
            return;
        }
        // Validate lecturer fields...
        if (!formData.title.length || !formData.departmentId || !formData.qualification || formData.experience < 0) {
            showToast({ title: "Error", description: "Please fill in all required fields", status: "error" });
            return;
        }

        let userId = formData.userId;
        if (isEdit) {
            // Update user
            const userRes = await modifyUser(userId, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: "lecturer"
            });
            if (!userRes.success) {
                showToast({ title: "Error", description: userRes.message, status: "error" });
                return;
            }
        } else {
            // Create user
            const userRes = await createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: "lecturer"
            });
            if (!userRes.success) {
                showToast({ title: "Error", description: userRes.message, status: "error" });
                return;
            }
            userId = userRes.data._id;
        }

        // Now create/update lecturer with userId
        const submitData = { ...formData, userId };
        // console.log("🚀 ~ handleSubmit ~ submitData:", submitData)
        let res;
        if (isEdit) {
            res = await updateLecturer(selectedLecturer._id, submitData);
        } else {
            res = await createLecturer(submitData);
        }

        if (!res.success) {
            showToast.error("Error", res.message);
            return;
        } else if (isEdit) {
            showToast.success("Successfully update lecturer", res.message, "edit")
        } else {
            showToast.success("Successfully created lecturer", res.message, "edit")
        }

        setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            userId: "",
            title: [],
            departmentId: "",
            moduleIds: [],
            specialization: [],
            qualification: "",
            experience: 0,
            isActive: true,
            officeHours: [],
            schoolId: ""
        });
        setSelectedLecturer(null);
        setIsEdit(false);
        setTouched({});
        setErrors({});
        onClose();
        fetchLecturersBySchoolId();
    };

    const handleEdit = (lecturer) => {
        setSelectedLecturer(lecturer);
        setFormData({
            name: lecturer.userId?.name || "",
            email: lecturer.userId?.email || "",
            phoneNumber: lecturer.userId?.phoneNumber || "",
            userId: lecturer.userId?._id || "",
            title: lecturer.title || [],
            departmentId: lecturer.departmentId?._id || "",
            moduleIds: lecturer.moduleIds || [],
            specialization: lecturer.specialization || [],
            qualification: lecturer.qualification || "",
            experience: lecturer.experience || 0,
            isActive: lecturer.isActive !== undefined ? lecturer.isActive : true,
            officeHours: lecturer.officeHours || [],
            schoolId: lecturer.schoolId?._id || ""
        });
        setIsEdit(true);
        setTouched({});
        setErrors({});
        onOpen();
    };

    const openDeleteDialog = (lecturerId) => {
        setLecturerToDelete(lecturerId);
        setIsDeleteOpen(true);
    };
    const closeDeleteDialog = () => {
        setIsDeleteOpen(false);
        setLecturerToDelete(null);
    };
    const handleDelete = async () => {
        if (!lecturerToDelete) return;
        const res = await deleteLecturer(lecturerToDelete);
        if (res && res.success) {
            showToast({ title: "Success", description: "Lecturer deleted successfully", status: "success" });
            fetchLecturersBySchoolId();
        } else {
            showToast({ title: "Error", description: res && res.message ? res.message : "", status: "error" });
        }
        closeDeleteDialog();
    };

    const exportLecturers = () => {
        const csvContent = [
            ["Name", "Email", "Phone Number", "Titles", "Department", "Specializations", "Qualification", "Experience", "Status"],
            ...filteredLecturers.map((lecturer) => [
                lecturer.userId?.name || "N/A",
                lecturer.userId?.email || "N/A",
                lecturer.userId?.phoneNumber || "N/A",
                (lecturer.title || []).join("; "),
                lecturer.departmentId?.departmentName || "N/A",
                (lecturer.specialization || []).join("; "),
                lecturer.qualification || "N/A",
                lecturer.experience || "N/A",
                lecturer.isActive ? "Active" : "Inactive",
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "lecturers.csv"
        a.click()
        window.URL.revokeObjectURL(url)
    }

    // Office hours management (simple add/remove)
    const addOfficeHour = () => {
        // Check if there are any available days (not already used)
        const usedDays = formData.officeHours.map(oh => oh.day);
        const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].filter(day => !usedDays.includes(day));

        if (availableDays.length === 0) {
            showToast({
                title: "No available days",
                description: "All weekdays already have office hours assigned",
                status: "warning"
            });
            return;
        }

        setFormData({
            ...formData,
            officeHours: [...formData.officeHours, { day: availableDays[0], startTime: "09:00", endTime: "10:00" }]
        });
    };
    const updateOfficeHour = (idx, field, value) => {
        const updated = [...formData.officeHours];

        // If updating the day field, check for duplicates
        if (field === "day") {
            const usedDays = formData.officeHours.map((oh, i) => i !== idx ? oh.day : null).filter(day => day !== null);
            if (usedDays.includes(value)) {
                showToast({
                    title: "Duplicate day",
                    description: `Office hours for ${value} already exist`,
                    status: "error"
                });
                return;
            }
        }

        updated[idx][field] = value;
        setFormData({ ...formData, officeHours: updated });
    };
    const removeOfficeHour = (idx) => {
        const updated = [...formData.officeHours];
        updated.splice(idx, 1);
        setFormData({ ...formData, officeHours: updated });
    };

    // Specialization and title management
    const removeFromArrayField = (field, idx) => {
        const updated = [...formData[field]];
        updated.splice(idx, 1);
        setFormData({ ...formData, [field]: updated });
    };

    return (
        <Box flex={1} minH="100vh">
            <VStack spacing={6} align="stretch" >
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="#333333">
                            Lecturer Management
                        </Text>
                        <Text color="gray.600">Manage lecturer accounts and assignments</Text>
                    </Box>
                    <HStack>
                        <Button leftIcon={<FiDownload />} variant="outline" onClick={exportLecturers}>
                            Export
                        </Button>
                        <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={() => {
                            setIsEdit(false);
                            setFormData({
                                name: "",
                                email: "",
                                password: "",
                                phoneNumber: "",
                                userId: "",
                                title: [],
                                departmentId: "",
                                moduleIds: [],
                                specialization: [],
                                qualification: "",
                                experience: 0,
                                isActive: true,
                                officeHours: [],
                                schoolId: ""
                            });
                            setSelectedLecturer(null);
                            setTouched({});
                            setErrors({});
                            onOpen();
                        }}>
                            Add Lecturer
                        </Button>
                    </HStack>
                </HStack>

                {/* Filters */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4} mb={4} flexWrap="wrap" gap={2}>
                            <Box flex="1" minW="200px">
                                <Input
                                    placeholder="Search lecturers..."
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
                            </Select>
                            <Select
                                w={{ base: "full", sm: "200px" }}
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dep => (
                                    <option key={dep._id} value={dep._id}>{dep.departmentName}</option>
                                ))}
                            </Select>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Lecturers Table */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Box display={{ base: "none", lg: "block" }}>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Email</Th>
                                        <Th>Titles</Th>
                                        <Th>Department</Th>
                                        <Th>Specializations</Th>
                                        <Th>Qualification</Th>
                                        <Th>Status</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody fontSize={"12px"}>
                                    {filteredLecturers.map((lecturer) => (
                                        <Tr key={lecturer._id}>
                                            <Td>{lecturer.userId?.name || "N/A"}</Td>
                                            <Td>{lecturer.userId?.email || "N/A"}</Td>
                                            <Td>{(lecturer.title || []).join(", ")}</Td>
                                            <Td>{lecturer.departmentId?.departmentName || "N/A"}</Td>
                                            <Td>{(lecturer.specialization || []).join(", ")}</Td>
                                            <Td>{lecturer.qualification}</Td>
                                            <Td>
                                                <Badge colorScheme={lecturer.isActive ? "green" : "red"}>{lecturer.isActive ? "Active" : "Inactive"}</Badge>
                                            </Td>
                                            <Td>
                                                <HStack spacing={2}>
                                                    <Button size="sm" colorScheme="blue" onClick={() => handleEdit(lecturer)}>
                                                        <FiEdit />
                                                    </Button>
                                                    <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(lecturer._id)}>
                                                        <FiTrash2 />
                                                    </Button>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                        {/* Mobile Accordion View */}
                        <Box display={{ base: "block", lg: "none" }}>
                            <Accordion allowMultiple>
                                {filteredLecturers.map((lecturer) => (
                                    <AccordionItem key={lecturer._id}>
                                        <h2>
                                            <AccordionButton>
                                                <Box as="span" flex="1" textAlign="left">
                                                    <Text fontWeight="medium">{lecturer.userId?.name || "N/A"}</Text>
                                                    <Text fontSize="sm" color="gray.600">{lecturer.userId?.email || "N/A"}</Text>
                                                </Box>
                                                <AccordionIcon />
                                            </AccordionButton>
                                        </h2>
                                        <AccordionPanel pb={4}>
                                            <VStack spacing={3} align="stretch">
                                                <Box>
                                                    <Text fontWeight="semibold">Titles:</Text>
                                                    <Text>{(lecturer.title || []).join(", ")}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Department:</Text>
                                                    <Text>{lecturer.departmentId?.departmentName || "N/A"}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Specializations:</Text>
                                                    <Text>{(lecturer.specialization || []).join(", ")}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Qualification:</Text>
                                                    <Text>{lecturer.qualification}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Experience:</Text>
                                                    <Text>{lecturer.experience}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Status:</Text>
                                                    <Badge colorScheme={lecturer.isActive ? "green" : "red"}>{lecturer.isActive ? "Active" : "Inactive"}</Badge>
                                                </Box>
                                                <HStack spacing={2} justify="center" pt={2}>
                                                    <Button size="sm" colorScheme="blue" onClick={() => handleEdit(lecturer)}>
                                                        <FiEdit />
                                                    </Button>
                                                    <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(lecturer._id)}>
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

                {/* Add/Edit Lecturer Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay />
                    <ModalContent bg="rgba(220, 252, 231, 0.1)" backdropFilter="blur(10px)" color="white">
                        <ModalHeader>{isEdit ? "Edit Lecturer" : "Add New Lecturer"}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={6} align="stretch">
                                {/* User Information Section */}
                                <Box>
                                    <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.100">
                                        User Information
                                    </Text>
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Full Name</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement>
                                                    <FiUser color="rgba(255, 255, 255, 0.5)" />
                                                </InputLeftElement>
                                                <Input
                                                    value={formData.name}
                                                    onChange={e => handleInputChange("name", e.target.value)}
                                                    onBlur={() => handleBlur("name")}
                                                    isInvalid={!!errors.name}
                                                    errorBorderColor="red.300"
                                                    focusBorderColor={!errors.name && formData.name ? "green.400" : "blue.400"}
                                                    borderColor={!errors.name && formData.name ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                    bg="rgba(255, 255, 255, 0.1)"
                                                    _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                                                    placeholder="Enter full name"
                                                />
                                            </InputGroup>
                                            {errors.name && (
                                                <Text fontSize="xs" color="red.400" textAlign="left">{errors.name}</Text>
                                            )}
                                            {!errors.name && formData.name && (
                                                <Text fontSize="xs" color="green.400" textAlign="left">
                                                    ✓ Name is valid
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Email</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement>
                                                    <FiMail color="rgba(255, 255, 255, 0.5)" />
                                                </InputLeftElement>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => handleInputChange("email", e.target.value)}
                                                    onBlur={() => handleBlur("email")}
                                                    isInvalid={!!errors.email}
                                                    errorBorderColor="red.300"
                                                    focusBorderColor={!errors.email && formData.email ? "green.400" : "blue.400"}
                                                    borderColor={!errors.email && formData.email ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                    bg="rgba(255, 255, 255, 0.1)"
                                                    _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                                                    placeholder="Enter email address"
                                                />
                                            </InputGroup>
                                            {errors.email && (
                                                <Text fontSize="xs" color="red.400" textAlign="left">{errors.email}</Text>
                                            )}
                                            {!errors.email && formData.email && (
                                                <Text fontSize="xs" color="green.400" textAlign="left">
                                                    ✓ Valid email address
                                                </Text>
                                            )}
                                        </FormControl>

                                        {!isEdit && (
                                            <FormControl isRequired>
                                                <FormLabel>Password</FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement>
                                                        <FiLock color="rgba(255, 255, 255, 0.5)" />
                                                    </InputLeftElement>
                                                    <Input
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={e => handleInputChange("password", e.target.value)}
                                                        onBlur={() => handleBlur("password")}
                                                        isInvalid={!!errors.password}
                                                        errorBorderColor="red.300"
                                                        focusBorderColor={!errors.password && formData.password ? "green.400" : "blue.400"}
                                                        borderColor={!errors.password && formData.password ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                        bg="rgba(255, 255, 255, 0.1)"
                                                        _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                                                        placeholder="Enter password"
                                                    />
                                                </InputGroup>
                                                {errors.password && (
                                                    <Text fontSize="xs" color="red.400" textAlign="left">{errors.password}</Text>
                                                )}
                                                {!errors.password && formData.password && (
                                                    <Text fontSize="xs" color="green.400" textAlign="left">
                                                        ✓ Password meets requirements
                                                    </Text>
                                                )}
                                            </FormControl>
                                        )}

                                        <FormControl isRequired>
                                            <FormLabel>Phone Number</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement>
                                                    <FiPhone color="rgba(255, 255, 255, 0.5)" />
                                                </InputLeftElement>
                                                <Input
                                                    value={formData.phoneNumber}
                                                    onChange={e => handleInputChange("phoneNumber", e.target.value)}
                                                    onBlur={() => handleBlur("phoneNumber")}
                                                    isInvalid={!!errors.phoneNumber}
                                                    errorBorderColor="red.300"
                                                    focusBorderColor={!errors.phoneNumber && formData.phoneNumber ? "green.400" : "blue.400"}
                                                    borderColor={!errors.phoneNumber && formData.phoneNumber ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                    bg="rgba(255, 255, 255, 0.1)"
                                                    _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                                                    placeholder="Enter phone number"
                                                />
                                            </InputGroup>
                                            {errors.phoneNumber && (
                                                <Text fontSize="xs" color="red.400" textAlign="left">{errors.phoneNumber}</Text>
                                            )}
                                            {!errors.phoneNumber && formData.phoneNumber && (
                                                <Text fontSize="xs" color="green.400" textAlign="left">
                                                    ✓ Valid phone number
                                                </Text>
                                            )}
                                        </FormControl>
                                    </VStack>
                                </Box>

                                <Divider borderColor="rgba(255, 255, 255, 0.2)" />

                                {/* Academic Information Section */}
                                <Box>
                                    <Text fontSize="lg" fontWeight="bold" mb={4} color="green.300">
                                        Academic Information
                                    </Text>
                                    <VStack spacing={4}>
                                        <TitleInputList
                                            label="Titles"
                                            placeholder="Add title (e.g., Dr.)"
                                            values={formData.title}
                                            inputValue={formData.titleInput || ""}
                                            setInputValue={val => setFormData({ ...formData, titleInput: val })}
                                            onAdd={val => {
                                                if (val && !formData.title.includes(val)) {
                                                    setFormData({ ...formData, title: [...formData.title, val], titleInput: "" });
                                                }
                                            }}
                                            onRemove={idx => removeFromArrayField("title", idx)}
                                        />

                                        <FormControl isRequired>
                                            <FormLabel>Department</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement>
                                                    <FiBookOpen color="rgba(255, 255, 255, 0.5)" />
                                                </InputLeftElement>
                                                <Select
                                                    value={formData.departmentId}
                                                    onChange={e => handleInputChange("departmentId", e.target.value)}
                                                    onBlur={() => handleBlur("departmentId")}
                                                    isInvalid={!!errors.departmentId}
                                                    errorBorderColor="red.300"
                                                    focusBorderColor={!errors.departmentId && formData.departmentId ? "green.400" : "blue.400"}
                                                    borderColor={!errors.departmentId && formData.departmentId ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                    bg="rgba(255, 255, 255, 0.1)"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map(dep => (
                                                        <option key={dep._id} value={dep._id}>{dep.departmentName}</option>
                                                    ))}
                                                </Select>
                                            </InputGroup>
                                            {errors.departmentId && (
                                                <Text fontSize="xs" color="red.400" textAlign="left">{errors.departmentId}</Text>
                                            )}
                                            {!errors.departmentId && formData.departmentId && (
                                                <Text fontSize="xs" color="green.400" textAlign="left">
                                                    ✓ Department selected
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl>
                                            <MultiSelectPopover
                                                label={"Modules"}
                                                items={modules}
                                                selectedIds={formData.moduleIds}
                                                onChange={selected => setFormData({ ...formData, moduleIds: selected })}
                                                isRequired={true}
                                                getLabel={module => module.moduleName}
                                                getId={module => module._id}
                                            />
                                        </FormControl>

                                        <TitleInputList
                                            label="Specializations"
                                            placeholder="Add specialization"
                                            values={formData.specialization}
                                            inputValue={formData.specializationInput || ""}
                                            setInputValue={val => setFormData({ ...formData, specializationInput: val })}
                                            onAdd={val => {
                                                if (val && !formData.specialization.includes(val)) {
                                                    setFormData({ ...formData, specialization: [...formData.specialization, val], specializationInput: "" });
                                                }
                                            }}
                                            onRemove={idx => removeFromArrayField("specialization", idx)}
                                        />

                                        <FormControl isRequired>
                                            <FormLabel>Qualification</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement>
                                                    <FiAward color="rgba(255, 255, 255, 0.5)" />
                                                </InputLeftElement>
                                                <Input
                                                    value={formData.qualification}
                                                    onChange={e => handleInputChange("qualification", e.target.value)}
                                                    onBlur={() => handleBlur("qualification")}
                                                    isInvalid={!!errors.qualification}
                                                    errorBorderColor="red.300"
                                                    focusBorderColor={!errors.qualification && formData.qualification ? "green.400" : "blue.400"}
                                                    borderColor={!errors.qualification && formData.qualification ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                    bg="rgba(255, 255, 255, 0.1)"
                                                    _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                                                    placeholder="e.g., PhD, Master's"
                                                />
                                            </InputGroup>
                                            {errors.qualification && (
                                                <Text fontSize="xs" color="red.400" textAlign="left">{errors.qualification}</Text>
                                            )}
                                            {!errors.qualification && formData.qualification && (
                                                <Text fontSize="xs" color="green.400" textAlign="left">
                                                    ✓ Qualification entered
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Experience (years)</FormLabel>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.experience}
                                                onChange={e => handleInputChange("experience", parseInt(e.target.value))}
                                                onBlur={() => handleBlur("experience")}
                                                isInvalid={!!errors.experience}
                                                errorBorderColor="red.300"
                                                focusBorderColor={!errors.experience && formData.experience >= 0 ? "green.400" : "blue.400"}
                                                borderColor={!errors.experience && formData.experience >= 0 ? "green.400" : "rgba(255, 255, 255, 0.2)"}
                                                bg="rgba(255, 255, 255, 0.1)"
                                                _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                                                placeholder="Enter years of experience"
                                            />
                                            {errors.experience && (
                                                <Text fontSize="xs" color="red.400" textAlign="left">{errors.experience}</Text>
                                            )}
                                            {!errors.experience && formData.experience >= 0 && (
                                                <Text fontSize="xs" color="green.400" textAlign="left">
                                                    ✓ Experience entered
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                value={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                                bg="rgba(255, 255, 255, 0.1)"
                                                borderColor="rgba(255, 255, 255, 0.2)"
                                            >
                                                <option value={true}>Active</option>
                                                <option value={false}>Inactive</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Office Hours</FormLabel>
                                            <Button size="sm" onClick={addOfficeHour} leftIcon={<FiClock />} variant="outline" borderColor="rgba(255, 255, 255, 1)" color="white">
                                                Add Office Hour
                                            </Button>
                                            <VStack align="start" mt={2}>
                                                {formData.officeHours.map((oh, idx) => (
                                                    <HStack key={idx} bg="rgba(220, 255, 231, 0.3)" p={2} borderRadius="md" w="100%">
                                                        <Select
                                                            value={oh.day}
                                                            onChange={e => updateOfficeHour(idx, "day", e.target.value)}
                                                            bg="rgba(255, 255, 255, 0.1)"
                                                            borderColor="rgba(255, 255, 255, 0.2)"
                                                            size="sm"
                                                        >
                                                            <option value="Monday">Monday</option>
                                                            <option value="Tuesday">Tuesday</option>
                                                            <option value="Wednesday">Wednesday</option>
                                                            <option value="Thursday">Thursday</option>
                                                            <option value="Friday">Friday</option>
                                                        </Select>
                                                        <Input
                                                            type="time"
                                                            value={oh.startTime}
                                                            onChange={e => updateOfficeHour(idx, "startTime", e.target.value)}
                                                            bg="rgba(255, 255, 255, 0.1)"
                                                            borderColor="rgba(255, 255, 255, 0.2)"
                                                            size="sm"
                                                        />
                                                        <Input
                                                            type="time"
                                                            value={oh.endTime}
                                                            onChange={e => updateOfficeHour(idx, "endTime", e.target.value)}
                                                            bg="rgba(255, 255, 255, 0.1)"
                                                            borderColor="rgba(255, 255, 255, 0.2)"
                                                            size="sm"
                                                        />
                                                        <Button size="xs" colorScheme="red" onClick={() => removeOfficeHour(idx)}>
                                                            <IoIosRemoveCircle />
                                                        </Button>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </FormControl>
                                    </VStack>
                                </Box>

                                {/* Form validation status */}
                                <Box
                                    p={3}
                                    borderRadius="md"
                                    bg={isFormValid() ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}
                                    border="1px solid"
                                    borderColor={isFormValid() ? "green.400" : "red.400"}
                                >
                                    <Text
                                        fontSize="sm"
                                        color={isFormValid() ? "green.200" : "red.200"}
                                        textAlign="center"
                                    >
                                        {isFormValid()
                                            ? "✓ All required fields are valid - You can save the lecturer!"
                                            : "⚠ Please fill all required fields correctly to continue"
                                        }
                                    </Text>
                                </Box>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose} color="white" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleSubmit}
                                isDisabled={!isFormValid()}
                                bg="#344E41"
                                color="white"
                                _hover={{ bg: "#2a3d33" }}
                            >
                                {isEdit ? "Update" : "Add"} Lecturer
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <ComfirmationMessage
                    title="Confirm delete lecturer?"
                    description="Deleted lecturer can't be restored"
                    isOpen={isDeleteOpen}
                    onClose={closeDeleteDialog}
                    onConfirm={handleDelete}
                />
            </VStack>
        </Box>
    );
}
