import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    VStack,
    HStack,
    Icon,
    useToast
} from '@chakra-ui/react';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemToDelete,
    modalType,
    isDeleting = false
}) => {
    const toast = useToast();

    const getModalTitle = () => {
        if (!modalType) return 'Delete Item';

        const type = modalType === 'busSchedule' ? 'Bus Schedule' :
            modalType === 'vehicle' ? 'Vehicle' :
                modalType === 'stop' ? 'Stop' :
                    modalType === 'route' ? 'Route' : 'Item';

        return `Delete ${type}`;
    };

    const getItemName = () => {
        if (!itemToDelete) return 'this item';

        switch (modalType) {
            case 'busSchedule':
                return `bus schedule for ${itemToDelete.routeTiming?.[0]?.routeId?.name || 'this route'}`;
            case 'vehicle':
                return `vehicle ${itemToDelete.plateNumber || 'with this plate number'}`;
            case 'stop':
                return `stop "${itemToDelete.name}"`;
            case 'route':
                return `route "${itemToDelete.name}"`;
            default:
                return 'this item';
        }
    };

    const getDescription = () => {
        const itemName = getItemName();
        return `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
    };

    const handleConfirm = async () => {
        try {
            await onConfirm();
            toast({
                title: 'Deleted Successfully',
                description: 'The item has been permanently deleted.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete the item. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={3}>
                        <Icon as={FaExclamationTriangle} color="red.500" />
                        <Text>{getModalTitle()}</Text>
                    </HStack>
                </ModalHeader>

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text color="gray.600">
                            {getDescription()}
                        </Text>

                        {itemToDelete && (
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                This will permanently remove all associated data and cannot be recovered.
                            </Text>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            isDisabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            leftIcon={<FaTrash />}
                            onClick={handleConfirm}
                            isLoading={isDeleting}
                            loadingText="Deleting..."
                        >
                            Delete
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DeleteConfirmationModal;
