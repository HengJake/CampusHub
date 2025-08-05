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
    useDisclosure,
    Badge,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Input
} from "@chakra-ui/react"
import { FiUpload } from "react-icons/fi"
import { useMemo, useState, useEffect } from "react"
import { useAcademicStore } from "../../store/academic"
import { useGeneralStore } from "../../store/general";
import { useShowToast } from "../../store/utils/toast.js"
import {
    ResultsUploadModal,
    ResultsEditModal,
    ResultsPreviewTable,
    ResultsDeleteDialog,
    ResultsTemplateModal
} from "../../component/schoolAdminDashboard/results"

// CSV columns: Student ID, Student Name, Subject Code, Subject Name, Semester, Academic Year, Credit Hours, Grade, GPA, Marks, Total Marks, Status

export default function ResultsBulkUpload() {
    const { fetchSemesters, semesters, createResult, fetchStudents, students, fetchIntakeCourses, intakeCourses, results, fetchResults, modules, fetchModules, updateResult, deleteResult } = useAcademicStore();
    const { exportTemplate } = useGeneralStore();
    const showToast = useShowToast();

    useEffect(() => {
        fetchIntakeCourses();
        fetchResults();
        fetchModules();
        fetchStudents();
        fetchSemesters();
    }, [])

    // console.log("🚀 ~ ResultsBulkUpload ~ semesters:", semesters)
    // console.log("🚀 ~ ResultsBulkUpload ~ results:", results)
    // console.log("🚀 ~ ResultsBulkUpload ~ intakeCourses:", intakeCourses)
    // console.log("🚀 ~ ResultsBulkUpload ~ modules:", modules)


    const [csvData, setCsvData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
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

    // Template modal state
    const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure()

    // Intake/course preview state
    const [selectedIntake, setSelectedIntake] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("")
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [previewResults, setPreviewResults] = useState([])

    // Filter options
    const [moduleFilter, setModuleFilter] = useState("all");
    const [searchUserName, setSearchUserName] = useState("");

    useEffect(() => {
        let filteredResults = results;

        // Progressive filtering - show data as each filter is selected
        if (selectedIntake) {
            filteredResults = filteredResults.filter(r =>
                r?.studentId?.intakeCourseId?.intakeId === selectedIntake
            );
        }

        if (selectedCourse) {
            filteredResults = filteredResults.filter(r =>
                r?.studentId?.intakeCourseId?.courseId === selectedCourse
            );
        }

        if (selectedModule) {
            filteredResults = filteredResults.filter(r =>
                r?.moduleId?._id === selectedModule
            );
        }

        if (selectedYear) {
            filteredResults = filteredResults.filter(r =>
                r?.semesterId?.year?.toString() === selectedYear
            );
        }

        if (selectedSemester) {
            filteredResults = filteredResults.filter(r =>
                r?.semesterId?._id === selectedSemester
            );
        }

        // Apply search and module filters to preview results
        if (searchUserName) {
            filteredResults = filteredResults.filter(r =>
                r?.studentId?.userId?.name?.toLowerCase().includes(searchUserName.toLowerCase())
            );
        }

        if (moduleFilter !== "all") {
            filteredResults = filteredResults.filter(r =>
                r?.moduleId?._id === moduleFilter
            );
        }

        setPreviewResults(filteredResults);
    }, [selectedCourse, selectedIntake, selectedModule, selectedYear, selectedSemester, results, searchUserName, moduleFilter])



    // Placeholder for API call
    const handleSubmit = async () => {
        setIsLoading(true); // Add loading state

        try {
            const results = [];
            const errors = [];

            // Process all rows and collect results/errors
            for (let idx = 0; idx < csvData.length; idx++) {
                let data = csvData[idx];

                if (data.marks === "" || data.marks === 0) {
                    errors.push({
                        line: idx + 1,
                        studentName: data.name,
                        error: "Please ensure marks are filled",
                        data: data
                    });
                    continue;
                }


                data = {
                    ...data,
                    intakeCourseId: data.intakeCourseId._id,
                    moduleId: data.moduleId._id,
                    semesterId: data.semesterId._id,
                }

                const res = await createResult(data);

                if (!res.success) {
                    errors.push({
                        line: idx + 1,
                        studentName: data.name,
                        error: res.message,
                        data: data
                    });
                } else {
                    results.push({
                        line: idx + 1,
                        studentName: data.name,
                        success: true
                    });
                }
            }

            // Show summary of results
            if (results.length > 0) {
                showToast.success(
                    "Results Processed",
                    `${results.length} results added successfully`
                );
            }

            // Show errors if any
            if (errors.length > 0) {
                showToast.error(
                    "Errors Found",
                    `${errors.length} rows have errors. Check the table below for details.`
                );

                // Mark error rows in the data
                const updatedCsvData = csvData.map((row, idx) => {
                    const error = errors.find(e => e.line === idx + 1);
                    return {
                        ...row,
                        hasError: !!error,
                        errorMessage: error?.error || null
                    };
                });

                setCsvData(updatedCsvData);
                setIsSubmitting(false); // Keep form open for editing
                return; // Don't clear form or refresh data
            }

            // If no errors, proceed with success flow
            await fetchResults();
            setIsSubmitting(false);
            setCsvData([]);
            setSelectedModule("");
            setSelectedCourse("");
            setSelectedIntake("");
            setSelectedYear("");
            setSelectedSemester("");

        } catch (error) {
            console.error("Error submitting results:", error);
            showToast.error("Submission Error", "An error occurred while submitting results");
        } finally {
            setIsLoading(false);
        }
    }
    const selectedIntakeCourse = useMemo(() =>
        intakeCourses.find(ic => ic?.intakeId?._id === selectedIntake && ic?.courseId?._id === selectedCourse),
        [intakeCourses, selectedIntake, selectedCourse]
    );

    const selectedModule2 = useMemo(() =>
        modules.find(m => m?._id === selectedModule),
        [modules, selectedModule]
    );
    // download template with calling api from backend
    const handleDownloadTemplate = async () => {

        if (!selectedCourse || !selectedIntake || !selectedModule || !selectedYear || !selectedSemester) {
            showToast.error("Please select intake, course, module, year, and semester to generate template", "", "meow");
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
            { header: "year", key: "year", width: 10 },
            { header: "semesterId", key: "semesterId", width: 10 },
            { header: "semesterName", key: "semesterName", width: 25 },
            { header: "studentId", key: "studentId", width: 10 },
            { header: "name", key: "name", width: 25 },
            { header: "marks", key: "marks", width: 15 },
            { header: "remark", key: "remark", width: 25 },
        ]

        const selectedSemesterData = semesters.find(s => s._id === selectedSemester);
        const selectedIntakeCourseData = selectedIntakeCourse || {
            _id: "N/A",
            intakeId: { intakeName: selectedIntake || "N/A" },
            courseId: { courseName: selectedCourse || "N/A", courseCode: "N/A" }
        };

        const formattedStudents = students.map((student) => ({
            intakeCourseId: selectedIntakeCourseData?._id || "N/A",
            intakeName: selectedIntakeCourseData?.intakeId?.intakeName || "N/A",
            courseName: selectedIntakeCourseData?.courseId?.courseName || "N/A",
            moduleId: selectedModule2?._id || "N/A",
            moduleName: selectedModule2?.moduleName || "N/A",
            year: selectedYear || "N/A",
            semesterId: selectedSemester || "N/A",
            semesterName: selectedSemesterData?.semesterName || "N/A",
            studentId: student?._id || "N/A",
            name: student?.userId?.name || "N/A",
            marks: "", // Empty for user to fill
            remark: "" // Empty for user to fill
        }));


        const filename = `${selectedModule2?.code || "Module"}-${selectedIntakeCourseData?.intakeId?.intakeName || "Intake"}-${selectedIntakeCourseData?.courseId?.courseCode || "Course"}-${selectedSemesterData?.semesterName || "Semester"}`;
        await exportTemplate(columns, formattedStudents, filename)

        // Close the modal after successful template generation
        onTemplateModalClose();
        showToast.success("Template Generated", "Excel template has been downloaded successfully");
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
        <Box maxW={"calc(100vw - 120px)"}>
            <VStack spacing={3} align="stretch" >
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

                {/* Preview Table */}
                {csvData.length > 0 && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Text textAlign={"center"} fontWeight="semibold" mb={2}>
                                Preview Uploaded Results ({csvData.length} records)
                            </Text>
                            <HStack align={"start"}>
                                <Badge colorScheme="green" >{csvData[0].intakeCourseId.intakeId.intakeName}</Badge>
                                <Badge colorScheme="blue">{csvData[0].intakeCourseId.courseId.courseName}</Badge>
                                <Badge>{csvData[0].moduleId.moduleName}</Badge>
                            </HStack>
                            <TableContainer maxH="400px" overflowY="auto">
                                <Table size="sm" variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th>Line</Th>
                                            <Th>Student ID</Th>
                                            <Th>Student Name</Th>
                                            <Th>Marks</Th>
                                            <Th>Grade (Auto)</Th>
                                            <Th>GPA (Auto)</Th>
                                            <Th>Credit Hour (Auto)</Th>
                                            <Th>Remark</Th>
                                            <Th>Status</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {csvData.map((row, idx) => (
                                            <Tr
                                                key={idx}
                                                bg={row.hasError ? "red.50" : "inherit"}
                                                borderLeft={row.hasError ? "4px solid red" : "none"}
                                            >
                                                <Td fontWeight="bold">{idx + 1}</Td>
                                                <Td>{row.studentId}</Td>
                                                <Td>{row.name}</Td>
                                                <Td>
                                                    <Input
                                                        size="sm"
                                                        value={row.marks}
                                                        onChange={(e) => {
                                                            const newMarks = parseFloat(e.target.value) || 0;
                                                            const { grade, gpa } = getGradeAndGPAFromMarks(newMarks);

                                                            const updatedData = [...csvData];
                                                            updatedData[idx] = {
                                                                ...updatedData[idx],
                                                                marks: newMarks,
                                                                grade: grade,
                                                                gpa: gpa,
                                                                hasError: false,
                                                                errorMessage: null
                                                            };
                                                            setCsvData(updatedData);
                                                        }}
                                                        borderColor={row.hasError ? "red.500" : "gray.300"}
                                                        _focus={{ borderColor: row.hasError ? "red.500" : "blue.500" }}
                                                    />
                                                </Td>
                                                <Td>
                                                    <Badge colorScheme={getGradeColor(row.grade)}>
                                                        {row.grade}
                                                    </Badge>
                                                </Td>
                                                <Td>{row.gpa?.toFixed(2)}</Td>
                                                <Td>{row.creditHours}</Td>
                                                <Td>
                                                    <Input
                                                        size="sm"
                                                        value={row.remark || ""}
                                                        onChange={(e) => {
                                                            const updatedData = [...csvData];
                                                            updatedData[idx] = {
                                                                ...updatedData[idx],
                                                                remark: e.target.value,
                                                                hasError: false,
                                                                errorMessage: null
                                                            };
                                                            setCsvData(updatedData);
                                                        }}
                                                        borderColor={row.hasError ? "red.500" : "gray.300"}
                                                        _focus={{ borderColor: row.hasError ? "red.500" : "blue.500" }}
                                                    />
                                                </Td>
                                                <Td>
                                                    {row.hasError ? (
                                                        <VStack spacing={1} align="start">
                                                            <Badge colorScheme="red" size="sm">
                                                                Error
                                                            </Badge>
                                                            <Text fontSize="xs" color="red.600" maxW="200px">
                                                                {row.errorMessage}
                                                            </Text>
                                                        </VStack>
                                                    ) : (
                                                        <Badge colorScheme="green" size="sm">
                                                            Ready
                                                        </Badge>
                                                    )}
                                                </Td>
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
                                    {csvData.some(row => row.hasError) ? "Retry Submit" : "Submit Results"}
                                </Button>
                                <Button
                                    isLoading={isSubmitting}
                                    onClick={() => setCsvData("")}
                                >Cancel</Button>
                            </HStack>
                        </CardBody>
                    </Card>
                )}

                {/* Preview Table with Selection */}
                <ResultsPreviewTable
                    selectedIntake={selectedIntake}
                    setSelectedIntake={setSelectedIntake}
                    selectedCourse={selectedCourse}
                    setSelectedCourse={setSelectedCourse}
                    selectedModule={selectedModule}
                    setSelectedModule={setSelectedModule}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedSemester={selectedSemester}
                    setSelectedSemester={setSelectedSemester}
                    intakeCourses={intakeCourses}
                    modules={modules}
                    semesters={semesters}
                    previewResults={previewResults}
                    isSubmitting={isSubmitting}
                    csvData={csvData}
                    handleDownloadTemplate={handleDownloadTemplate}
                    handleSubmit={handleSubmit}
                    setIsSubmitting={setIsSubmitting}
                    setCsvData={setCsvData}
                    setPreviewResults={setPreviewResults}
                    getGradeColor={getGradeColor}
                    searchUserName={searchUserName}
                    setSearchUserName={setSearchUserName}
                    moduleFilter={moduleFilter}
                    setModuleFilter={setModuleFilter}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    isTemplateModalOpen={isTemplateModalOpen}
                    onTemplateModalOpen={onTemplateModalOpen}
                    onTemplateModalClose={onTemplateModalClose}
                />


                {/* CSV Upload Modal */}
                <ResultsUploadModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onFileUpload={(parsedData) => {
                        // Process the template format with marks
                        const processedData = parsedData.map(row => {
                            const marks = parseFloat(row.marks) || 0;
                            const { grade, gpa } = getGradeAndGPAFromMarks(marks);

                            return {
                                studentId: row.studentId,
                                name: row.name,
                                marks: marks,
                                grade: grade,
                                gpa: gpa,
                                creditHours: selectedModule2?.creditHours || 3, // Default credit hours
                                remark: row.remark || "",
                                // Use the data from the template
                                moduleId: modules.find(m => m._id === row.moduleId),
                                semesterId: semesters.find(s => s._id === row.semesterId),
                                intakeCourseId: intakeCourses.find(ic => ic._id === row.intakeCourseId)
                            };
                        });
                        console.log("🚀 ~ processedData:", processedData)
                        setCsvData(processedData);
                        setIsSubmitting(false);
                    }}
                    isLoading={isLoading}
                />

                {/* Edit Result Modal */}
                <ResultsEditModal
                    isOpen={isEditOpen}
                    onClose={onEditClose}
                    selectedResult={selectedResult}
                    editFormData={editFormData}
                    setEditFormData={setEditFormData}
                    handleEditSubmit={handleEditSubmit}
                    isEditLoading={isEditLoading}
                    getGradeColor={getGradeColor}
                    handleMarksChange={handleMarksChange}
                />

                {/* Delete Confirmation Dialog */}
                <ResultsDeleteDialog
                    isOpen={isDeleteOpen}
                    onClose={onDeleteClose}
                    handleDeleteConfirm={handleDeleteConfirm}
                    isDeleteLoading={isDeleteLoading}
                />

                {/* Template Generation Modal */}
                <ResultsTemplateModal
                    isOpen={isTemplateModalOpen}
                    onClose={onTemplateModalClose}
                    onProceed={handleDownloadTemplate}
                    selectedIntake={selectedIntake}
                    selectedCourse={selectedCourse}
                    selectedModule={selectedModule}
                    selectedYear={selectedYear}
                    selectedSemester={selectedSemester}
                    intakeCourses={intakeCourses}
                    modules={modules}
                    semesters={semesters}
                    previewResultsLength={previewResults.length}
                />




            </VStack>
        </Box>
    )
}
