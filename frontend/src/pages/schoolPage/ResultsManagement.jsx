import {
    Box,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    useColorModeValue,
    useToast,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Spinner,
    Center,
    FormControl,
    FormLabel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Select,
    Heading,
    Tfoot,
    CardFooter,
    Divider,
    Accordion,
    AccordionButton,
    AccordionItem,
    AccordionIcon,
    AccordionPanel,
    Link,
    Badge,
    IconButton,
    ButtonGroup,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Textarea
} from "@chakra-ui/react"
import { FiUpload } from "react-icons/fi"
import { useMemo, useState, useRef, useEffect } from "react"
import { useAcademicStore } from "../../store/academic"
import { FaFileDownload } from "react-icons/fa";
import { useGeneralStore } from "../../store/general";
import { useShowToast } from "../../store/utils/toast.js"
import * as XLSX from "xlsx"
import { SearchIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons"
// CSV columns: Student ID, Student Name, Subject Code, Subject Name, Semester, Academic Year, Credit Hours, Grade, GPA, Marks, Total Marks, Status

export default function ResultsBulkUpload() {
    const { createResult, fetchStudents, students, fetchIntakeCourses, intakeCourses, results, fetchResults, modules, fetchModules, updateResult, deleteResult } = useAcademicStore();
    const { exportTemplate } = useGeneralStore();
    const showToast = useShowToast();

    useEffect(() => {
        fetchIntakeCourses();
        fetchResults();
        fetchModules();
        fetchStudents();
    }, [])

    // console.log("🚀 ~ ResultsBulkUpload ~ results:", results)
    // console.log("🚀 ~ ResultsBulkUpload ~ intakeCourses:", intakeCourses)
    // console.log("🚀 ~ ResultsBulkUpload ~ modules:", modules)


    const [csvData, setCsvData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const fileInputRef = useRef(null)
    const toast = useToast()
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    // Edit modal state
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
    const [selectedResult, setSelectedResult] = useState(null)
    const [editFormData, setEditFormData] = useState({
        grade: '',
        creditHours: '',
        marks: '',
        totalMarks: '',
        gpa: '',
        remark: ''
    })
    const [isEditLoading, setIsEditLoading] = useState(false)

    // Delete confirmation state
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const [deleteResultId, setDeleteResultId] = useState(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const cancelRef = useRef()

    // Intake/course preview state
    const [selectedIntake, setSelectedIntake] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("")
    const [selectedModule, setSelectedModule] = useState("");
    const [previewResults, setPreviewResults] = useState([])

    // Filter options
    const [moduleFilter, setModuleFilter] = useState("all");
    const [searchUserName, setSearchUserName] = useState("");
    const filteredResults = results.filter((result) => {
        const matchesModule = moduleFilter === "all" || (result.moduleId._id === moduleFilter);
        const matchesUserName = searchUserName === "" ||
            (result?.studentId?.userId?.name?.toLowerCase().includes(searchUserName.toLowerCase()));
        return matchesModule && matchesUserName;
    });

    useEffect(() => {
        if (!selectedIntake || !selectedCourse) {
            setPreviewResults([])
            return
        }
        setPreviewResults(results.filter(r => r.studentId.intakeCourseId.courseId === selectedCourse && r.studentId.intakeCourseId.intakeId === selectedIntake && (selectedModule ? r.moduleId._id == selectedModule : true)))
    }, [selectedCourse, selectedIntake, selectedModule])

    // CSV file handling
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return; // ✅ Guard clause

        setIsLoading(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" }); // ✅ Use 'array' for ArrayBuffer
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                setCsvData(parsedData);
                setIsSubmitting(true)
                toast({
                    title: "File Uploaded",
                    description: `${parsedData.length} rows extracted`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error reading file:", error);
                toast({
                    title: "Upload Error",
                    description: "Invalid Excel format",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
                onClose();
            }
        };

        reader.onerror = () => {
            setIsLoading(false);
            toast({
                title: "Read Error",
                description: "Failed to read file",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        };

        reader.readAsArrayBuffer(file); // ✅ Only call this AFTER checking file exists
    };

    // Placeholder for API call
    const handleSubmit = async () => {
        setIsLoading(true); // Add loading state

        try {
            const promises = csvData.map(async (data, idx) => {
                if (data.grade === "" || data.creditHours === "") {
                    showToast.error(`Error in line ${idx + 1}`, "Please ensure the columns are filled", 'id-1');
                    return { success: false, index: idx };
                }

                const res = await createResult(data);

                if (!res.success) {
                    showToast.error(`Error in line ${idx + 1}`, res.message);
                    return { success: false, index: idx };
                }

                showToast.success("Bulk data added successfully", `Result ${idx + 1} : ${res.message}`, "id-3");
                return { success: true, index: idx };
            });

            await Promise.all(promises);

            // Refresh the results data after successful insertion
            await fetchResults();

            // Clear the form
            setIsSubmitting(false);
            setCsvData([]);
            setSelectedModule("");
            setSelectedCourse("");
            setSelectedIntake("");

        } catch (error) {
            console.error("Error submitting results:", error);
            showToast.error("Submission Error", "An error occurred while submitting results");
        } finally {
            setIsLoading(false);
        }
    }
    const selectedIntakeCourse = useMemo(() =>
        intakeCourses.find(ic => ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse),
        [intakeCourses, selectedIntake, selectedCourse]
    );

    const selectedModule2 = useMemo(() =>
        modules.find(m => m._id === selectedModule),
        [modules, selectedModule]
    );
    // download template with calling api from backend
    const handleDownloadTemplate = async () => {

        if (!selectedCourse || !selectedIntake) {
            showToast.error("Please select intake and course to generate template", "", "meow");
            return;
        }

        // console.log("🚀 ~ handleDownloadTemplate ~ intakeCourse.intakeId._id === selectedIntake:", String(intakeCourses[0].intakeId._id) === String(selectedIntake))
        // console.log("🚀 ~ handleDownloadTemplate ~ intakeCourses:", intakeCourses)
        // console.log("🚀 ~ handleDownloadTemplate ~ courseName:", selectedIntakeCourse)

        const columns = [
            { header: "intakeCourseId", key: "intakeCourseId", width: 10 },
            { header: "intakeName", key: "intakeName", width: 25 },
            { header: "courseName", key: "courseName", width: 25 },
            { header: "moduleId", key: "moduleId", width: 10 },
            { header: "moduleName", key: "moduleName", width: 25 },
            { header: "studentId", key: "studentId", width: 10 },
            { header: "name", key: "name", width: 25 },
            { header: "grade", key: "grade", width: 25 },
            { header: "creditHours", key: "creditHours", width: 25 },
            { header: "remark", key: "remark", width: 25 },
        ]

        const formattedStudents = students.map((student) => ({
            intakeCourseId: selectedIntakeCourse._id,
            intakeName: selectedIntakeCourse.intakeId.intakeName,
            courseName: selectedIntakeCourse.courseId.courseName,
            moduleId: selectedModule2._id,
            moduleName: selectedModule2.moduleName,
            studentId: student._id,
            name: student.userId.name
        }));


        await exportTemplate(columns, formattedStudents, `${selectedModule2.code}-${selectedIntakeCourse.intakeId.intakeName}-${selectedIntakeCourse.courseId.courseCode}`)
    }

    const getGradeColor = (grade) => {
        const gradeColors = {
            'A+': 'green',
            'A': 'green',
            'A-': 'green',
            'B+': 'blue',
            'B': 'blue',
            'B-': 'blue',
            'C+': 'yellow',
            'C': 'yellow',
            'C-': 'orange',
            'D': 'red',
            'F': 'red'
        };
        return gradeColors[grade] || 'gray';
    };

    // Marking matrix for automatic grade and GPA calculation
    const getGradeAndGPAFromMarks = (marks, totalMarks = 100) => {
        const percentage = (marks / totalMarks) * 100;

        if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
        if (percentage >= 85) return { grade: 'A', gpa: 4.0 };
        if (percentage >= 80) return { grade: 'A-', gpa: 3.7 };
        if (percentage >= 75) return { grade: 'B+', gpa: 3.3 };
        if (percentage >= 70) return { grade: 'B', gpa: 3.0 };
        if (percentage >= 65) return { grade: 'B-', gpa: 2.7 };
        if (percentage >= 60) return { grade: 'C+', gpa: 2.3 };
        if (percentage >= 55) return { grade: 'C', gpa: 2.0 };
        if (percentage >= 50) return { grade: 'C-', gpa: 1.7 };
        if (percentage >= 45) return { grade: 'D', gpa: 1.0 };
        return { grade: 'F', gpa: 0.0 };
    };

    // Handle marks change with automatic grade/GPA calculation
    const handleMarksChange = (newMarks) => {
        const { grade, gpa } = getGradeAndGPAFromMarks(newMarks, editFormData.totalMarks);
        setEditFormData(prev => ({
            ...prev,
            marks: newMarks,
            grade: grade,
            gpa: gpa
        }));
    };

    // Edit handlers
    const handleEditClick = (result) => {
        setSelectedResult(result);
        console.log("🚀 ~ handleEditClick ~ result:", result)
        setEditFormData({
            grade: result.grade || '',
            creditHours: result.creditHours || '',
            marks: result.marks || '',
            totalMarks: result.totalMarks || 100,
            gpa: result.gpa || '',
            remark: result.remark || ''
        });
        onEditOpen();
    };

    const handleEditSubmit = async () => {
        if (!selectedResult) return;

        setIsEditLoading(true);
        try {
            const response = await updateResult(selectedResult._id, editFormData);

            if (response.success) {
                showToast("Result updated successfully", "success");
                onEditClose();
                // Refresh results
                fetchResults();
            } else {
                showToast(response.message || "Failed to update result", "error");
            }
        } catch (error) {
            showToast("Error updating result", "error");
        } finally {
            setIsEditLoading(false);
        }
    };

    // Delete handlers
    const handleDeleteClick = (resultId) => {
        setDeleteResultId(resultId);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!deleteResultId) return;

        setIsDeleteLoading(true);
        try {
            const response = await deleteResult(deleteResultId);

            if (response.success) {
                showToast("Result deleted successfully", "success");
                onDeleteClose();
                // Refresh results
                fetchResults();
            } else {
                showToast(response.message || "Failed to delete result", "error");
            }
        } catch (error) {
            showToast("Error deleting result", "error");
        } finally {
            setIsDeleteLoading(false);
        }
    };

    return (
        <Box>
            <VStack spacing={3} align="stretch">
                <HStack justify={"space-between"}>
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
                            Student Results
                        </Text>
                        <Text color="gray.600">
                            View and handle student result
                        </Text>
                    </Box>
                    <HStack>
                        <Button leftIcon={<FiUpload />} size="md" colorScheme="green" onClick={onOpen} isLoading={isLoading}>
                            Import CSV
                        </Button>
                    </HStack>
                </HStack>
                {/* Intake Course Preview Section */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack justify={"space-between"}>
                            <VStack align={"start"} flex={1}>
                                <Button
                                    variant="link"
                                    onClick={handleDownloadTemplate}
                                    textDecor={"underline"}
                                    isDisabled={!selectedCourse || !selectedIntake || !selectedModule}
                                >
                                    Download Template
                                </Button>
                                <HStack w={"full"} justify={"space-between"}>
                                    <HStack justify={"start"} align={"end"} flex={1}>
                                        <FormControl maxW="200px">
                                            <FormLabel fontSize="sm"><Badge colorScheme="green">Intake</Badge></FormLabel>
                                            <Select
                                                placeholder="Select Intake"
                                                value={(() => {
                                                    if (!isSubmitting || !csvData.length) return selectedIntake;
                                                    const intakeCourse = intakeCourses.find(IC => IC._id === csvData[0].intakeCourseId);
                                                    return intakeCourse?.intakeId?._id || selectedIntake;
                                                })()}
                                                onChange={e => setSelectedIntake(e.target.value)}
                                            >
                                                {intakeCourses.map(intakeCourse => (
                                                    <option key={intakeCourse._id} value={intakeCourse.intakeId._id}>
                                                        {intakeCourse.intakeId.intakeName}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl maxW="300px">
                                            <FormLabel fontSize="sm"><Badge colorScheme="blue">Course</Badge></FormLabel>
                                            <Select
                                                disabled={selectedIntake === "" || isSubmitting}
                                                placeholder="Select Course"
                                                value={(() => {
                                                    if (!isSubmitting || !csvData.length) return selectedCourse;
                                                    const intakeCourse = intakeCourses.find(IC => IC._id === csvData[0].intakeCourseId);
                                                    return intakeCourse?.courseId?._id || selectedCourse;
                                                })()}
                                                onChange={e => setSelectedCourse(e.target.value)}
                                            >
                                                {intakeCourses.map(intakeCourse => {
                                                    // When submitting, use CSV data's intake, otherwise use selectedIntake
                                                    const targetIntakeId = isSubmitting && csvData.length > 0
                                                        ? intakeCourses.find(IC => IC._id === csvData[0].intakeCourseId)?.intakeId?._id
                                                        : selectedIntake;

                                                    if (intakeCourse.intakeId._id === targetIntakeId) {
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

                                        <FormControl maxW="300px">
                                            <FormLabel fontSize="sm"><Badge colorScheme="">Module</Badge></FormLabel>
                                            <Select
                                                disabled={selectedCourse === "" || isSubmitting}
                                                placeholder="Select Module"
                                                value={isSubmitting && csvData.length > 0 ? csvData[0].moduleId : selectedModule}
                                                onChange={e => setSelectedModule(e.target.value)}
                                            >
                                                {modules
                                                    .filter(m => {
                                                        // When submitting, use CSV data's course, otherwise use selectedCourse
                                                        const targetCourseId = isSubmitting && csvData.length > 0
                                                            ? intakeCourses.find(IC => IC._id === csvData[0].intakeCourseId)?.courseId?._id
                                                            : selectedCourse;

                                                        return m.courseId.some(c => c._id === targetCourseId);
                                                    })
                                                    .map(m => (
                                                        <option key={m._id} value={m._id}>
                                                            {m.moduleName}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </FormControl>

                                        {
                                            (!selectedCourse || !selectedIntake || !selectedModule) ? ("") : (
                                                <Text>Total Result: {filteredResults.length}</Text>
                                            )
                                        }
                                    </HStack>

                                    {
                                        isSubmitting ? (<HStack>
                                            <Button variant="ghost" disabled={!isSubmitting || csvData == ""} onClick={() => {
                                                setIsSubmitting(false);
                                                setCsvData("")
                                            }}>
                                                Cancel
                                            </Button>
                                            <Button
                                                disabled={!isSubmitting}
                                                onClick={handleSubmit}
                                                colorScheme={"green"}
                                            >
                                                Add Bulk Result
                                            </Button>
                                        </HStack>) : (<HStack>
                                            {selectedCourse && selectedIntake && (
                                                <Button
                                                    colorScheme="red"
                                                    onClick={() => {
                                                        setPreviewResults([]);
                                                        setSelectedIntake("");
                                                        setSelectedCourse("");
                                                    }}
                                                >
                                                    Close
                                                </Button>
                                            )}
                                        </HStack>)}
                                </HStack>
                                {
                                    ((selectedCourse === "" || selectedIntake === "") && csvData == "") &&
                                    <Text color="gray.500" fontSize="sm">Select an intake, course and module to display the result OR download template</Text>
                                }
                                {
                                    ((csvData.length > 0 && csvData != "") && (
                                        <TableContainer maxH="300px" overflowY="auto" shadow="lg" borderRadius="md" w={"full"}>
                                            <Table size="sm" variant="striped" colorScheme="gray">
                                                <Thead bg="teal.50" position="sticky" top={0} zIndex={1}>
                                                    <Tr>
                                                        <Th color="teal.700" fontWeight="bold">Student Name</Th>
                                                        <Th color="teal.700" fontWeight="bold">Module Name</Th>
                                                        <Th color="teal.700" fontWeight="bold">Grade</Th>
                                                        <Th color="teal.700" fontWeight="bold">Credit Hour</Th>
                                                        <Th color="teal.700" fontWeight="bold">Remark</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {csvData.map((record, index) => (
                                                        <Tr key={index} _hover={{ bg: "teal.50" }}>
                                                            <Td fontWeight="medium">{record.name}</Td>
                                                            <Td>{record.moduleName}</Td>
                                                            <Td>
                                                                <Badge
                                                                    colorScheme={getGradeColor(record.grade)}
                                                                    variant="solid"
                                                                    px={2}
                                                                    py={1}
                                                                    borderRadius="md"
                                                                >
                                                                    {record.grade}
                                                                </Badge>
                                                            </Td>
                                                            <Td>{record.creditHours}</Td>
                                                            <Td color="gray.600">{record.remark}</Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    ))
                                }
                            </VStack>

                        </HStack>
                        {selectedIntake && selectedCourse && (
                            <TableContainer maxH="300px" overflowY="auto" mt={5} shadow={"lg"}>
                                <Table size="sm" variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th>Student ID</Th>
                                            <Th>Module ID</Th>
                                            <Th>Grade</Th>
                                            <Th>Credit Hour</Th>
                                            <Th>Remark</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {previewResults.length !== 0 && selectedCourse ? (
                                            previewResults.map((r, rIdx) => (
                                                <Tr key={`${rIdx}`}>
                                                    <Td>{r?.studentId?.userId?.name || "N/A"}</Td>
                                                    <Td>{r?.moduleId?.moduleName || "N/A"}</Td>
                                                    <Td>{r?.grade || "N/A"}</Td>
                                                    <Td>{r?.creditHours || "N/A"}</Td>
                                                    <Td>{r?.remark || "N/A"}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5}>
                                                    <Text color="gray.500" fontSize="sm">
                                                        No results found for this course.
                                                    </Text>
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardBody>
                </Card>
                {/* Preview Table */}
                {csvData.length > 0 && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Text textAlign={"center"} fontWeight="semibold" mb={2}>
                                Preview Uploaded Results ({csvData.length} records)
                            </Text>
                            <VStack align={"start"}>
                                <Badge colorScheme="green" >{csvData[0].intakeName}</Badge>
                                <Badge colorScheme="blue">{csvData[0].courseName}</Badge>
                                <Badge>{csvData[0].moduleName}</Badge>
                            </VStack>
                            <TableContainer maxH="400px" overflowY="auto">
                                <Table size="sm" variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th>Student ID</Th>
                                            <Th>Student Name</Th>
                                            <Th>Grade</Th>
                                            <Th>Credit Hour</Th>
                                            <Th>Remark</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {csvData.map((row, idx) => (
                                            <Tr key={idx}>
                                                <Td>{row.studentId}</Td>
                                                <Td>{row.name}</Td>
                                                <Td>{row.grade}</Td>
                                                <Td>{row.creditHours}</Td>
                                                <Td>{row.remark}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            <HStack mt={4}>
                                <Button
                                    colorScheme="green"
                                    isLoading={isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    Submit Results
                                </Button>
                                <Button
                                    isLoading={isSubmitting}
                                    onClick={() => setCsvData("")}
                                >Cancel</Button>
                            </HStack>
                        </CardBody>
                    </Card>
                )}
                {/* Modal for CSV upload instructions */}
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
                                            Student ID, Student Name, Grade, Credit Hour, Remark
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

                {/* Edit Result Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Result</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {selectedResult && (
                                <VStack spacing={4} align="stretch">
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600">Student:</Text>
                                        <Text>{selectedResult?.studentId?.userId?.name || "N/A"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600">Module:</Text>
                                        <Text>{selectedResult?.moduleId?.moduleName || "N/A"}</Text>
                                    </Box>
                                    <HStack spacing={4}>
                                        <FormControl>
                                            <FormLabel>Marks (Editable)</FormLabel>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={editFormData.totalMarks || 100}
                                                value={editFormData.marks}
                                                onChange={(e) => handleMarksChange(e.target.value)}
                                                placeholder="Enter marks"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Total Marks</FormLabel>
                                            <Input
                                                type="number"
                                                value={editFormData.totalMarks}
                                                isReadOnly
                                                bg="gray.50"
                                                cursor="not-allowed"
                                            />
                                        </FormControl>
                                    </HStack>
                                    <HStack spacing={4}>
                                        <FormControl>
                                            <FormLabel>Grade (Auto-calculated)</FormLabel>
                                            <Input
                                                value={editFormData.grade}
                                                isReadOnly
                                                bg="gray.50"
                                                cursor="not-allowed"
                                                fontWeight="bold"
                                                color={`${getGradeColor(editFormData.grade)}.600`}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>GPA (Auto-calculated)</FormLabel>
                                            <Input
                                                value={editFormData.gpa}
                                                isReadOnly
                                                bg="gray.50"
                                                cursor="not-allowed"
                                                fontWeight="bold"
                                            />
                                        </FormControl>
                                    </HStack>
                                    <FormControl>
                                        <FormLabel>Credit Hours</FormLabel>
                                        <Input
                                            type="number"
                                            value={editFormData.creditHours}
                                            isReadOnly
                                            bg="gray.50"
                                            cursor="not-allowed"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Remark</FormLabel>
                                        <Textarea
                                            value={editFormData.remark}
                                            onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                                            placeholder="Enter any remarks..."
                                        />
                                    </FormControl>
                                </VStack>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleEditSubmit}
                                isLoading={isEditLoading}
                                loadingText="Updating..."
                            >
                                Update Result
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    isOpen={isDeleteOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onDeleteClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Delete Result
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Are you sure you want to delete this result? This action cannot be undone.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={handleDeleteConfirm}
                                    ml={3}
                                    isLoading={isDeleteLoading}
                                    loadingText="Deleting..."
                                >
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>

                {/*Desktop View */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" display={{ base: "none", lg: "block" }}>
                    <CardBody>
                        <HStack spacing={4} justify={"space-between"} align={"center"}>
                            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={2} whiteSpace="nowrap">View All Result</Text>

                            <InputGroup>
                                <InputLeftElement>
                                    <SearchIcon />
                                </InputLeftElement>
                                <Input
                                    type="text"
                                    placeholder="Search by student name"
                                    value={searchUserName}
                                    onChange={(e) => setSearchUserName(e.target.value)}
                                />
                            </InputGroup>

                            <HStack>
                                <Select
                                    w={{ base: "full", sm: "200px" }}
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                >
                                    <option value="all">All Modules</option>
                                    {modules && modules.map((module) => (
                                        <option key={module._id} value={module._id}>
                                            {module.moduleName} ({module.code})
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                        </HStack>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        <TableContainer maxH="300px" overflowY="auto" w={"full"}>
                            <Table size="sm" variant="striped">
                                <Thead>
                                    <Tr>
                                        <Th>Student</Th>
                                        <Th><Badge >Module</Badge></Th>
                                        <Th>Marks</Th>
                                        <Th>Grade</Th>
                                        <Th>GPA</Th>
                                        <Th>Credit Hour</Th>
                                        <Th>Remark</Th>
                                        <Th>Updated At</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredResults && filteredResults.length > 0 ? (
                                        filteredResults.map((r, rIdx) => (
                                            <Tr key={`${rIdx}`}>
                                                <Td>{r?.studentId?.userId?.name || "N/A"}</Td>
                                                <Td>{r?.moduleId?.moduleName || "N/A"}</Td>
                                                <Td>{r?.marks || r?.totalMarks ? `${r?.marks || 0}/${r?.totalMarks || 100}` : "N/A"}</Td>
                                                <Td>
                                                    <Badge colorScheme={getGradeColor(r?.grade)}>
                                                        {r?.grade || "N/A"}
                                                    </Badge>
                                                </Td>
                                                <Td>{r?.gpa ? r?.gpa.toFixed(2) : "N/A"}</Td>
                                                <Td>{r?.creditHours || "N/A"}</Td>
                                                <Td>{r?.remark || "N/A"}</Td>
                                                <Td>{r?.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "N/A"}</Td>
                                                <Td>
                                                    <ButtonGroup size="sm" spacing={2}>
                                                        <IconButton
                                                            aria-label="Edit result"
                                                            icon={<EditIcon />}
                                                            size="sm"
                                                            colorScheme="blue"
                                                            onClick={() => handleEditClick(r)}
                                                        />
                                                        <IconButton
                                                            aria-label="Delete result"
                                                            icon={<DeleteIcon />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            onClick={() => handleDeleteClick(r._id)}
                                                        />
                                                    </ButtonGroup>
                                                </Td>
                                            </Tr>
                                        ))
                                    ) : (
                                        <Tr>
                                            <Td colSpan={9}>
                                                <Text color="gray.500" fontSize="sm">
                                                    No results found.
                                                </Text>
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </CardFooter>
                </Card>

                {/* Mobile Accordion View */}
                <Box display={{ base: "block", lg: "none" }}>
                    <Accordion allowMultiple>
                        {filteredResults && filteredResults.length > 0 ? (
                            filteredResults.map((result, index) => (
                                <AccordionItem key={result?._id || index}>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left">
                                                <Text fontWeight="medium">
                                                    {result?.studentId?.userId?.name || "N/A"}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {result?.moduleId?.moduleName || "N/A"}
                                                </Text>
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <VStack spacing={3} align="stretch">
                                            <Box>
                                                <Text fontWeight="semibold">Marks:</Text>
                                                <Text>{result?.marks || result?.totalMarks ? `${result?.marks || 0}/${result?.totalMarks || 100}` : "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">Grade:</Text>
                                                <Badge colorScheme={getGradeColor(result?.grade)}>
                                                    {result?.grade || "N/A"}
                                                </Badge>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">GPA:</Text>
                                                <Text>{result?.gpa ? result?.gpa.toFixed(2) : "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">Credit Hour:</Text>
                                                <Text>{result?.creditHours || "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">Remark:</Text>
                                                <Text>{result?.remark || "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">Updated At:</Text>
                                                <Text>{result?.updatedAt ? new Date(result.updatedAt).toLocaleString() : "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold" mb={2}>Actions:</Text>
                                                <ButtonGroup size="sm" spacing={2}>
                                                    <Button
                                                        leftIcon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        onClick={() => handleEditClick(result)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        leftIcon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteClick(result._id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </ButtonGroup>
                                            </Box>
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))
                        ) : (
                            <Text color="gray.500" fontSize="sm" p={4}>
                                No results found.
                            </Text>
                        )}
                    </Accordion>
                </Box>


            </VStack>
        </Box>
    )
}
