import React from 'react'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    Button,
    Spinner,
} from '@chakra-ui/react'

function ComfirmationMessage({ title, description, isOpen, onClose, onConfirm, isLoading = false }) {
    const cancelRef = React.useRef();

    return (
        <AlertDialog
            motionPreset='slideInBottom'
            leastDestructiveRef={cancelRef}
            onClose={isLoading ? undefined : onClose}
            isOpen={isOpen}
            isCentered
            closeOnOverlayClick={!isLoading}
            closeOnEsc={!isLoading}
        >
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>{title}</AlertDialogHeader>
                <AlertDialogCloseButton isDisabled={isLoading} />
                <AlertDialogBody>
                    {description}
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
                        No
                    </Button>
                    <Button
                        colorScheme='red'
                        ml={3}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        loadingText="Processing..."
                        leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
                    >
                        Confirm
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ComfirmationMessage