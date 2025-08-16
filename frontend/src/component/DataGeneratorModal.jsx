import React, { useState } from 'react';
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
    Select,
    Checkbox,
    Progress,
    Box,
    Alert,
    AlertIcon,
    useToast
} from '@chakra-ui/react';
import { generateCompleteSchoolData, generateSchoolData, generateUserData } from '../utils/userDataGenerator';

const DataGeneratorModal = ({ isOpen, onClose, onDataGenerated }) => {
    const [generationType, setGenerationType] = useState('complete');
    const [schoolPrefix, setSchoolPrefix] = useState('SCH');
    const [userCounts, setUserCounts] = useState({
        lecturer: 8,
        student: 50
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [generatedData, setGeneratedData] = useState(null);
    const toast = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress(0);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + Math.random() * 20, 90));
            }, 200);

            let data;

            if (generationType === 'complete') {
                data = generateCompleteSchoolData(schoolPrefix, userCounts);
            } else if (generationType === 'school') {
                data = generateSchoolData(schoolPrefix);
            } else if (generationType === 'users') {
                const schoolData = generateSchoolData(schoolPrefix);
                data = {
                    school: schoolData,
                    users: generateCompleteSchoolData(schoolPrefix, userCounts).users
                };
            }

            clearInterval(progressInterval);
            setProgress(100);

            setGeneratedData(data);

            // Show success toast
            toast({
                title: 'Data Generated Successfully!',
                description: `${generationType === 'complete' ? 'Complete school data' : generationType === 'school' ? 'School data' : 'User data'} has been generated.`,
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
                description: 'An error occurred while generating data.',
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
        link.download = `generated_data_${schoolPrefix}_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const resetForm = () => {
        setSchoolPrefix('SCH');
        setUserCounts({
            lecturer: 8,
            student: 50
        });
        setGeneratedData(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Generate Sample Data</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {/* Generation Type Selection */}
                        <FormControl>
                            <FormLabel>Generation Type</FormLabel>
                            <Select
                                value={generationType}
                                onChange={(e) => setGenerationType(e.target.value)}
                                isDisabled={isGenerating}
                            >
                                <option value="complete">Complete School Data</option>
                                <option value="school">School Data Only</option>
                                <option value="users">Users Data Only</option>
                            </Select>
                        </FormControl>

                        {/* School Prefix */}
                        <FormControl>
                            <FormLabel>School Prefix</FormLabel>
                            <Input
                                value={schoolPrefix}
                                onChange={(e) => setSchoolPrefix(e.target.value)}
                                placeholder="e.g., APU, BPU, SCH"
                                isDisabled={isGenerating}
                            />
                        </FormControl>

                        {/* User Counts (only show for complete and users generation) */}
                        {(generationType === 'complete' || generationType === 'users') && (
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
                                            isDisabled={isGenerating}
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
                                            isDisabled={isGenerating}
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
                        )}

                        {/* Progress Bar */}
                        {isGenerating && (
                            <Box>
                                <Text mb={2}>Generating data...</Text>
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
                                            {generationType === 'complete' ? 'Complete School Data Generated!' :
                                                generationType === 'school' ? 'School Data Generated!' : 'User Data Generated!'}
                                        </Text>
                                        <Text fontSize="sm">
                                            {generationType === 'complete' && `School: ${generatedData.school?.name}`}
                                            {generationType === 'complete' && ` | Users: ${Object.values(generatedData.users || {}).flat().length}`}
                                            {generationType === 'complete' && ` | Resources: ${generatedData.facility?.resources?.length || 0}`}
                                            {generationType === 'school' && `School: ${generatedData.name}`}
                                            {generationType === 'users' && `Users: ${Object.values(generatedData.users || {}).flat().length}`}
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
                            variant="ghost"
                            onClick={resetForm}
                            isDisabled={isGenerating}
                        >
                            Reset
                        </Button>

                        <Button
                            colorScheme="green"
                            onClick={handleGenerate}
                            isLoading={isGenerating}
                            loadingText="Generating..."
                            isDisabled={!schoolPrefix.trim()}
                        >
                            Generate Data
                        </Button>

                        <Button onClick={onClose} isDisabled={isGenerating}>
                            Close
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DataGeneratorModal;
