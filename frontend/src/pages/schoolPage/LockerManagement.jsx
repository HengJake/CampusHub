import {
    Box,
    Button,
    Card,
    CardBody,
    Grid,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Select,
    Input,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useColorModeValue,
    Tooltip,
    InputLeftElement,
    InputGroup,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiLock, FiUnlock, FiTool } from "react-icons/fi"
import { useState, useEffect } from "react"
import { useFacilityStore } from "../../store/facility.js";
import { useDisclosure } from "@chakra-ui/react";

export function LockerManagement() {
    const {
        fetchLockerUnits,
        lockerUnits,
        createLockerUnit,
        updateLockerUnit,
        deleteLockerUnit,
    } = useFacilityStore();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        resourceId: "",
        schoolId: "",
        isAvailable: true,
    });

    useEffect(() => {
        fetchLockerUnits();
    }, [fetchLockerUnits]);
    console.log("🚀 ~ LockerManagement ~ lockerUnits:", lockerUnits)


    const [selectedFloor, setSelectedFloor] = useState("All")
    const [selectedSection, setSelectedSection] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    const filteredLockers = lockerUnits.filter((locker) => {
        const matchesFloor =
            selectedFloor === "All" ||
            (locker.floor !== undefined && locker.floor !== null && locker.floor.toString() === selectedFloor);

        const matchesSection =
            selectedSection === "All" ||
            (typeof locker.section === "string" && locker.section === selectedSection);

        const numberStr = typeof locker.number === "string" ? locker.number : String(locker.number ?? "");
        const assignedToStr = typeof locker.assignedTo === "string" ? locker.assignedTo : String(locker.assignedTo ?? "");

        const matchesSearch =
            locker.resourceId.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFloor && matchesSection && matchesSearch;
    })

    const occupiedCount = lockerUnits.filter((l) => l.status === "Occupied").length
    const availableCount = lockerUnits.filter((l) => l.status === "Available").length
    const occupancyRate = Math.round((occupiedCount / lockerUnits.length) * 100)

    const getLockerColor = (status) => {
        switch (status) {
            case "Available":
                return "#48BB78"
            case "Occupied":
                return "#344E41"
            case "Maintenance":
                return "#ED8936"
            default:
                return "#A4C3A2"
        }
    }

    const LockerCard = ({ locker }) => (
        <Tooltip label={`${locker.number} - ${locker.status}${locker.assignedTo ? ` (${locker.assignedTo})` : ""}`}>
            <Card
                bg={getLockerColor(locker.status)}
                color="white"
                cursor="pointer"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
                size="sm"
            >
                <CardBody p={2} textAlign="center">
                    <Text fontSize="xs" fontWeight="bold">
                        {locker.resourceId.name}
                    </Text>
                    {locker.status === "Occupied" ? <FiLock /> : <FiUnlock />}
                </CardBody>
            </Card>
        </Tooltip>
    )

    // Handle form submit for creating/updating locker units
    const handleSubmit = async () => {
        if (isEdit) {
            await updateLockerUnit(formData._id, formData);
        } else {
            await createLockerUnit(formData);
        }
        fetchLockerUnits();
        resetForm();
    };

    // Reset form data
    const resetForm = () => {
        setFormData({
            resourceId: "",
            schoolId: "",
            isAvailable: true,
        });
        setIsEdit(false);
    };

    // Handle edit for a specific locker
    const handleEdit = (locker) => {
        setFormData({ ...locker });
        setIsEdit(true);
    };

    const handleDelete = async (lockerId) => {
        await deleteLockerUnit(lockerId);
        fetchLockerUnits();
    };

    // Handle bulk actions
    const handleBulkAssignment = (action) => {
        // Logic for bulk actions like assigning, releasing, marking for maintenance
    };

    return (
        <Box minH="100vh" flex={1}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="#333333">
                            Locker Management
                        </Text>
                        <Text color="gray.600">Manage locker assignments and availability</Text>
                    </Box>
                    <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a332a" }} onClick={onOpen}>
                        Bulk Assignment
                    </Button>
                </HStack>

                {/* Stats Cards */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Total Lockers</StatLabel>
                                <StatNumber color="#344E41">{lockerUnits.length}</StatNumber>
                                <StatHelpText>Campus wide</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Occupied</StatLabel>
                                <StatNumber color="#A4C3A2">{occupiedCount}</StatNumber>
                                <StatHelpText>{occupancyRate}% occupancy</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Available</StatLabel>
                                <StatNumber color="#48BB78">{availableCount}</StatNumber>
                                <StatHelpText>Ready for assignment</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Maintenance</StatLabel>
                                <StatNumber color="#ED8936">{lockerUnits.filter((l) => l.status === "Maintenance").length}</StatNumber>
                                <StatHelpText>Need attention</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Filters */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4}>
                            <Box flex="1">
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search by locker number or student name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Box>
                            <Select w="150px" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                                <option value="All">All Floors</option>
                                <option value="1">Floor 1</option>
                                <option value="2">Floor 2</option>
                                <option value="3">Floor 3</option>
                                <option value="4">Floor 4</option>
                            </Select>
                            <Select w="150px" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                <option value="All">All Sections</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                                <option value="D">Section D</option>
                                <option value="E">Section E</option>
                            </Select>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Legend */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack spacing={6}>
                            <HStack>
                                <Box w={4} h={4} bg="#48BB78" borderRadius="sm" />
                                <Text fontSize="sm">Available</Text>
                            </HStack>
                            <HStack>
                                <Box w={4} h={4} bg="#344E41" borderRadius="sm" />
                                <Text fontSize="sm">Occupied</Text>
                            </HStack>
                            <HStack>
                                <Box w={4} h={4} bg="#ED8936" borderRadius="sm" />
                                <Text fontSize="sm">Maintenance</Text>
                            </HStack>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Locker Grid */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                            Locker Layout ({filteredLockers.length} lockers)
                        </Text>
                        <SimpleGrid columns={{ base: 8, md: 12, lg: 16 }} spacing={2}>
                            {filteredLockers.map((locker) => (
                                <LockerCard key={locker.id} locker={locker} />
                            ))}
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Quick Actions */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                            Quick Actions
                        </Text>
                        <HStack spacing={4}>
                            <Button leftIcon={<FiLock />} colorScheme="green" variant="outline">
                                Assign Selected
                            </Button>
                            <Button leftIcon={<FiUnlock />} colorScheme="blue" variant="outline">
                                Release Selected
                            </Button>
                            <Button leftIcon={<FiTool />} colorScheme="orange" variant="outline">
                                Mark for Maintenance
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>
            </VStack>


            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>hello</Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme='green' onClick={handleBulkAssignment}>Add</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
