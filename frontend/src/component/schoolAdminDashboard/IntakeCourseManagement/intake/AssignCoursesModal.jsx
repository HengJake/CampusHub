import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Box,
    Text,
    FormControl,
    FormLabel,
    Input,
    Select,
    Grid,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

export function AssignCoursesModal({
    isOpen,
    onClose,
    selectedIntake,
    courses,
    currentIntakeCourses,
    selectedIntakeCourseIndex,
    isEditMode,
    assignFormData,
    setAssignFormData,
    handleToggleIntakeCourse,
    handleCourseAssignment,
    resetAssignForm
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {isEditMode ? "Edit IntakeCourse Assignment" : "Assign Courses to Intake"}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text fontWeight="semibold">Intake:</Text>
                            <Text>{selectedIntake?.intakeName}</Text>
                        </Box>

                        {/* IntakeCourse Toggle Navigation */}
                        {currentIntakeCourses.length > 0 && (
                            <Box>
                                <Text fontWeight="semibold" mb={2}>
                                    {isEditMode ? "Edit IntakeCourse" : "Create New IntakeCourse"}
                                </Text>
                                <HStack spacing={2} flexWrap="wrap">
                                    {currentIntakeCourses.map((ic, index) => {
                                        const course = courses.find(c => c._id === (ic.courseId._id || ic.courseId));
                                        return (
                                            <Button
                                                key={ic._id}
                                                size="sm"
                                                variant={selectedIntakeCourseIndex === index ? "solid" : "outline"}
                                                colorScheme={selectedIntakeCourseIndex === index ? "blue" : "gray"}
                                                onClick={() => handleToggleIntakeCourse(index)}
                                            >
                                                {course?.courseName || "Unknown Course"}
                                            </Button>
                                        );
                                    })}
                                    <Button
                                        size="sm"
                                        variant={selectedIntakeCourseIndex === -1 ? "solid" : "outline"}
                                        colorScheme={selectedIntakeCourseIndex === -1 ? "green" : "gray"}
                                        onClick={() => handleToggleIntakeCourse(-1)}
                                        leftIcon={<FiPlus />}
                                    >
                                        Add New
                                    </Button>
                                </HStack>
                            </Box>
                        )}

                        <FormControl isRequired>
                            {isEditMode ? (
                                <>
                                    <FormLabel>Select Course</FormLabel>
                                    <Text>{courses.filter(c => c._id == assignFormData.courseIds[0])[0]?.courseName}</Text>
                                </>
                            ) : (
                                <>
                                    <FormLabel>Select Course</FormLabel>
                                    <Select
                                        value={assignFormData.courseIds[0] || ""}
                                        onChange={(e) => setAssignFormData(prev => ({ ...prev, courseIds: [e.target.value] }))}
                                    >
                                        <option value="">Select a course...</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.courseName}
                                            </option>
                                        ))}
                                    </Select>
                                </>
                            )}
                        </FormControl>

                        <Grid templateColumns="1fr 1fr" gap={4}>
                            <FormControl isRequired>
                                <FormLabel>Max Students</FormLabel>
                                <Input
                                    type="number"
                                    value={assignFormData.maxStudents}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                                    min="1"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={assignFormData.status}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="available">Available</option>
                                    <option value="full">Full</option>
                                    <option value="closed">Closed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Duration (Months)</FormLabel>
                                <Input
                                    type="number"
                                    value={assignFormData.duration}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, duration: e.target.value }))}
                                    min="1"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Max Duration (Months)</FormLabel>
                                <Input
                                    type="number"
                                    value={assignFormData.maxDuration}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
                                    min="1"
                                />
                            </FormControl>
                        </Grid>

                        <Box>
                            <Text fontWeight="semibold" mb={2}>Fee Structure</Text>
                            <Grid templateColumns="1fr 1fr" gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Local Student Fee (RM)</FormLabel>
                                    <Input
                                        type="number"
                                        value={assignFormData.feeStructure.localStudent}
                                        onChange={(e) => setAssignFormData(prev => ({
                                            ...prev,
                                            feeStructure: { ...prev.feeStructure, localStudent: e.target.value }
                                        }))}
                                        min="0"
                                        step="0.01"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>International Student Fee (RM)</FormLabel>
                                    <Input
                                        type="number"
                                        value={assignFormData.feeStructure.internationalStudent}
                                        onChange={(e) => setAssignFormData(prev => ({
                                            ...prev,
                                            feeStructure: { ...prev.feeStructure, internationalStudent: e.target.value }
                                        }))}
                                        min="0"
                                        step="0.01"
                                    />
                                </FormControl>
                            </Grid>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={() => {
                        resetAssignForm();
                        onClose();
                    }}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleCourseAssignment}>
                        {isEditMode ? "Update IntakeCourse" : "Assign Courses"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}