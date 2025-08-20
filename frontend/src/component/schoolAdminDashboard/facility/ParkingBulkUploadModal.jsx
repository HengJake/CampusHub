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
    Text,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    HStack,
    Center,
    Spinner
} from "@chakra-ui/react"
import { useState } from "react"

export default function ParkingBulkUploadModal({ isOpen, onClose, onConfirm, parkingLots = [], isLoading }) {
    const toast = useToast()

    const handleConfirm = () => {
        if (parkingLots.length === 0) {
            toast({
                title: "No Data",
                description: "No parking lots to create",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        onConfirm(parkingLots)
        onClose()
    }

    const handleClose = () => {
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Preview Generated Parking Lots</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Review Generated Parking Lots:</AlertTitle>
                                <AlertDescription fontSize="sm">
                                    Please review the parking lots that will be created. You can proceed to create them or go back to modify the configuration.
                                </AlertDescription>
                            </Box>
                        </Alert>

                        {parkingLots.length > 0 && (
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={3}>
                                    Generated Parking Lots ({parkingLots.length} slots):
                                </Text>
                                <TableContainer maxH="300px" overflowY="auto">
                                    <Table size="sm" variant="striped">
                                        <Thead>
                                            <Tr>
                                                <Th>Zone</Th>
                                                <Th>Slot Number</Th>
                                                <Th>Status</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {parkingLots.map((lot, index) => (
                                                <Tr key={index}>
                                                    <Td>{lot.zone}</Td>
                                                    <Td>{lot.slotNumber}</Td>
                                                    <Td>
                                                        <Badge colorScheme={lot.active ? "green" : "red"}>
                                                            {lot.active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {isLoading && (
                            <Center py={4}>
                                <VStack>
                                    <Spinner color="blue.500" />
                                    <Text fontSize="sm" color="gray.600">
                                        Creating parking lots...
                                    </Text>
                                </VStack>
                            </Center>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={handleConfirm}
                        isDisabled={isLoading || parkingLots.length === 0}
                    >
                        Create Parking Lots
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
