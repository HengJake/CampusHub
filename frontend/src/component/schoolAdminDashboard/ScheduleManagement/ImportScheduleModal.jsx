import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Center,
    Spinner,
} from "@chakra-ui/react"
import React, { useRef } from "react"

export default function ImportScheduleModal({
    isOpen,
    onClose,
    onFileUpload,
    isLoading,
}) {
    const fileInputRef = useRef(null)

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Import Schedule (CSV)</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <AlertTitle fontSize="sm">CSV Format Required:</AlertTitle>
                            <AlertDescription fontSize="sm">
                                dayOfWeek, startTime, endTime, moduleStartDate, moduleEndDate, roomId, lecturerId
                            </AlertDescription>
                        </Alert>
                        <FormControl>
                            <FormLabel>Select CSV File</FormLabel>
                            <Input
                                type="file"
                                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                ref={fileInputRef}
                                onChange={onFileUpload}
                                p={1}
                                border="2px dashed"
                                borderColor="gray.300"
                                _hover={{ borderColor: "blue.400" }}
                            />
                        </FormControl>
                        {isLoading && (
                            <Center py={4}>
                                <VStack>
                                    <Spinner color="blue.500" />
                                    <Text fontSize="sm" color="gray.600">
                                        Processing CSV file...
                                    </Text>
                                </VStack>
                            </Center>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={() => fileInputRef.current?.click()}
                        isDisabled={isLoading}
                    >
                        Choose File
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
} 