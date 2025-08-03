import {
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    FormControl,
    FormLabel,
    Input,
    Center,
    Spinner,
    Text,
    useToast
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import * as XLSX from "xlsx"

export default function ResultsUploadModal({ isOpen, onClose, onFileUpload, isLoading }) {
    const fileInputRef = useRef(null)
    const toast = useToast()

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                onFileUpload(parsedData);
                toast({
                    title: "File Uploaded",
                    description: `${parsedData.length} rows extracted`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error reading file:", error);
                toast({
                    title: "Upload Error",
                    description: "Invalid Excel format",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                onClose();
            }
        };

        reader.onerror = () => {
            toast({
                title: "Read Error",
                description: "Failed to read file",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Import Student Results (CSV)</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Excel Template Format:</AlertTitle>
                                <AlertDescription fontSize="sm">
                                    Student ID, Student Name, Marks, Grade (Auto), GPA (Auto), Credit Hour (Auto), Remark
                                </AlertDescription>
                            </Box>
                        </Alert>
                        <FormControl>
                            <FormLabel>Select CSV File</FormLabel>
                            <Input
                                type="file"
                                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
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
                    <Button colorScheme="blue" onClick={() => fileInputRef.current?.click()} isDisabled={isLoading}>
                        Choose File
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
} 