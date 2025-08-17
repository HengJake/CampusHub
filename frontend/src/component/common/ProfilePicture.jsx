import React, { useRef, useState } from 'react';
import { Avatar, VStack, Button, Input, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Text, HStack } from '@chakra-ui/react';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';

const ProfilePicture = ({
    src,
    name,
    size = "xl",
    showChangeButton = true,
    onPhotoChange,
    bgColor = "#344E41",
    editable = true
}) => {
    const fileInputRef = useRef(null);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please select an image file (JPEG, PNG, GIF)",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select an image smaller than 5MB",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Show preview modal
        onOpen();
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files[0]) return;

        const file = fileInputRef.current.files[0];
        setIsUploading(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('profilePicture', file);

            // Call the onPhotoChange callback with the file
            if (onPhotoChange) {
                await onPhotoChange(file, formData);
            }

            toast({
                title: "Profile picture updated",
                description: "Your profile picture has been updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            toast({
                title: "Upload failed",
                description: "Failed to update profile picture. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        try {
            if (onPhotoChange) {
                await onPhotoChange(null, null);
            }

            toast({
                title: "Profile picture removed",
                description: "Your profile picture has been removed",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
        } catch (error) {
            console.error('Error removing profile picture:', error);
            toast({
                title: "Remove failed",
                description: "Failed to remove profile picture. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <VStack spacing={4}>
                {src ? (
                    <Avatar
                        size={size}
                        src={src}
                        name={name}
                        cursor={editable ? "pointer" : "default"}
                        onClick={editable ? onOpen : undefined}
                        onError={(e) => {
                            console.log('Image failed to load:', src);
                            // Fallback to initials if image fails to load
                            e.target.style.display = 'none';
                        }}
                        fallback={name}
                        ignoreFallback={false}
                    />
                ) : (
                    <Avatar
                        size={size}
                        name={name}
                        bg={bgColor}
                        color="white"
                        cursor={editable ? "pointer" : "default"}
                        onClick={editable ? onOpen : undefined}
                    />
                )}

                {showChangeButton && editable && (
                    <Button
                        leftIcon={<FiCamera />}
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Change Photo
                    </Button>
                )}

                {/* Hidden file input */}
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    display="none"
                />
            </VStack>

            {/* Preview and Upload Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Profile Picture</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">
                                Preview your new profile picture
                            </Text>

                            {fileInputRef.current?.files[0] && (
                                <VStack spacing={3}>
                                    <Avatar
                                        size="2xl"
                                        src={URL.createObjectURL(fileInputRef.current.files[0])}
                                        name={name}
                                    />
                                    <Text fontSize="sm" color="gray.500">
                                        {fileInputRef.current?.files[0].name}
                                    </Text>
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack spacing={3}>
                            {src && (
                                <Button
                                    leftIcon={<FiX />}
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={handleRemovePhoto}
                                    isLoading={isUploading}
                                >
                                    Remove Current
                                </Button>
                            )}
                            <Button
                                leftIcon={<FiUpload />}
                                colorScheme="blue"
                                onClick={handleUpload}
                                isLoading={isUploading}
                                loadingText="Uploading..."
                            >
                                Upload
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfilePicture;
