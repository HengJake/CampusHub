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
import { useAcademicStore } from "../../store/academic.js";
import ComfirmationMessage from "../common/ComfirmationMessage.jsx";
import MultiSelectPopover from "../common/MultiSelectPopover.jsx";
import { useUserStore } from "../../store/user.js";
import TitleInputList from "../common/TitleInputList";
import { IoIosRemoveCircle } from "react-icons/io";
import { useShowToast } from "../../store/utils/toast.js"

export function LecturerManagement() {
    const {
        lecturers,
        departments,
        modules,
        fetchLecturers,
        fetchDepartments,
        fetchModules,
        createLecturer,
        updateLecturer,
        deleteLecturer
    } = useAcademicStore();

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

    useEffect(() => {

        if (lecturers.length == 0) {
            fetchLecturers();
        }

        if (fetchDepartments.length == 0) {
            fetchDepartments();
        }

        if (fetchModules.length == 0) {
            fetchModules();
        }

    }, []);


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
        onClose();
        fetchLecturers();
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
            fetchLecturers();
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
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{isEdit ? "Edit Lecturer" : "Add New Lecturer"}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4} align="stretch">
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
                                    </FormControl>
                                )}
                                <FormControl isRequired>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                </FormControl>

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
                                    <Select
                                        value={formData.departmentId}
                                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dep => (
                                            <option key={dep._id} value={dep._id}>{dep.departmentName}</option>
                                        ))}
                                    </Select>
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
                                    <Input
                                        value={formData.qualification}
                                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                        placeholder="e.g., PhD, Master's"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Experience (years)</FormLabel>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Status</FormLabel>
                                    <Select value={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.value === "true" })}>
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Office Hours</FormLabel>
                                    <Button size="sm" onClick={addOfficeHour}>Add Office Hour</Button>
                                    <VStack align="start" mt={2}>
                                        {formData.officeHours.map((oh, idx) => (
                                            <HStack key={idx}>
                                                <Select value={oh.day} onChange={e => updateOfficeHour(idx, "day", e.target.value)}>
                                                    <option value="Monday">Monday</option>
                                                    <option value="Tuesday">Tuesday</option>
                                                    <option value="Wednesday">Wednesday</option>
                                                    <option value="Thursday">Thursday</option>
                                                    <option value="Friday">Friday</option>
                                                </Select>
                                                <Input type="time" value={oh.startTime} onChange={e => updateOfficeHour(idx, "startTime", e.target.value)} />
                                                <Input type="time" value={oh.endTime} onChange={e => updateOfficeHour(idx, "endTime", e.target.value)} />
                                                <Button size="xs" colorScheme="red" onClick={() => removeOfficeHour(idx)}><IoIosRemoveCircle size={50} /></Button>
                                            </HStack>
                                        ))}
                                    </VStack>
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" onClick={handleSubmit}>
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
