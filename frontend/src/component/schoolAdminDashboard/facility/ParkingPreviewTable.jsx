import {
    Card,
    CardBody,
    HStack,
    VStack,
    Text,
    Badge,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useColorModeValue,
    Input,
    InputGroup,
    InputLeftElement,
    ButtonGroup,
    IconButton,
    Accordion,
    AccordionButton,
    AccordionItem,
    AccordionIcon,
    AccordionPanel,
    Box
} from "@chakra-ui/react"
import { FiRefreshCw, FiTrash2 } from "react-icons/fi"
import { SearchIcon, EditIcon } from "@chakra-ui/icons"

export default function ParkingPreviewTable({
    previewParkingLots,
    setPreviewParkingLots,
    searchTerm,
    setSearchTerm,
    handleEditClick,
    handleDeleteClick,
    isMobile
}) {
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    // Filter parking lots based on search
    const filteredParkingLots = previewParkingLots.filter(lot => {
        if (!searchTerm) return true;
        return (
            lot.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lot.slotNumber?.toString().includes(searchTerm)
        );
    });

    const handleClearAll = () => {
        setPreviewParkingLots([]);
    };

    return (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
                <HStack justify={"space-between"} mb={4}>
                    <VStack align={"start"} flex={1}>
                        {previewParkingLots.length > 0 && (
                            <Text>Total Parking Lots: {previewParkingLots.length}</Text>
                        )}
                    </VStack>
                    <HStack>
                        {previewParkingLots.length > 0 && (
                            <Button
                                colorScheme="red"
                                onClick={handleClearAll}
                                size="sm"
                            >
                                Clear All
                            </Button>
                        )}
                    </HStack>
                </HStack>

                {/* Search Controls */}
                {previewParkingLots.length > 0 && (
                    <HStack spacing={4} justify={"space-between"} align={"center"} mb={4}>
                        <InputGroup maxW="300px">
                            <InputLeftElement>
                                <SearchIcon />
                            </InputLeftElement>
                            <Input
                                type="text"
                                placeholder="Search by zone or slot number"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </HStack>
                )}

                {previewParkingLots.length === 0 && (
                    <VStack spacing={1} align="start">
                        <Text color="gray.500" fontSize="sm">
                            No parking lots to preview. Generate a template or upload data to get started.
                        </Text>
                    </VStack>
                )}

                {filteredParkingLots.length > 0 && (
                    <>
                        {/* Desktop Table View */}
                        <TableContainer maxH="400px" overflowY="auto" mt={5} shadow={"lg"} display={{ base: "none", lg: "block" }}>
                            <Table size="sm" variant="striped">
                                <Thead>
                                    <Tr>
                                        <Th>Zone</Th>
                                        <Th>Slot Number</Th>
                                        <Th>Status</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredParkingLots.map((lot, index) => (
                                        <Tr key={index}>
                                            <Td>{lot.zone || "N/A"}</Td>
                                            <Td>{lot.slotNumber || "N/A"}</Td>
                                            <Td>
                                                <Badge colorScheme={lot.active ? "green" : "red"}>
                                                    {lot.active ? "Active" : "Inactive"}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <ButtonGroup size="sm" spacing={2}>
                                                    <IconButton
                                                        aria-label="Edit parking lot"
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        onClick={() => handleEditClick(lot, index)}
                                                    />
                                                    <IconButton
                                                        aria-label="Delete parking lot"
                                                        icon={<FiTrash2 />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteClick(index)}
                                                    />
                                                </ButtonGroup>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>

                        {/* Mobile Accordion View */}
                        <Box display={{ base: "block", lg: "none" }} mt={5}>
                            <Accordion allowMultiple>
                                {filteredParkingLots.map((lot, index) => (
                                    <AccordionItem key={index}>
                                        <h2>
                                            <AccordionButton>
                                                <Box as="span" flex="1" textAlign="left">
                                                    <Text fontWeight="medium">
                                                        {lot.zone || "N/A"}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Slot {lot.slotNumber || "N/A"}
                                                    </Text>
                                                </Box>
                                                <AccordionIcon />
                                            </AccordionButton>
                                        </h2>
                                        <AccordionPanel pb={4}>
                                            <VStack spacing={3} align="stretch">
                                                <Box>
                                                    <Text fontWeight="semibold">Zone:</Text>
                                                    <Text>{lot.zone || "N/A"}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Slot Number:</Text>
                                                    <Text>{lot.slotNumber || "N/A"}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold">Status:</Text>
                                                    <Badge colorScheme={lot.active ? "green" : "red"}>
                                                        {lot.active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="semibold" mb={2}>Actions:</Text>
                                                    <ButtonGroup size="sm" spacing={2}>
                                                        <Button
                                                            leftIcon={<EditIcon />}
                                                            size="sm"
                                                            colorScheme="blue"
                                                            onClick={() => handleEditClick(lot, index)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            leftIcon={<FiTrash2 />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            onClick={() => handleDeleteClick(index)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </ButtonGroup>
                                                </Box>
                                            </VStack>
                                        </AccordionPanel>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Box>
                    </>
                )}
            </CardBody>
        </Card>
    )
}
