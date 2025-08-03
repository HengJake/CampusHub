import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    HStack,
    Badge,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Box,
    Divider
} from "@chakra-ui/react"
import React from "react"

export default function ResultsTemplateModal({
    isOpen,
    onClose,
    onProceed,
    selectedIntake,
    selectedCourse,
    selectedModule,
    selectedYear,
    selectedSemester,
    intakeCourses,
    modules,
    semesters,
    previewResultsLength
}) {
    // Get display names for selected values
    const getIntakeName = () => {
        const intakeCourse = intakeCourses.find(ic => ic.intakeId._id === selectedIntake);
        return intakeCourse?.intakeId?.intakeName || "Not Selected";
    };

    const getCourseName = () => {
        const intakeCourse = intakeCourses.find(ic =>
            ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse
        );
        return intakeCourse?.courseId?.courseName || "Not Selected";
    };

    const getModuleName = () => {
        const module = modules.find(m => m._id === selectedModule);
        return module?.moduleName || "Not Selected";
    };

    const getSemesterName = () => {
        const semester = semesters.find(s => s._id === selectedSemester);
        return semester?.semesterName || "Not Selected";
    };

    const hasModuleSelected = selectedModule;
    const hasNoExistingResults = previewResultsLength === 0;
    const canGenerateTemplate = hasModuleSelected && hasNoExistingResults;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Generate Results Template</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Template Generation Guide</AlertTitle>
                                <AlertDescription fontSize="sm">
                                    This will generate an Excel template file for student results.
                                    Fill in the grades and import the file to add results to the database.
                                </AlertDescription>
                            </Box>
                        </Alert>

                        {!hasNoExistingResults && (
                            <Alert status="warning" borderRadius="md">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle fontSize="sm">Existing Results Found</AlertTitle>
                                    <AlertDescription fontSize="sm">
                                        There are already {previewResultsLength} results for the selected filters.
                                        Template generation is disabled to prevent duplicates.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}

                        <Box>
                            <Text fontWeight="semibold" mb={3}>Selected Filters:</Text>
                            <VStack spacing={2} align="stretch">
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">Module (Required):</Text>
                                    <Badge colorScheme={selectedModule ? "purple" : "red"}>
                                        {getModuleName()}
                                    </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">Intake:</Text>
                                    <Badge colorScheme={selectedIntake ? "green" : "gray"}>
                                        {getIntakeName()}
                                    </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">Course:</Text>
                                    <Badge colorScheme={selectedCourse ? "blue" : "gray"}>
                                        {getCourseName()}
                                    </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">Year:</Text>
                                    <Badge colorScheme={selectedYear ? "orange" : "gray"}>
                                        {selectedYear || "Not Selected"}
                                    </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">Semester:</Text>
                                    <Badge colorScheme={selectedSemester ? "teal" : "gray"}>
                                        {getSemesterName()}
                                    </Badge>
                                </HStack>
                            </VStack>
                        </Box>

                        <Divider />

                        <Box>
                            <Text fontWeight="semibold" mb={2}>Template Format:</Text>
                            <VStack spacing={1} align="stretch" fontSize="sm" color="gray.600">
                                <Text>• Student ID (auto-filled)</Text>
                                <Text>• Student Name (auto-filled)</Text>
                                <Text>• Marks (0-100) - Fill this column</Text>
                                <Text>• Grade (auto-calculated from marks)</Text>
                                <Text>• GPA (auto-calculated from marks)</Text>
                                <Text>• Credit Hours (auto-filled)</Text>
                                <Text>• Remark (optional - fill this column)</Text>
                            </VStack>
                        </Box>

                        <Alert status="warning" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Important Notes:</AlertTitle>
                                <AlertDescription fontSize="sm">
                                    • Only fill in the Marks column (0-100)<br />
                                    • Only fill in the Remark column (optional)<br />
                                    • Grade and GPA will be auto-calculated from marks<br />
                                    • Leave other columns as they are<br />
                                    • Import the filled template to add results
                                </AlertDescription>
                            </Box>
                        </Alert>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        mr={3}
                        onClick={onProceed}
                        isDisabled={!canGenerateTemplate}
                    >
                        Generate Template
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
} 