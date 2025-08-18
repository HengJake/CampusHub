import React, { useState, useEffect } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    Box,
    Text,
    Image,
    IconButton
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { stopTypes } from './utils';

const StopForm = ({ onSubmit, selectedItem, isEditMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'campus',
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (selectedItem && isEditMode) {
            setFormData({
                name: selectedItem.name || '',
                type: selectedItem.type || 'campus',
                image: selectedItem.image || ''
            });
            if (selectedItem.image) {
                setPreviewUrl(selectedItem.image);
            }
        }
    }, [selectedItem, isEditMode]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
            setFileError('Please select a PNG or JPEG image file.');
            setSelectedFile(null);
            setPreviewUrl('');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setFileError('File size must be less than 5MB.');
            setSelectedFile(null);
            setPreviewUrl('');
            return;
        }

        setFileError('');
        setSelectedFile(file);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setFileError('');
        if (selectedFile) {
            URL.revokeObjectURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let finalImageData = formData.image;

            // If a new file is selected, convert it to base64
            if (selectedFile) {
                const base64String = await convertFileToBase64(selectedFile);
                finalImageData = base64String;
            }

            // Submit the form data with base64 image
            const submitData = {
                name: formData.name,
                type: formData.type,
                image: finalImageData
            };

            onSubmit(submitData);
        } catch (error) {
            console.error('Error converting image to base64:', error);
            setFileError('Error processing image. Please try again.');
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Stop Name</FormLabel>
                    <Input
                        placeholder="Enter stop name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Type</FormLabel>
                    <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        {stopTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel>Image</FormLabel>
                    <VStack spacing={3} align="stretch">
                        {!previewUrl ? (
                            <Box
                                border="2px dashed"
                                borderColor="gray.300"
                                borderRadius="md"
                                p={6}
                                textAlign="center"
                                cursor="pointer"
                                _hover={{ borderColor: "blue.400" }}
                                onClick={() => document.getElementById('image-upload').click()}
                            >
                                <AddIcon boxSize={6} color="gray.400" mb={2} />
                                <Text color="gray.600">
                                    Click to upload image (PNG, JPEG up to 5MB)
                                </Text>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept=".png,.jpeg,.jpg"
                                    onChange={handleFileSelect}
                                    display="none"
                                />
                            </Box>
                        ) : (
                            <Box position="relative">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    borderRadius="md"
                                    maxH="200px"
                                    objectFit="cover"
                                    w="100%"
                                />
                                <IconButton
                                    icon={<CloseIcon />}
                                    aria-label="Remove image"
                                    size="sm"
                                    colorScheme="red"
                                    variant="solid"
                                    position="absolute"
                                    top={2}
                                    right={2}
                                    onClick={removeImage}
                                />
                            </Box>
                        )}

                        {fileError && (
                            <Text color="red.500" fontSize="sm">
                                {fileError}
                            </Text>
                        )}
                    </VStack>
                </FormControl>

                <Button type="submit" colorScheme="blue" w="100%" mb={3}>
                    {isEditMode ? 'Update Stop' : 'Create Stop'}
                </Button>
            </VStack>
        </form>
    );
};

export default StopForm;
