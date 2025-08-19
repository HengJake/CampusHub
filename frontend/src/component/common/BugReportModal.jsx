import React, { useState } from 'react';
import { useServiceStore } from '../../store/service.js';
import { useAuthStore } from '../../store/auth.js';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    VStack,
    HStack,
    Box,
    Image,
    Text,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast
} from '@chakra-ui/react';

const BugReportModal = ({ isOpen, onClose, onSuccess, currentPath = "" }) => {
    const [formData, setFormData] = useState({
        image: '',
        consoleLogMessage: '',
        errorFile: currentPath,
        description: '',
        priority: 'Medium'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { createBugReport } = useServiceStore();
    const { getCurrentUser } = useAuthStore();
    const toast = useToast();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    image: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = getCurrentUser();
            const bugReportData = {
                ...formData,
                userId: user.user._id
            };

            const result = await createBugReport(bugReportData);

            if (result.success) {
                setFormData({
                    image: '',
                    consoleLogMessage: '',
                    errorFile: currentPath,
                    description: '',
                    priority: 'Medium'
                });
                toast({
                    title: "Bug Report Submitted",
                    description: "Your bug report has been submitted successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                onSuccess && onSuccess(result.data);
                onClose();
            } else {
                setError(result.message || 'Failed to submit bug report');
            }
        } catch (err) {
            setError('An error occurred while submitting the bug report');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Report a Bug</ModalHeader>
                <ModalCloseButton />

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Screenshot of the Bug</FormLabel>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    p={1}
                                    border="2px dashed"
                                    borderColor="gray.300"
                                    borderRadius="md"
                                    _hover={{ borderColor: "blue.400" }}
                                    transition="all 0.2s"
                                />
                                {formData.image && (
                                    <Box mt={3}>
                                        <Image
                                            src={formData.image}
                                            alt="Screenshot preview"
                                            maxH="200px"
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="gray.200"
                                        />
                                    </Box>
                                )}
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Console Log Message</FormLabel>
                                <Textarea
                                    name="consoleLogMessage"
                                    value={formData.consoleLogMessage}
                                    onChange={handleInputChange}
                                    placeholder="Paste the console.log message or error here..."
                                    rows={3}
                                    resize="vertical"
                                    fontFamily="mono"
                                    bg="gray.50"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>File Where Error Occurred</FormLabel>
                                <Input
                                    type="text"
                                    name="errorFile"
                                    value={formData.errorFile}
                                    placeholder="e.g., /src/pages/StudentDashboard.jsx"
                                    fontFamily="mono"
                                    readOnly
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Additional Description</FormLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe what you were doing when the bug occurred..."
                                    rows={3}
                                    resize="vertical"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Priority Level</FormLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </Select>
                            </FormControl>

                            {error && (
                                <Alert status="error" borderRadius="md">
                                    <AlertIcon />
                                    <Box>
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Box>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <HStack spacing={3}>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                isDisabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={isSubmitting}
                                loadingText="Submitting..."
                            >
                                Submit Bug Report
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default BugReportModal;
