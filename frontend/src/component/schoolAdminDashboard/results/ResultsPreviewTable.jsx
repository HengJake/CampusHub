import {
    Card,
    CardBody,
    HStack,
    VStack,
    Text,
    FormControl,
    FormLabel,
    Select,
    Badge,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useColorModeValue,
    Input,
    InputGroup,
    InputLeftElement,
    ButtonGroup,
    IconButton,
    Accordion,
    AccordionButton,
    AccordionItem,
    AccordionIcon,
    AccordionPanel,
    Box,
    Divider,
    Heading
} from "@chakra-ui/react"
import { FiRefreshCw } from "react-icons/fi"
import { SearchIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons"
import { useState, useMemo } from "react"

export default function ResultsPreviewTable({
    selectedIntake,
    setSelectedIntake,
    selectedCourse,
    setSelectedCourse,
    selectedModule,
    setSelectedModule,
    selectedYear,
    setSelectedYear,
    selectedSemester,
    setSelectedSemester,
    intakeCourses,
    modules,
    semesters,
    previewResults,
    isSubmitting,
    csvData,
    handleDownloadTemplate,
    handleSubmit,
    setIsSubmitting,
    setCsvData,
    setPreviewResults,
    getGradeColor,
    searchUserName,
    setSearchUserName,
    moduleFilter,
    setModuleFilter,
    handleEditClick,
    handleDeleteClick,
    isTemplateModalOpen,
    onTemplateModalOpen,
    onTemplateModalClose,
    isMobile
}) {
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const [groupBy, setGroupBy] = useState("student") // "student" or "module"

    // Group results based on selection
    const groupedResults = useMemo(() => {
        if (!previewResults.length) return {}

        if (groupBy === "student") {
            return previewResults.reduce((acc, result) => {
                const studentName = result?.studentId?.userId?.name || "Unknown Student"
                if (!acc[studentName]) {
                    acc[studentName] = []
                }
                acc[studentName].push(result)
                return acc
            }, {})
        } else {
            return previewResults.reduce((acc, result) => {
                const moduleName = result?.moduleId?.moduleName || "Unknown Module"
                if (!acc[moduleName]) {
                    acc[moduleName] = []
                }
                acc[moduleName].push(result)
                return acc
            }, {})
        }
    }, [previewResults, groupBy])

    // Filter results based on search
    const filteredGroupedResults = useMemo(() => {
        if (!searchUserName) return groupedResults

        if (groupBy === "student") {
            return Object.keys(groupedResults).reduce((acc, studentName) => {
                if (studentName.toLowerCase().includes(searchUserName.toLowerCase())) {
                    acc[studentName] = groupedResults[studentName]
                }
                return acc
            }, {})
        } else {
            return Object.keys(groupedResults).reduce((acc, moduleName) => {
                const hasMatchingStudent = groupedResults[moduleName].some(result =>
                    result?.studentId?.userId?.name?.toLowerCase().includes(searchUserName.toLowerCase())
                )
                if (hasMatchingStudent) {
                    acc[moduleName] = groupedResults[moduleName]
                }
                return acc
            }, {})
        }
    }, [groupedResults, searchUserName, groupBy])

    return (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
                <HStack justify={"space-between"} >
                    <VStack align={"start"} flex={1}>
                        {
                            previewResults.length > 0 && (
                                <Text>Total Result: {previewResults.length}</Text>
                            )
                        }
                        <HStack w={"full"} justify={"space-between"} align={"end"}>
                            <HStack justify={"start"} align={isMobile ? "start" : "end"} flex={1} flexDir={isMobile ? "column" : "row"}>
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

                                <FormControl maxW="200px">
                                    <FormLabel fontSize="sm"><Badge colorScheme="orange">Year</Badge></FormLabel>
                                    <Select
                                        disabled={selectedCourse === "" || isSubmitting}
                                        placeholder="Select Year"
                                        value={isSubmitting && csvData.length > 0 ? csvData[0].year : selectedYear}
                                        onChange={e => {
                                            setSelectedYear(e.target.value);
                                            setSelectedSemester(""); // Reset semester when year changes
                                        }}
                                    >
                                        {semesters
                                            .filter(s => s.intakeCourseId?.courseId?._id === selectedCourse)
                                            .reduce((years, semester) => {
                                                const year = semester.year?.toString();
                                                if (year && !years.includes(year)) {
                                                    years.push(year);
                                                }
                                                return years;
                                            }, [])
                                            .sort((a, b) => b - a)
                                            .map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                    </Select>
                                </FormControl>

                                <FormControl maxW="300px">
                                    <FormLabel fontSize="sm"><Badge colorScheme="purple">Semester</Badge></FormLabel>
                                    <Select
                                        disabled={selectedCourse === "" || selectedYear === "" || isSubmitting}
                                        placeholder="Select Semester"
                                        value={isSubmitting && csvData.length > 0 ? csvData[0].semesterId : selectedSemester}
                                        onChange={e => setSelectedSemester(e.target.value)}
                                    >
                                        {semesters
                                            .filter(s => {
                                                // When submitting, use CSV data's course, otherwise use selectedCourse
                                                const targetCourseId = isSubmitting && csvData.length > 0
                                                    ? intakeCourses.find(IC => IC._id === csvData[0].intakeCourseId)?.courseId?._id
                                                    : selectedCourse;

                                                return s.intakeCourseId?.courseId?._id === targetCourseId && s.year?.toString() === selectedYear;
                                            })
                                            .map(s => (
                                                <option key={s._id} value={s._id}>
                                                    {s.semesterName}
                                                </option>
                                            ))}
                                    </Select>
                                </FormControl>
                            </HStack>

                            <Button leftIcon={<FiRefreshCw />}
                                size="md"
                                colorScheme="blue"
                                onClick={onTemplateModalOpen}
                                isDisabled={!selectedModule || previewResults.length > 0}
                            >
                                Template
                            </Button>

                            <HStack>
                                {(selectedIntake || selectedCourse || selectedModule || selectedYear || selectedSemester) && (
                                    <Button
                                        colorScheme="red"
                                        onClick={() => {
                                            setPreviewResults([]);
                                            setSelectedIntake("");
                                            setSelectedCourse("");
                                            setSelectedModule("");
                                            setSelectedYear("");
                                            setSelectedSemester("");
                                        }}
                                    >
                                        Close
                                    </Button>
                                )}
                            </HStack>
                        </HStack>

                        {/* Search and Filter Controls */}
                        {previewResults.length > 0 && (
                            <HStack spacing={4} w={"full"} justify={"space-between"} align={isMobile ? "start" : "center"} mt={4} borderTop={"1px solid"} borderColor={"gray.200"} pt={4} >
                                <HStack spacing={4} align={isMobile ? "start" : "center"} flex={1} flexDir={isMobile ? "column" : "row"} >
                                    <FormControl maxW="200px">
                                        <FormLabel fontSize="sm"><Badge colorScheme="teal">Group By</Badge></FormLabel>
                                        <Select
                                            value={groupBy}
                                            onChange={(e) => setGroupBy(e.target.value)}
                                        >
                                            <option value="student">By Student</option>
                                            <option value="module">By Module</option>
                                        </Select>
                                    </FormControl>

                                    <InputGroup maxW="300px" mt={isMobile ? 0 : 7} flex={1}>
                                        <InputLeftElement>
                                            <SearchIcon />
                                        </InputLeftElement>
                                        <Input
                                            type="text"
                                            placeholder={groupBy === "student" ? "Search by student name" : "Search by student name"}
                                            value={searchUserName}
                                            onChange={(e) => setSearchUserName(e.target.value)}
                                        />
                                    </InputGroup>
                                </HStack>
                            </HStack>
                        )}

                        {/* No Results Message After Filtering */}
                        {searchUserName && Object.keys(filteredGroupedResults).length === 0 && (
                            <Box mt={4} p={6} textAlign="center" bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                <Text fontSize="lg" color="gray.600" fontWeight="medium">
                                    No results found for "{searchUserName}"
                                </Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                    Try adjusting your search terms or clearing the search to see all results.
                                </Text>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    mt={3}
                                    onClick={() => setSearchUserName("")}
                                >
                                    Clear Search
                                </Button>
                            </Box>
                        )}

                        {
                            (previewResults.length === 0 && csvData.length === 0) && (
                                <VStack spacing={1} align="start">
                                    <Text color="gray.500" fontSize="sm">
                                        {!selectedIntake ? "Select an intake to start filtering results" :
                                            !selectedCourse ? "Select a course to continue filtering" :
                                                !selectedModule ? "Select a module to continue filtering" :
                                                    !selectedYear ? "Select a year to continue filtering" :
                                                        !selectedSemester ? "Select a semester to continue filtering" :
                                                            "No results found for the selected filters"}
                                    </Text>
                                    <Text color="gray.400" fontSize="xs">
                                        {!selectedModule
                                            ? "Select a module to enable template generation"
                                            : "No existing results found. You can generate a template to add new results"}
                                    </Text>
                                </VStack>
                            )
                        }
                    </VStack>
                </HStack>
                {previewResults.length > 0 && (
                    <>
                        {/* Desktop Table View */}
                        <TableContainer maxH="400px" overflowY="auto" mt={5} shadow={"lg"} display={{ base: "none", lg: "block" }}>
                            {Object.entries(filteredGroupedResults).map(([groupKey, results]) => (
                                <Box key={groupKey} mb={6}>
                                    <Heading size="md" mb={3} color="blue.600" ml={3}>
                                        {groupBy === "student" ? `Student: ${groupKey}` : `Module: ${groupKey}`}
                                        <Badge ml={2} colorScheme="blue">{results.length} result{results.length !== 1 ? 's' : ''}</Badge>
                                    </Heading>
                                    <Table size="sm" variant="striped" >
                                        <Thead>
                                            <Tr>
                                                {groupBy === "student" ? (
                                                    <>
                                                        <Th>Module</Th>
                                                        <Th>Marks</Th>
                                                        <Th>Grade</Th>
                                                        <Th>GPA</Th>
                                                        <Th>Credit Hour</Th>
                                                        <Th>Remark</Th>
                                                        <Th>Updated At</Th>
                                                        <Th>Actions</Th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Th>Student</Th>
                                                        <Th>Marks</Th>
                                                        <Th>Grade</Th>
                                                        <Th>GPA</Th>
                                                        <Th>Credit Hour</Th>
                                                        <Th>Remark</Th>
                                                        <Th>Updated At</Th>
                                                        <Th>Actions</Th>
                                                    </>
                                                )}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {results.map((r, rIdx) => (
                                                <Tr key={`${rIdx}`}>
                                                    {groupBy === "student" ? (
                                                        <>
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
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Td>{r?.studentId?.userId?.name || "N/A"}</Td>
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
                                                        </>
                                                    )}
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                    <Divider mt={4} />
                                </Box>
                            ))}
                        </TableContainer>

                        {/* Mobile Accordion View */}
                        <Box display={{ base: "block", lg: "none" }} mt={5}>
                            {Object.entries(filteredGroupedResults).map(([groupKey, results]) => (
                                <Box key={groupKey} mb={6}>
                                    <Heading size="md" mb={3} color="blue.600">
                                        {groupBy === "student" ? `Student: ${groupKey}` : `Module: ${groupKey}`}
                                        <Badge ml={2} colorScheme="blue">{results.length} result{results.length !== 1 ? 's' : ''}</Badge>
                                    </Heading>
                                    <Accordion allowMultiple>
                                        {results.map((result, index) => (
                                            <AccordionItem key={result?._id || index}>
                                                <h2>
                                                    <AccordionButton>
                                                        <Box as="span" flex="1" textAlign="left">
                                                            {groupBy === "student" ? (
                                                                <>
                                                                    <Text fontWeight="medium">
                                                                        {result?.moduleId?.moduleName || "N/A"}
                                                                    </Text>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Text fontWeight="medium">
                                                                        {result?.studentId?.userId?.name || "N/A"}
                                                                    </Text>
                                                                </>
                                                            )}
                                                        </Box>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                </h2>
                                                <AccordionPanel pb={4}>
                                                    <VStack spacing={3} align="stretch">
                                                        {groupBy === "student" && (
                                                            <Box>
                                                                <Text fontWeight="semibold">Student:</Text>
                                                                <Text>{result?.studentId?.userId?.name || "N/A"}</Text>
                                                            </Box>
                                                        )}
                                                        {groupBy === "module" && (
                                                            <Box>
                                                                <Text fontWeight="semibold">Module:</Text>
                                                                <Text>{result?.moduleId?.moduleName || "N/A"}</Text>
                                                            </Box>
                                                        )}
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
                                        ))}
                                    </Accordion>
                                    <Divider mt={4} />
                                </Box>
                            ))}
                        </Box>
                    </>
                )}
            </CardBody>
        </Card>
    )
} 