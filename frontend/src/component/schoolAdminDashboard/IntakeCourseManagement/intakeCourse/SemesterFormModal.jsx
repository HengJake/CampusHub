import React from "react";
import {
    VStack,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    Text,
    Box,
} from "@chakra-ui/react";

export function SemesterFormModal({
    isOpen,
    onClose,
    isEditMode,
    semesterForm,
    onFormChange,
    onSubmit,
    isLoading
}) {

    // Calculate end date based on start date and duration in months
    const calculateEndDate = (startDate, durationMonths) => {
        if (!startDate || !durationMonths) return '';

        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + parseInt(durationMonths));

        return end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    // Calculate registration end date based on registration start date and duration in days
    const calculateRegistrationEndDate = (registrationStartDate, registrationDurationDays) => {
        if (!registrationStartDate || !registrationDurationDays) return '';

        const start = new Date(registrationStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + parseInt(registrationDurationDays));

        return end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    // Calculate exam end date based on exam start date and exam duration in days
    const calculateExamEndDate = (examStartDate, examDurationDays) => {
        if (!examStartDate || !examDurationDays) return '';

        const start = new Date(examStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + parseInt(examDurationDays));

        return end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    // Calculate duration in months between two dates
    const calculateDurationMonths = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();

        let totalMonths = yearDiff * 12 + monthDiff;

        if (end.getDate() < start.getDate()) {
            totalMonths -= 1;
        }

        return Math.max(1, Math.round(totalMonths));
    };

    // Calculate duration in days between two dates
    const calculateDurationDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return Math.max(1, daysDiff);
    };

    const calculatedEndDate = calculateEndDate(semesterForm.startDate, semesterForm.durationMonths);
    const calculatedRegistrationEndDate = calculateRegistrationEndDate(semesterForm.registrationStartDate, semesterForm.registrationDurationDays);
    const calculatedExamEndDate = calculateExamEndDate(semesterForm.examStartDate, semesterForm.examDurationDays);

    // Update the endDate in form when calculated date changes (for new semesters)
    React.useEffect(() => {
        if (!isEditMode && calculatedEndDate && calculatedEndDate !== semesterForm.endDate) {
            onFormChange('endDate', calculatedEndDate);
        }
    }, [calculatedEndDate, semesterForm.endDate, onFormChange, isEditMode]);

    // Update the registrationEndDate in form when calculated date changes
    React.useEffect(() => {
        if (!isEditMode && calculatedRegistrationEndDate && calculatedRegistrationEndDate !== semesterForm.registrationEndDate) {
            onFormChange('registrationEndDate', calculatedRegistrationEndDate);
        }
    }, [calculatedRegistrationEndDate, semesterForm.registrationEndDate, onFormChange, isEditMode]);

    // Update the examEndDate in form when calculated exam end date changes
    React.useEffect(() => {
        if (!isEditMode && calculatedExamEndDate && calculatedExamEndDate !== semesterForm.examEndDate) {
            onFormChange('examEndDate', calculatedExamEndDate);
        }
    }, [calculatedExamEndDate, semesterForm.examEndDate, onFormChange, isEditMode]);

    // Calculate and set semester duration when editing existing semester
    React.useEffect(() => {
        if (isEditMode && semesterForm.startDate && semesterForm.endDate && !semesterForm.durationMonths) {
            const duration = calculateDurationMonths(semesterForm.startDate, semesterForm.endDate);
            if (duration > 0) {
                onFormChange('durationMonths', duration.toString());
            }
        }
    }, [isEditMode, semesterForm.startDate, semesterForm.endDate, semesterForm.durationMonths, onFormChange]);

    // Calculate and set registration duration when editing existing semester
    React.useEffect(() => {
        if (isEditMode && semesterForm.registrationStartDate && semesterForm.registrationEndDate && !semesterForm.registrationDurationDays) {
            const regDuration = calculateDurationDays(semesterForm.registrationStartDate, semesterForm.registrationEndDate);
            if (regDuration > 0) {
                onFormChange('registrationDurationDays', regDuration.toString());
            }
        }
    }, [isEditMode, semesterForm.registrationStartDate, semesterForm.registrationEndDate, semesterForm.registrationDurationDays, onFormChange]);

    // Calculate and set exam duration when editing existing semester
    React.useEffect(() => {
        if (isEditMode && semesterForm.examStartDate && semesterForm.examEndDate && !semesterForm.examDurationDays) {
            const examDuration = calculateDurationDays(semesterForm.examStartDate, semesterForm.examEndDate);
            if (examDuration > 0) {
                onFormChange('examDurationDays', examDuration.toString());
            }
        }
    }, [isEditMode, semesterForm.examStartDate, semesterForm.examEndDate, semesterForm.examDurationDays, onFormChange]);

    const handleInputChange = (field, value) => {
        if (field === 'examDurationDays') {
            onFormChange('examEndDate', calculateExamEndDate(semesterForm.examStartDate, value))
        }

        if (field === 'registrationDurationDays') {
            onFormChange('registrationEndDate', calculateRegistrationEndDate(semesterForm.registrationStartDate, value))
        }

        if (field === 'durationMonths') {
            onFormChange('endDate', calculateEndDate(semesterForm.startDate, value))
        }

        onFormChange(field, value);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>{isEditMode ? 'Edit Semester' : 'Add New Semester'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody maxHeight="60vh" overflowY="auto">
                    <VStack spacing={4}>
                        <HStack spacing={4} w="full">
                            <FormControl isRequired>
                                <FormLabel>Semester</FormLabel>
                                <Input
                                    type="number"
                                    value={semesterForm.semesterNumber}
                                    onChange={(e) => handleInputChange('semesterNumber', e.target.value)}
                                    placeholder="e.g., 1"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Year</FormLabel>
                                <Input
                                    type="number"
                                    value={semesterForm.year}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                    placeholder="e.g., 1"
                                />
                            </FormControl>
                        </HStack>

                        <FormControl isRequired>
                            <FormLabel>Semester Name</FormLabel>
                            <Input
                                value={semesterForm.semesterName}
                                onChange={(e) => handleInputChange('semesterName', e.target.value)}
                                placeholder="e.g., Year 1 Semester 1"
                            />
                        </FormControl>

                        <VStack w="full">
                            <HStack spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel>Start Date</FormLabel>
                                    <Input
                                        type="date"
                                        value={semesterForm.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Duration (Months)</FormLabel>
                                    <Select
                                        value={semesterForm.durationMonths || ''}
                                        onChange={(e) => handleInputChange('durationMonths', e.target.value)}
                                        placeholder="Select duration"
                                    >
                                        <option value="1">1 Months</option>
                                        <option value="2">2 Months</option>
                                        <option value="3">3 Months</option>
                                        <option value="4">4 Months</option>
                                        <option value="5">5 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months</option>
                                    </Select>
                                </FormControl>
                            </HStack>
                            <Text alignSelf="start" fontSize="xs" color="gray.700">End Date: {calculatedEndDate}</Text>
                        </VStack>

                        <VStack w="full">
                            <HStack spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel>Registration Start Date</FormLabel>
                                    <Input
                                        type="date"
                                        value={semesterForm.registrationStartDate}
                                        onChange={(e) => handleInputChange('registrationStartDate', e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Registration Duration (Days)</FormLabel>
                                    <Input
                                        type="number"
                                        value={semesterForm.registrationDurationDays || ''}
                                        onChange={(e) => handleInputChange('registrationDurationDays', e.target.value)}
                                        placeholder="e.g., 30"
                                        min="1"
                                    />
                                </FormControl>
                            </HStack>
                            {calculatedRegistrationEndDate && (
                                <Text alignSelf="start" fontSize="xs" color="gray.700">
                                    Registration End Date: {calculatedRegistrationEndDate}
                                </Text>
                            )}
                        </VStack>

                        <VStack w="full">
                            <HStack spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel>Exam Start Date</FormLabel>
                                    <Input
                                        type="date"
                                        value={semesterForm.examStartDate}
                                        onChange={(e) => handleInputChange('examStartDate', e.target.value)}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Exam Duration (Days)</FormLabel>
                                    <Input
                                        type="number"
                                        value={semesterForm.examDurationDays || ''}
                                        onChange={(e) => handleInputChange('examDurationDays', e.target.value)}
                                        placeholder="e.g., 14"
                                        min="1"
                                    />
                                </FormControl>
                            </HStack>
                            {calculatedExamEndDate && (
                                <Text alignSelf="start" fontSize="xs" color="gray.700">
                                    Exam End Date: {calculatedExamEndDate}
                                </Text>
                            )}
                        </VStack>

                        <FormControl isRequired>
                            <FormLabel>Status</FormLabel>
                            <Select
                                value={semesterForm.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="registration_open">Registration Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="exam_period">Exam Period</option>
                                <option value="completed">Completed</option>
                            </Select>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={onSubmit}
                        isLoading={isLoading}
                        loadingText={isEditMode ? "Updating..." : "Adding..."}
                    >
                        {isEditMode ? 'Update Semester' : 'Add Semester'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}