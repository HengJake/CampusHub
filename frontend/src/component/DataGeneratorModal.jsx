// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: DataGeneratorModal.jsx
// Description: Modal component for generating sample data across different modules, providing bulk data creation functionality for testing and development
// First Written on: June 25, 2024
// Edited on: Friday, August 2, 2024

import React, { useState, useEffect } from 'react';
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
    Text,
    FormControl,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Progress,
    Box,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Badge,
    Spinner
} from '@chakra-ui/react';
import { generateAcademicData, generateAcademicSummary } from '../utils/academicDataGenerator';
import { useAuthStore } from '../store/auth';

const DataGeneratorModal = ({ isOpen, onClose, onDataGenerated }) => {
    const { getCurrentUser, school } = useAuthStore();
    const schoolName = school?.name || "";

    const [schoolPrefix, setSchoolPrefix] = useState(school?.prefix || 'SCH');
    const [schoolId, setSchoolId] = useState('');
    const [userCounts, setUserCounts] = useState({
        lecturer: 8,
        student: 50
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [generatedData, setGeneratedData] = useState(null);
    const [schoolDetails, setSchoolDetails] = useState(null);

    const [dataStatus, setDataStatus] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [canGenerateData, setCanGenerateData] = useState(false);

    // Check school data status when modal opens
    useEffect(() => {
        if (isOpen && schoolId) {
            checkSchoolDataStatus();
        }
    }, [isOpen, schoolId]);

    const toast = useToast();
    const checkSchoolDataStatus = async () => {
        if (!schoolId) return;

        setIsCheckingStatus(true);
        try {
            // Use the new endpoint for quick generation status check
            const response = await fetch(`/api/school-data-status/${schoolId}/generation-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setCanGenerateData(result.data.enabled);

                if (!result.data.enabled) {
                    toast({
                        title: 'Data Generation Disabled',
                        description: result.data.reason,
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                console.error('Failed to check data status:', result.message);
                toast({
                    title: 'Status Check Failed',
                    description: 'Unable to check school data status. Please try again.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error checking data status:', error);
            toast({
                title: 'Status Check Failed',
                description: 'Network error while checking data status.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // Get school details from auth store when modal opens
    useEffect(() => {
        if (isOpen) {
            const currentUser = getCurrentUser();
            if (currentUser.schoolId) {
                setSchoolId(currentUser.schoolId);
                // You can also fetch additional school details here if needed
                setSchoolDetails({
                    id: currentUser.schoolId,
                    name: currentUser.user.school.name || 'Your School'
                });
            }
        }
    }, [isOpen, getCurrentUser]);

    // Update school prefix when school data changes
    useEffect(() => {
        if (school?.prefix) {
            setSchoolPrefix(school.prefix);
        }
    }, [school?.prefix]);


    const handleGenerate = async () => {

        if (!canGenerateData) {
            toast({
                title: 'Data Generation Blocked',
                description: 'Cannot generate data when collections already contain data.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }


        setIsGenerating(true);
        setProgress(0);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + Math.random() * 20, 90));
            }, 200);

            // Generate academic data for existing school
            if (!schoolId.trim()) {
                throw new Error('School ID is required for academic data generation');
            }

            const data = await generateAcademicData(schoolId, schoolPrefix, userCounts);
            data.summary = generateAcademicSummary(data);

            clearInterval(progressInterval);
            setProgress(100);

            setGeneratedData(data);

            // Update canGenerateData to false since data now exists
            setCanGenerateData(false);

            // Refresh the data status to ensure UI is in sync
            await checkSchoolDataStatus();

            // Show success toast
            toast({
                title: 'Academic Data Generated Successfully!',
                description: 'Academic and service data has been generated for your school.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Call the callback with generated data
            if (onDataGenerated) {
                onDataGenerated(data);
            }

        } catch (error) {
            console.error('Error generating data:', error);
            toast({
                title: 'Generation Failed',
                description: error.message || 'An error occurred while generating data.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsGenerating(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleDownload = () => {
        if (!generatedData) return;

        const dataStr = JSON.stringify(generatedData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `academic_data_${schoolPrefix}_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const resetForm = () => {
        // Don't reset schoolPrefix as it comes from school data
        setUserCounts({
            lecturer: 8,
            student: 50
        });
        setGeneratedData(null);
        // Don't reset schoolId as it comes from auth
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Generate Academic Data</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={6} align="stretch">

                        {isCheckingStatus ? (
                            <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50" borderColor="gray.200">
                                <HStack spacing={3} justify="center">
                                    <Spinner size="sm" />
                                    <Text>Checking data generation status...</Text>
                                </HStack>
                            </Box>
                        ) : (
                            <Box p={4} borderWidth={1} borderRadius="md"
                                bg={canGenerateData ? "green.50" : "red.50"}
                                borderColor={canGenerateData ? "green.200" : "red.200"}>
                                <Alert status={canGenerateData ? "success" : "error"}>
                                    <AlertIcon />
                                    <Box>
                                        <AlertTitle>
                                            {canGenerateData ? "Data Generation Enabled" : "Data Generation Disabled"}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {canGenerateData
                                                ? "All collections are empty. You can safely generate sample data."
                                                : "Some collections already contain data. Data generation is disabled to prevent data loss."
                                            }
                                        </AlertDescription>
                                    </Box>
                                </Alert>
                            </Box>
                        )}

                        {/* School Information Display */}
                        {schoolDetails && (
                            <Box p={4} borderWidth={1} borderRadius="md" bg="blue.50" borderColor="blue.200">
                                <HStack spacing={4}>
                                    <Box>
                                        <Text fontSize="sm" color="gray.600">School ID:</Text>
                                        <Badge colorScheme="blue" fontSize="sm" p={1}>
                                            {schoolDetails.id}
                                        </Badge>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" color="gray.600">School Name:</Text>
                                        <Text fontWeight="medium">{schoolDetails.name}</Text>
                                    </Box>
                                </HStack>
                            </Box>
                        )}



                        {/* School Prefix */}
                        <FormControl>
                            <FormLabel>School Prefix (Auto-populated)</FormLabel>
                            <Input
                                value={schoolPrefix}
                                isReadOnly
                                placeholder="School prefix from database"
                                isDisabled={isGenerating || generatedData}
                            />
                        </FormControl>

                        {/* User Counts */}
                        <Box>
                            <Text fontWeight="medium" mb={3}>User Counts</Text>
                            <VStack spacing={3}>
                                <HStack justify="space-between" w="full">
                                    <Text>Lecturers:</Text>
                                    <NumberInput
                                        value={userCounts.lecturer}
                                        onChange={(value) => setUserCounts(prev => ({ ...prev, lecturer: parseInt(value) || 0 }))}
                                        min={1}
                                        max={20}
                                        isDisabled={isGenerating || generatedData}
                                        size="sm"
                                        w="100px"
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </HStack>

                                <HStack justify="space-between" w="full">
                                    <Text>Students:</Text>
                                    <NumberInput
                                        value={userCounts.student}
                                        onChange={(value) => setUserCounts(prev => ({ ...prev, student: parseInt(value) || 0 }))}
                                        min={10}
                                        max={200}
                                        isDisabled={isGenerating || generatedData}
                                        size="sm"
                                        w="100px"
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </HStack>
                            </VStack>
                        </Box>

                        {/* Progress Bar */}
                        {isGenerating && (
                            <Box>
                                <Text mb={2}>Generating academic data...</Text>
                                <Progress value={progress} colorScheme="green" size="lg" />
                                <Text fontSize="sm" mt={2} textAlign="center">
                                    {Math.round(progress)}%
                                </Text>
                            </Box>
                        )}

                        {/* Generated Data Preview */}
                        {generatedData && !isGenerating && (
                            <Box>
                                <Text fontWeight="medium" mb={3}>Generated Data Summary</Text>
                                <Alert status="success" borderRadius="md">
                                    <AlertIcon />
                                    <Box>
                                        <Text fontWeight="medium">
                                            Academic & Service Data Generated!
                                        </Text>
                                        <Text fontSize="sm">
                                            {generatedData.summary && (
                                                <>
                                                    Rooms: {generatedData.summary.totalRooms} |
                                                    Departments: {generatedData.summary.totalDepartments} |
                                                    Courses: {generatedData.summary.totalCourses} |
                                                    Students: {generatedData.summary.totalStudents} |
                                                    Lecturers: {generatedData.summary.totalLecturers}
                                                </>
                                            )}
                                        </Text>
                                    </Box>
                                </Alert>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        {generatedData && (
                            <Button
                                colorScheme="blue"
                                variant="outline"
                                onClick={handleDownload}
                                leftIcon={<span>📥</span>}
                            >
                                Download JSON
                            </Button>
                        )}



                        <Button
                            colorScheme="green"
                            onClick={handleGenerate}
                            isLoading={isGenerating}
                            loadingText="Generating..."
                            isDisabled={!schoolPrefix.trim() || !schoolId.trim() || generatedData || isCheckingStatus || !canGenerateData}
                        >
                            Generate Academic Data
                        </Button>

                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DataGeneratorModal;
