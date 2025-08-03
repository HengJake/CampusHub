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
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Text,
    Box
} from "@chakra-ui/react"

export default function ResultsEditModal({
    isOpen,
    onClose,
    selectedResult,
    editFormData,
    setEditFormData,
    handleEditSubmit,
    isEditLoading,
    getGradeColor,
    handleMarksChange
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Result</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedResult && (
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Text fontWeight="semibold" color="gray.600">Student:</Text>
                                <Text>{selectedResult?.studentId?.userId?.name || "N/A"}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="semibold" color="gray.600">Module:</Text>
                                <Text>{selectedResult?.moduleId?.moduleName || "N/A"}</Text>
                            </Box>
                            <HStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Marks (Editable)</FormLabel>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={editFormData.totalMarks || 100}
                                        value={editFormData.marks}
                                        onChange={(e) => handleMarksChange(e.target.value)}
                                        placeholder="Enter marks"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Total Marks</FormLabel>
                                    <Input
                                        type="number"
                                        value={editFormData.totalMarks}
                                        isReadOnly
                                        bg="gray.50"
                                        cursor="not-allowed"
                                    />
                                </FormControl>
                            </HStack>
                            <HStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Grade (Auto-calculated)</FormLabel>
                                    <Input
                                        value={editFormData.grade}
                                        isReadOnly
                                        bg="gray.50"
                                        cursor="not-allowed"
                                        fontWeight="bold"
                                        color={`${getGradeColor(editFormData.grade)}.600`}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>GPA (Auto-calculated)</FormLabel>
                                    <Input
                                        value={editFormData.gpa}
                                        isReadOnly
                                        bg="gray.50"
                                        cursor="not-allowed"
                                        fontWeight="bold"
                                    />
                                </FormControl>
                            </HStack>
                            <FormControl>
                                <FormLabel>Credit Hours</FormLabel>
                                <Input
                                    type="number"
                                    value={editFormData.creditHours}
                                    isReadOnly
                                    bg="gray.50"
                                    cursor="not-allowed"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Remark</FormLabel>
                                <Textarea
                                    value={editFormData.remark}
                                    onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                                    placeholder="Enter any remarks..."
                                />
                            </FormControl>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleEditSubmit}
                        isLoading={isEditLoading}
                        loadingText="Updating..."
                    >
                        Update Result
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
} 