import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    VStack,
    HStack,
    Text,
    Badge,
    useToast,
    Flex,
    Heading,
    Card,
    CardBody,
    useColorModeValue,
    Center,
    Spinner,
    Image as ChakraImage,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Radio,
    RadioGroup,
    Stack,
    Icon,
    IconButton,
    Tooltip,
    SimpleGrid,
    Divider,
    Checkbox,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter
} from '@chakra-ui/react';
import {
    FiPlus,
    FiCamera,
    FiX,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiPackage,
    FiMapPin,
    FiCalendar,
    FiUser,
    FiEye
} from 'react-icons/fi';
import { useServiceStore } from '../../store/service.js';
import { useAuthStore } from '../../store/auth.js';

export const LostFoundReport = () => {
    const [formData, setFormData] = useState({
        itemDetails: {
            name: '',
            description: '',
            location: '',
            lostDate: '',
            image: null,
            imageData: null,
            imageType: null
        },
        status: 'reported',
        type: 'lost' // 'lost' or 'found'
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedItem, setSubmittedItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
        const [errors, setErrors] = useState({});
    const [useTodayDate, setUseTodayDate] = useState(false);
    const [studentReports, setStudentReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);

    // Image preview modal state
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    
    const fileInputRef = useRef();
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const cardBg = useColorModeValue('white', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.600');

    const { createLostItem, fetchLostItemsByStudentId } = useServiceStore();
    const { currentUser, initializeAuth, getSchoolId } = useAuthStore();

    // Handle opening image preview modal
    const handleOpenImageModal = (imageData, imageName) => {
        setSelectedImage({ data: imageData, name: imageName });
        setIsImageModalOpen(true);
    };

    // Auto-set date to today when checkbox is checked
    React.useEffect(() => {
        if (useTodayDate) {
            setFormData(prev => ({
                ...prev,
                itemDetails: {
                    ...prev.itemDetails,
                    lostDate: getTodayDate()
                }
            }));
        }
    }, [useTodayDate]);

    // Fetch student reports when component mounts
    React.useEffect(() => {
        const fetchStudentReports = async () => {
            if (currentUser?.student?._id) {
                setLoadingReports(true);
                try {
                    const result = await fetchLostItemsByStudentId(currentUser.student._id);
                    if (result.success) {
                        setStudentReports(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching student reports:', error);
                } finally {
                    setLoadingReports(false);
                }
            }
        };

        fetchStudentReports();
    }, [currentUser?.student?._id, fetchLostItemsByStudentId]);

    const locations = [
        'library', 'cafeteria', 'classroom', 'court', 'parking lot',
        'lobby', 'office', 'gym', 'outdoor_area', 'other'
    ];

    const getStatusColor = (status) => {
        const colors = {
            reported: 'red',
            found: 'yellow',
            claimed: 'green'
        };
        return colors[status] || 'gray';
    };

    const getStatusIcon = (status) => {
        const icons = {
            reported: FiAlertCircle,
            found: FiClock,
            claimed: FiCheckCircle
        };
        return icons[status] || FiPackage;
    };

    const getStatusText = (status) => {
        const texts = {
            reported: 'Reported',
            found: 'Found',
            claimed: 'Claimed'
        };
        return texts[status] || status;
    };

    const getLocationIcon = (location) => {
        return FiMapPin;
    };

    // Helper function to get today's date in yyyy-MM-dd format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Helper function to validate date is not in the future
    const validateDate = (dateString) => {
        if (!dateString) return false;
        const inputDate = new Date(dateString);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        return inputDate <= today;
    };

    // Image handling functions
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Please select an image smaller than 5MB',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            itemDetails: { ...prev.itemDetails, image: null }
        }));
    };

    const handleImageUpload = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
                resolve({
                    imageData: base64Data,
                    imageType: file.type,
                    imageName: file.name
                });
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.itemDetails.name.trim()) {
            newErrors.name = 'Item name is required';
        }

        if (!formData.itemDetails.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.itemDetails.location) {
            newErrors.location = 'Location is required';
        }

        if (!formData.itemDetails.lostDate) {
            newErrors.lostDate = 'Date is required';
        } else if (!validateDate(formData.itemDetails.lostDate)) {
            newErrors.lostDate = 'Date cannot be in the future';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            await initializeAuth();
            const schoolId = await getSchoolId();




            let finalFormData = { ...formData };

            // Ensure date is properly formatted for backend
            if (finalFormData.itemDetails.lostDate) {
                finalFormData = {
                    ...finalFormData,
                    itemDetails: {
                        ...finalFormData.itemDetails,
                        lostDate: new Date(finalFormData.itemDetails.lostDate).toISOString()
                    }
                };
            }

            // Handle image upload if there's an image file
            if (imageFile) {
                const imageData = await handleImageUpload(imageFile);
                finalFormData = {
                    ...finalFormData,
                    itemDetails: {
                        ...finalFormData.itemDetails,
                        image: null,
                        imageData: imageData.imageData,
                        imageType: imageData.imageType
                    }
                };
            }

            // Set status based on type
            const status = formData.type === 'lost' ? 'reported' : 'found';
            finalFormData.status = status;

            const newItemData = {
                personId: currentUser.student._id,
                itemDetails: finalFormData.itemDetails,
                status: finalFormData.status,
                resolution: {
                    status: status,
                    notes: ''
                }
            };

            const result = await createLostItem(newItemData);
            if (result.success) {
                setSubmittedItem({
                    ...newItemData,
                    _id: result.data?._id || 'temp-id',
                    createdAt: new Date().toISOString()
                });
                setSubmitted(true);
                // Refresh student reports
                if (currentUser?.student?._id) {
                    const refreshResult = await fetchLostItemsByStudentId(currentUser.student._id);
                    if (refreshResult.success) {
                        setStudentReports(refreshResult.data);
                    }
                }
                toast({
                    title: 'Success',
                    description: 'Your item report has been submitted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error(result.message || 'Failed to submit item report');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit item report',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            itemDetails: {
                name: '',
                description: '',
                location: '',
                lostDate: '',
                image: null,
                imageData: null,
                imageType: null
            },
            status: 'reported',
            type: 'lost'
        });
        setImagePreview(null);
        setImageFile(null);
        setErrors({});
        setErrors({});
        setSubmitted(false);
        setSubmittedItem(null);
        setUseTodayDate(false);
    };

    if (submitted && submittedItem) {
        return (
            <Box maxW="800px" mx="auto">
                <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
                    <CardBody p={8}>
                        <VStack spacing={6} align="center">
                            <Icon as={FiCheckCircle} size="64px" color="green.500" />

                            <VStack spacing={2} textAlign="center">
                                <Heading size="lg" color="green.600">
                                    Report Submitted Successfully!
                                </Heading>
                                <Text color="gray.600" fontSize="lg">
                                    Your item report has been submitted and is now being processed.
                                </Text>
                            </VStack>

                            <Divider />

                            {/* Submitted Item Summary */}
                            <Box w="100%">
                                <Text fontWeight="bold" fontSize="lg" mb={4} color="gray.700">
                                    Submitted Item Details:
                                </Text>

                                <Card bg={bgColor} shadow="sm" border="1px" borderColor={borderColor}>
                                    <CardBody p={4}>
                                        <VStack spacing={4} align="stretch">
                                            {/* Status Badge */}
                                            <Box position="relative">
                                                <Badge
                                                    colorScheme={getStatusColor(submittedItem.status)}
                                                    variant="solid"
                                                    size="lg"
                                                    px={3}
                                                    py={2}
                                                    borderRadius="full"
                                                    fontSize="md"
                                                    fontWeight="bold"
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={2}
                                                    w="fit-content"
                                                >
                                                    <Icon as={getStatusIcon(submittedItem.status)} size="16px" />
                                                    {getStatusText(submittedItem.status)}
                                                </Badge>
                                            </Box>

                                            {/* Item Image */}
                                            {submittedItem.itemDetails?.imageData && (
                                                <Box borderRadius="md" overflow="hidden">
                                                    <ChakraImage
                                                        src={submittedItem.itemDetails.imageData}
                                                        alt={submittedItem.itemDetails.name}
                                                        width="100%"
                                                        height="200px"
                                                        objectFit="cover"
                                                        cursor="pointer"
                                                        onClick={() => handleOpenImageModal(submittedItem.itemDetails.imageData, submittedItem.itemDetails.name)}
                                                    />
                                                </Box>
                                            )}

                                            {/* Item Information */}
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>
                                                        Item Name:
                                                    </Text>
                                                    <Text color="gray.800" fontSize="lg">
                                                        {submittedItem.itemDetails?.name}
                                                    </Text>
                                                </Box>

                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>
                                                        Type:
                                                    </Text>
                                                    <Badge
                                                        colorScheme={submittedItem.type === 'lost' ? 'red' : 'green'}
                                                        variant="subtle"
                                                        fontSize="md"
                                                    >
                                                        {submittedItem.type === 'lost' ? 'Lost Item' : 'Found Item'}
                                                    </Badge>
                                                </Box>

                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>
                                                        Location:
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Icon as={getLocationIcon(submittedItem.itemDetails?.location)} color="gray.400" size="16px" />
                                                        <Text color="gray.800" textTransform="capitalize">
                                                            {submittedItem.itemDetails?.location?.replace('_', ' ') || 'Unknown Location'}
                                                        </Text>
                                                    </HStack>
                                                </Box>

                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>
                                                        Date:
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Icon as={FiCalendar} color="gray.400" size="16px" />
                                                        <Text color="gray.800">
                                                            {submittedItem.itemDetails?.lostDate ?
                                                                new Date(submittedItem.itemDetails.lostDate).toLocaleDateString() :
                                                                'Date unknown'
                                                            }
                                                        </Text>
                                                    </HStack>
                                                </Box>
                                            </SimpleGrid>

                                            <Box>
                                                <Text fontWeight="semibold" color="gray.600" mb={1}>
                                                    Description:
                                                </Text>
                                                <Text color="gray.800">
                                                    {submittedItem.itemDetails?.description}
                                                </Text>
                                            </Box>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </Box>

                            <Divider />

                            {/* Action Buttons */}
                            <HStack spacing={4} w="100%" justify="center">
                                <Button
                                    leftIcon={<FiPlus />}
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={handleReset}
                                    w={{ base: "100%", md: "auto" }}
                                >
                                    Report Another Item
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => window.history.back()}
                                    w={{ base: "100%", md: "auto" }}
                                >
                                    Go Back
                                </Button>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>
            </Box>
        );
    }

    return (
        <Box p={6} maxW="1200px" mx="auto">
            <VStack spacing={8} align="stretch">
                {/* Header Section */}
                <Box textAlign="center">
                    <Heading size="xl" color="blue.600" mb={4}>
                        Lost & Found Management
                    </Heading>
                    <Text color="gray.600" fontSize="lg" maxW="600px" mx="auto">
                        Report items you lost or found on campus, and view all your previous reports.
                    </Text>
                </Box>

                {/* Tabbed Interface */}
                <Tabs variant="enclosed" colorScheme="blue" size="lg">
                    <TabList>
                        <Tab>
                            <HStack spacing={2}>
                                <Icon as={FiPlus} />
                                <Text>Report New Item</Text>
                            </HStack>
                        </Tab>
                        <Tab>
                            <HStack spacing={2}>
                                <Icon as={FiEye} />
                                <Text>My Reports ({studentReports.length})</Text>
                            </HStack>
                        </Tab>
                    </TabList>

                    <TabPanels>
                        {/* Report New Item Tab */}
                        <TabPanel>
                            <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
                                <CardBody p={8}>
                                    <VStack spacing={6} align="stretch">
                                        {/* Type Selector */}
                                        <FormControl>
                                            <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                                                Item Type
                                            </FormLabel>
                                            <RadioGroup
                                                value={formData.type}
                                                onChange={(value) => setFormData({ ...formData, type: value })}
                                            >
                                                <Stack direction="row" spacing={8}>
                                                    <Radio value="lost" colorScheme="red">
                                                        <HStack spacing={2}>
                                                            <Icon as={FiAlertCircle} color="red.500" />
                                                            <Text>Lost Item</Text>
                                                        </HStack>
                                                    </Radio>
                                                    <Radio value="found" colorScheme="green">
                                                        <HStack spacing={2}>
                                                            <Icon as={FiPackage} color="green.500" />
                                                            <Text>Found Item</Text>
                                                        </HStack>
                                                    </Radio>
                                                </Stack>
                                            </RadioGroup>
                                        </FormControl>

                                        <Divider />

                                        {/* Item Details */}
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                            <FormControl isRequired isInvalid={!!errors.name}>
                                                <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                                                    Item Name
                                                </FormLabel>
                                                <Input
                                                    value={formData.itemDetails.name}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            itemDetails: { ...formData.itemDetails, name: e.target.value }
                                                        });
                                                        if (errors.name) setErrors({ ...errors, name: '' });
                                                    }}
                                                    placeholder="Enter item name"
                                                    size="lg"
                                                    borderRadius="md"
                                                />
                                                {errors.name && (
                                                    <Text color="red.500" fontSize="sm" mt={1}>
                                                        {errors.name}
                                                    </Text>
                                                )}
                                            </FormControl>

                                            <FormControl isRequired isInvalid={!!errors.location}>
                                                <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                                                    Location
                                                </FormLabel>
                                                <Select
                                                    value={formData.itemDetails.location}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            itemDetails: { ...formData.itemDetails, location: e.target.value }
                                                        });
                                                        if (errors.location) setErrors({ ...errors, location: '' });
                                                    }}
                                                    placeholder="Select location"
                                                    size="lg"
                                                    borderRadius="md"
                                                >
                                                    {locations.map(location => (
                                                        <option key={location} value={location}>
                                                            {location.replace('_', ' ')}
                                                        </option>
                                                    ))}
                                                </Select>
                                                {errors.location && (
                                                    <Text color="red.500" fontSize="sm" mt={1}>
                                                        {errors.location}
                                                    </Text>
                                                )}
                                            </FormControl>
                                        </SimpleGrid>

                                        <FormControl isRequired isInvalid={!!errors.description}>
                                            <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                                                Description
                                            </FormLabel>
                                            <Textarea
                                                value={formData.itemDetails.description}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        itemDetails: { ...formData.itemDetails, description: e.target.value }
                                                    });
                                                    if (errors.description) setErrors({ ...errors, description: '' });
                                                }}
                                                placeholder="Describe the item in detail (color, size, brand, etc.)"
                                                rows={4}
                                                size="lg"
                                                borderRadius="md"
                                            />
                                            {errors.description && (
                                                <Text color="red.500" fontSize="sm" mt={1}>
                                                    {errors.description}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={!!errors.lostDate}>
                                            <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                                                {formData.type === 'lost' ? 'Lost Date' : 'Found Date'}
                                            </FormLabel>

                                            {/* Quick Date Selection */}
                                            <VStack spacing={3} align="stretch">
                                                <Checkbox
                                                    isChecked={useTodayDate}
                                                    onChange={(e) => setUseTodayDate(e.target.checked)}
                                                    colorScheme="blue"
                                                    size="lg"
                                                >
                                                    <HStack spacing={2}>
                                                        <Icon as={FiCalendar} color="blue.500" />
                                                        <Text fontWeight="medium">
                                                            Today ({getTodayDate()})
                                                        </Text>
                                                    </HStack>
                                                </Checkbox>

                                                <Input
                                                    type="date"
                                                    value={formData.itemDetails.lostDate}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            itemDetails: { ...formData.itemDetails, lostDate: e.target.value }
                                                        });
                                                        if (errors.lostDate) setErrors({ ...errors, lostDate: '' });
                                                        // Uncheck the checkbox if user manually selects a date
                                                        if (useTodayDate) setUseTodayDate(false);
                                                    }}
                                                    max={getTodayDate()}
                                                    size="lg"
                                                    borderRadius="md"
                                                    isDisabled={useTodayDate}
                                                    bg={useTodayDate ? 'gray.100' : 'white'}
                                                />

                                                {errors.lostDate && (
                                                    <Text color="red.500" fontSize="sm" mt={1}>
                                                        {errors.lostDate}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </FormControl>

                                        {/* Image Upload */}
                                        <FormControl>
                                            <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                                                Item Image (Optional)
                                            </FormLabel>
                                            <VStack spacing={3} align="stretch">
                                                <Input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    display="none"
                                                />

                                                {imagePreview ? (
                                                    <Box position="relative">
                                                        <ChakraImage
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            width="100%"
                                                            height="200px"
                                                            objectFit="cover"
                                                            borderRadius="md"
                                                        />
                                                        <IconButton
                                                            icon={<FiX />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="solid"
                                                            position="absolute"
                                                            top={2}
                                                            right={2}
                                                            onClick={removeImage}
                                                            aria-label="Remove image"
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Button
                                                        leftIcon={<FiCamera />}
                                                        variant="outline"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        height="120px"
                                                        borderStyle="dashed"
                                                        borderRadius="md"
                                                        size="lg"
                                                    >
                                                        Click to upload image
                                                    </Button>
                                                )}
                                                <Text color="gray.500" fontSize="sm">
                                                    Upload a clear image of the item (max 5MB). This helps with identification and matching.
                                                </Text>
                                            </VStack>
                                        </FormControl>

                                        {/* Submit Button */}
                                        <Button
                                            colorScheme="blue"
                                            size="lg"
                                            onClick={handleSubmit}
                                            isLoading={submitting}
                                            loadingText="Submitting..."
                                            w="100%"
                                            h="56px"
                                            fontSize="lg"
                                            fontWeight="semibold"
                                        >
                                            Submit Report
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* My Reports Tab */}
                        <TabPanel>
                            <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
                                <CardBody p={6}>
                                    <VStack spacing={6} align="stretch">
                                        <HStack justify="space-between" align="center">
                                            <Heading size="md" color="gray.700">
                                                My Lost & Found Reports
                                            </Heading>
                                            <Button
                                                leftIcon={<FiPlus />}
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => {
                                                    // Switch to first tab
                                                    const tabs = document.querySelectorAll('[role="tab"]');
                                                    if (tabs[0]) tabs[0].click();
                                                }}
                                            >
                                                Report New Item
                                            </Button>
                                        </HStack>

                                        {loadingReports ? (
                                            <Center py={12}>
                                                <VStack spacing={4}>
                                                    <Spinner size="xl" color="blue.500" />
                                                    <Text color="gray.500">Loading your reports...</Text>
                                                </VStack>
                                            </Center>
                                        ) : studentReports.length === 0 ? (
                                            <Center py={12}>
                                                <VStack spacing={4}>
                                                    <Icon as={FiPackage} size="48px" color="gray.300" />
                                                    <Text color="gray.500" fontSize="lg">No reports found</Text>
                                                    <Text color="gray.400" fontSize="md">
                                                        You haven't submitted any lost or found item reports yet.
                                                    </Text>
                                                    <Button
                                                        leftIcon={<FiPlus />}
                                                        colorScheme="blue"
                                                        variant="outline"
                                                        onClick={() => {
                                                            // Switch to first tab
                                                            const tabs = document.querySelectorAll('[role="tab"]');
                                                            if (tabs[0]) tabs[0].click();
                                                        }}
                                                    >
                                                        Submit Your First Report
                                                    </Button>
                                                </VStack>
                                            </Center>
                                        ) : (
                                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                                {studentReports.map((item, idx) => (
                                                    <Card
                                                        key={`report-${idx}`}
                                                        bg={bgColor}
                                                        shadow="sm"
                                                        border="1px"
                                                        borderColor={borderColor}
                                                        transition="all 0.2s"
                                                        hover={{
                                                            shadow: 'md',
                                                            transform: 'translateY(-2px)',
                                                            borderColor: getStatusColor(item.status) + '.300'
                                                        }}
                                                    >
                                                        <CardBody p={4}>
                                                            <VStack spacing={3} align="stretch">
                                                                {/* Status Badge */}
                                                                <Box position="relative">
                                                                    <Badge
                                                                        colorScheme={getStatusColor(item.status)}
                                                                        variant="solid"
                                                                        size="sm"
                                                                        px={2}
                                                                        py={1}
                                                                        borderRadius="full"
                                                                        fontSize="xs"
                                                                        fontWeight="bold"
                                                                        display="flex"
                                                                        alignItems="center"
                                                                        gap={1}
                                                                        w="fit-content"
                                                                    >
                                                                        <Icon as={getStatusIcon(item.status)} size="12px" />
                                                                        {getStatusText(item.status)}
                                                                    </Badge>
                                                                </Box>

                                                                {/* Item Image */}
                                                                <Box borderRadius="md" overflow="hidden">
                                                                    {item.itemDetails?.imageData ? (
                                                                        <ChakraImage
                                                                            src={item.itemDetails.imageData}
                                                                            alt={item.itemDetails.name}
                                                                            width="100%"
                                                                            height="120px"
                                                                            objectFit="cover"
                                                                            cursor="pointer"
                                                                            onClick={() => handleOpenImageModal(item.itemDetails.imageData, item.itemDetails.name)}
                                                                            fallback={
                                                                                <Center height="120px" bg="gray.100">
                                                                                    <Icon as={FiPackage} size="24px" color="gray.400" />
                                                                                </Center>
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Center height="120px" bg="gray.100">
                                                                            <Icon as={FiPackage} size="32px" color="gray.400" />
                                                                        </Center>
                                                                    )}
                                                                </Box>

                                                                {/* Item Name */}
                                                                <Text
                                                                    fontWeight="bold"
                                                                    fontSize="md"
                                                                    color="gray.800"
                                                                    noOfLines={1}
                                                                >
                                                                    {item.itemDetails?.name || 'Unnamed Item'}
                                                                </Text>

                                                                {/* Description */}
                                                                <Text
                                                                    color="gray.600"
                                                                    fontSize="sm"
                                                                    noOfLines={2}
                                                                >
                                                                    {item.itemDetails?.description || 'No description available'}
                                                                </Text>

                                                                {/* Location */}
                                                                <HStack spacing={2} mb={2}>
                                                                    <Icon as={getLocationIcon(item.itemDetails?.location)} color="gray.400" size="14px" />
                                                                    <Text
                                                                        color="gray.600"
                                                                        fontSize="xs"
                                                                        textTransform="capitalize"
                                                                    >
                                                                        {item.itemDetails?.location?.replace('_', ' ') || 'Unknown Location'}
                                                                    </Text>
                                                                </HStack>

                                                                {/* Date */}
                                                                <HStack spacing={2} mb={2}>
                                                                    <Icon as={FiCalendar} color="gray.400" size="14px" />
                                                                    <Text color="gray.500" fontSize="xs">
                                                                        {item.itemDetails?.lostDate ?
                                                                            new Date(item.itemDetails.lostDate).toLocaleDateString() :
                                                                            'Date unknown'
                                                                        }
                                                                    </Text>
                                                                </HStack>

                                                                {/* Matched Status */}
                                                                {item.matchedItem && (
                                                                    <Badge
                                                                        colorScheme="green"
                                                                        variant="subtle"
                                                                        size="sm"
                                                                        fontSize="xs"
                                                                    >
                                                                        Matched with another item
                                                                    </Badge>
                                                                )}

                                                                {/* Resolution Notes */}
                                                                {item.resolution?.notes && (
                                                                    <Box>
                                                                        <Text color="gray.500" fontSize="xs" fontWeight="semibold">
                                                                            Resolution Notes:
                                                                        </Text>
                                                                        <Text color="gray.600" fontSize="xs">
                                                                            {item.resolution.notes}
                                                                        </Text>
                                                                    </Box>
                                                                )}
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </SimpleGrid>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </TabPanel>
                                            </TabPanels>
                    </Tabs>
                </VStack>

                {/* Image Preview Modal */}
                <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} size="6xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Image Preview</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {selectedImage && (
                                <Box textAlign="center">
                                    <ChakraImage
                                        src={selectedImage.data}
                                        alt={selectedImage.name}
                                        maxW="100%"
                                        maxH="80vh"
                                        objectFit="contain"
                                        borderRadius="md"
                                    />
                                    <Text mt={4} color="gray.600" fontSize="lg">
                                        {selectedImage.name}
                                    </Text>
                                </Box>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" onClick={() => setIsImageModalOpen(false)}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        );
    };
