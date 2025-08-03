import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button
} from "@chakra-ui/react"
import { useRef } from "react"

export default function ResultsDeleteDialog({
    isOpen,
    onClose,
    handleDeleteConfirm,
    isDeleteLoading
}) {
    const cancelRef = useRef()

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete Result
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        Are you sure you want to delete this result? This action cannot be undone.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDeleteConfirm}
                            ml={3}
                            isLoading={isDeleteLoading}
                            loadingText="Deleting..."
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
} 