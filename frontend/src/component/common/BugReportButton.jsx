import React, { useState } from 'react';
import { Button, Box } from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import BugReportModal from './BugReportModal.jsx';

const BugReportButton = ({ buttonText = "Report Bug", buttonClass = "", currentPath = "", onSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = (data) => {
        onSuccess && onSuccess(data);
        // You can add a toast notification here
        console.log('Bug report submitted successfully:', data);
    };

    return (
        <>
            <Button
                onClick={handleOpenModal}
                className={buttonClass}
                colorScheme="red"
                variant="solid"
                size="md"
                leftIcon={<FiAlertTriangle />}
                borderRadius="full"
                boxShadow="lg"
                _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                }}
                transition="all 0.2s"
            >
                {buttonText}
            </Button>

            <BugReportModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                currentPath={currentPath}
            />
        </>
    );
};

export default BugReportButton;
