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
    Badge
} from "@chakra-ui/react"
import { FiUpload } from "react-icons/fi"
import { useMemo, useState, useRef, useEffect } from "react"
import { useAcademicStore } from "../../store/academic"
import { FaFileDownload } from "react-icons/fa";
import { useGeneralStore } from "../../store/general";
import { useShowToast } from "../../store/utils/toast.js"
import * as XLSX from "xlsx"
// CSV columns: Student ID, Student Name, Subject Code, Subject Name, Semester, Academic Year, Credit Hours, Grade, GPA, Marks, Total Marks, Status

export default function ResultsBulkUpload() {
    const { fetchStudents, students, fetchIntakeCourses, intakeCourses, results, fetchResults, modules, fetchModules } = useAcademicStore();
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

    // Intake/course preview state
    const [selectedIntake, setSelectedIntake] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("")
    const [selectedModule, setSelectedModule] = useState("");
    const [previewResults, setPreviewResults] = useState([])

    // Filter options
    const [moduleFilter, setModuleFilter] = useState("all");
    const filteredResults = results.filter((result) => {
        const matchesModule = moduleFilter === "all" || (result.moduleId._id === moduleFilter);
        return matchesModule;
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
                const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: ""});

                console.log("🚀 ~ handleFileUpload ~ parsedData:", parsedData)
                setCsvData(parsedData);
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
        // setIsSubmitting(true)

        // setIsSubmitting(false)

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
            { header: "creditHour", key: "creditHour", width: 25 },
            { header: "remark", key: "remark", width: 25 },
        ]

        const formattedStudents = students.map((student) => ({
            intakeCourseId: selectedIntakeCourse._id,
            intakeName: selectedIntakeCourse.intakeId.intakeName,
            courseName: selectedIntakeCourse.courseId.courseName,
            moduleId: selectedModule2._id,
            moduleName: selectedModule2.moduleName,
            studentId: student.userId._id,
            name: student.userId.name
        }));


        await exportTemplate(columns, formattedStudents, `${selectedModule2.code}-${selectedIntakeCourse.intakeId.intakeName}-${selectedIntakeCourse.courseId.courseCode}`)
    }



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
                            <VStack align={"start"}>
                                <Button
                                    variant="link"
                                    onClick={handleDownloadTemplate}
                                    textDecor={"underline"}
                                    isDisabled={!selectedCourse || !selectedIntake || !selectedModule}
                                >
                                    Download Template
                                </Button>
                                <HStack>
                                    <FormControl maxW="200px">
                                        <FormLabel fontSize="sm"><Badge colorScheme="green" >Intake</Badge></FormLabel>
                                        <Select
                                            placeholder="Select Intake"
                                            value={selectedIntake}
                                            onChange={e => setSelectedIntake(e.target.value)}
                                        >
                                            {intakeCourses.map(intakeCourse => (
                                                <option key={intakeCourse._id} value={intakeCourse.intakeId._id}>{intakeCourse.intakeId.intakeName}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl maxW="300px">
                                        <FormLabel fontSize="sm"><Badge colorScheme="blue">Course</Badge></FormLabel>
                                        <Select
                                            disabled={selectedIntake === ""}
                                            placeholder="Select Course"
                                            value={selectedCourse}
                                            onChange={e => setSelectedCourse(e.target.value)}
                                        >
                                            {intakeCourses.map(intakeCourse => {
                                                if (intakeCourse.intakeId._id === selectedIntake) {
                                                    return (<option key={intakeCourse._id} value={intakeCourse.courseId._id}>{intakeCourse.courseId.courseName}</option>
                                                    )
                                                }
                                            })}
                                        </Select>
                                    </FormControl>
                                    <FormControl maxW="300px">
                                        <FormLabel fontSize="sm"><Badge colorScheme="" >Module</Badge></FormLabel>
                                        <Select
                                            disabled={selectedCourse === ""}
                                            placeholder="Select Module"
                                            value={selectedModule}
                                            onChange={e => setSelectedModule(e.target.value)}
                                        >
                                            {modules
                                                .filter(m => m.courseId.some(c => c._id === selectedCourse))
                                                .map(m => (
                                                    <option key={m._id} value={m._id}>
                                                        {m.moduleName}
                                                    </option>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </HStack>
                                {
                                    (selectedCourse === "" || selectedIntake === "") && (
                                        <Text color="gray.500" fontSize="sm">Select an intake, course and module to display the result OR download template</Text>
                                    )
                                }
                            </VStack>
                            <HStack>
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
                            </HStack>
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
                                            previewResults.map((r, rIdx) =>

                                                <Tr key={`${rIdx}`}>
                                                    <Td>{r.studentId.userId.name}</Td>
                                                    <Td>{r.moduleId.moduleName}</Td>
                                                    <Td>{r.grade}</Td>
                                                    <Td>{r.creditHour}</Td>
                                                    <Td>{r.remark}</Td>
                                                </Tr>

                                            )
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
                                                <Td>{row.creditHour}</Td>
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

                {/*Desktop View */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" display={{ base: "none", lg: "block" }}>
                    <CardBody>
                        <HStack spacing={4} flexWrap="wrap" justify={"space-between"}>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>View All Result</Text>
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
                                        <Th>Grade</Th>
                                        <Th>Credit Hour</Th>
                                        <Th>Remark</Th>
                                        <Th>Updated At</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredResults ? (
                                        filteredResults.map((r, rIdx) =>

                                            <Tr key={`${rIdx}`}>
                                                <Td>{r.studentId.userId.name}</Td>
                                                <Td>{r.moduleId.moduleName}</Td>
                                                <Td>{r.grade}</Td>
                                                <Td>{r.creditHour}</Td>
                                                <Td>{r.remark}</Td>
                                                <Td>{r.updatedAt}</Td>
                                            </Tr>

                                        )
                                    ) : <Text>Loading Result...</Text>}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </CardFooter>
                </Card>

                {/* Mobile Accordion View */}
                <Box display={{ base: "block", lg: "none" }}>
                    <Accordion allowMultiple>
                        {filteredResults.map((result, index) => (
                            <AccordionItem key={result._id || index}>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex="1" textAlign="left">
                                            <Text fontWeight="medium">
                                                {result.studentId?.userId?.name || "N/A"}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {result.moduleId?.moduleName || "N/A"}
                                            </Text>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <VStack spacing={3} align="stretch">
                                        <Box>
                                            <Text fontWeight="semibold">Grade:</Text>
                                            <Text>{result.grade || "N/A"}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">Credit Hour:</Text>
                                            <Text>{result.creditHour || "N/A"}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">Remark:</Text>
                                            <Text>{result.remark || "N/A"}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">Updated At:</Text>
                                            <Text>{new Date(result.updatedAt).toLocaleString() || "N/A"}</Text>
                                        </Box>
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Box>

            </VStack>
        </Box>
    )
}
