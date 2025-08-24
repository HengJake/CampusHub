import {
    Box,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Badge,
    Icon,
    useColorModeValue,
    Button,
    SimpleGrid,
    Container,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    IconButton
} from "@chakra-ui/react"
import {
    FiMapPin,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiInfo,
    FiClock,
    FiNavigation,
} from "react-icons/fi"
import {
    FaParking,
    FaCar,
    FaMapMarkedAlt,
} from "react-icons/fa"
import { useState, useEffect } from "react"
import { useFacilityStore } from "../../store/facility.js"

export default function Parking() {
    const [selectedZone, setSelectedZone] = useState("") // Empty string means "All Zones"
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [isAutoRefresh, setIsAutoRefresh] = useState(true)
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const { isOpen: isSlotDetailsOpen, onOpen: onSlotDetailsOpen, onClose: onSlotDetailsClose } = useDisclosure()

    const toast = useToast()
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const cardBg = useColorModeValue("white", "gray.700")

    // Get parking data from facility store
    const {
        parkingLots,
        loading,
        errors,
        fetchParkingLotsBySchoolId
    } = useFacilityStore()

    // Transform parking lots data into zone-based structure
    const transformParkingData = (parkingLots) => {
        if (!parkingLots || parkingLots.length === 0) return {}

        // Group parking lots by zone
        const zones = {}
        parkingLots.forEach(lot => {
            const zone = lot.zone || "Unknown Zone"
            if (!zones[zone]) {
                zones[zone] = {
                    name: zone,
                    description: `Parking area in ${zone}`,
                    totalSlots: 0,
                    availableSlots: 0,
                    slots: []
                }
            }

            // Create slot object
            const slot = {
                id: lot._id,
                slotNumber: lot.slotNumber,
                zone: zone,
                active: lot.active || false,
                lastUpdated: lot.updatedAt ? new Date(lot.updatedAt) : new Date(),
                status: lot.status || "available"
            }

            zones[zone].slots.push(slot)
            zones[zone].totalSlots++
            if (lot.active) {
                zones[zone].availableSlots++
            }
        })

        return zones
    }

    const parkingData = transformParkingData(parkingLots)
    const availableZones = Object.keys(parkingData)

    // Get all slots from all zones
    const getAllSlots = () => {
        const allSlots = []
        Object.values(parkingData).forEach(zone => {
            allSlots.push(...zone.slots)
        })
        return allSlots
    }

    // Fetch parking data on component mount
    useEffect(() => {
        fetchParkingLotsBySchoolId()
    }, [])

    // Real-time simulation effect (only if auto-refresh is enabled)
    useEffect(() => {
        if (!isAutoRefresh) return

        const interval = setInterval(() => {
            fetchParkingLotsBySchoolId()
            setLastRefresh(new Date())
        }, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [isAutoRefresh, fetchParkingLotsBySchoolId])

    const getZoneStats = () => {
        const total = Object.values(parkingData).reduce((acc, zone) => acc + zone.totalSlots, 0)
        const available = Object.values(parkingData).reduce((acc, zone) => acc + zone.availableSlots, 0)
        const occupied = total - available
        return { total, available, occupied }
    }

    // Filter slots based on selected zone and search term
    const getFilteredSlots = () => {
        let slots = selectedZone ? parkingData[selectedZone]?.slots || [] : getAllSlots()

        if (searchTerm) {
            slots = slots.filter(slot =>
                slot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                slot.slotNumber.toString().includes(searchTerm) ||
                slot.zone.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return slots
    }

    const filteredSlots = getFilteredSlots()

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot)
        onSlotDetailsOpen()
    }

    const handleRefresh = async () => {
        try {
            await fetchParkingLotsBySchoolId()
            setLastRefresh(new Date())
            toast({
                title: "Parking data refreshed",
                status: "success",
                duration: 2000,
                isClosable: true,
            })
        } catch (error) {
            toast({
                title: "Failed to refresh parking data",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const stats = getZoneStats()

    // Show loading state
    if (loading.parkingLots) {
        return (
            <Container maxW="7xl" py={6}>
                <VStack spacing={6} align="center" py={20}>
                    <Spinner size="xl" color="blue.500" />
                    <Text fontSize="lg" color="gray.600">Loading parking data...</Text>
                </VStack>
            </Container>
        )
    }

    // Show error state
    if (errors.parkingLots) {
        return (
            <Container maxW="7xl" py={6}>
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                        <AlertTitle>Error loading parking data</AlertTitle>
                        <AlertDescription>{errors.parkingLots}</AlertDescription>
                    </Box>
                    <Button colorScheme="blue" onClick={handleRefresh}>
                        Retry
                    </Button>
                </Alert>
            </Container>
        )
    }

    // Show no data state
    if (availableZones.length === 0) {
        return (
            <Container maxW="7xl" py={6}>
                <VStack spacing={6} align="center" py={20}>
                    <Icon as={FaParking} boxSize={16} color="gray.400" />
                    <Text fontSize="xl" fontWeight="medium" color="gray.500">
                        No parking zones available
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                        Parking zones will appear here once they are configured by administrators.
                    </Text>
                    <Button colorScheme="blue" onClick={handleRefresh}>
                        Refresh
                    </Button>
                </VStack>
            </Container>
        )
    }

    return (
        <Container maxW="7xl" px={0}>
            <VStack spacing={6} align="stretch">
                {/* Header Section */}
                <Box>
                    <VStack align="start" spacing={2} mb={6}>
                        <HStack>
                            <Icon as={FaParking} boxSize={8} color="blue.500" />
                            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                Parking Lot Availability
                            </Text>
                        </HStack>
                        <Text color="gray.600" fontSize="lg">
                            Check real-time availability of parking slots across different zones.
                        </Text>
                        <HStack spacing={4} fontSize="sm" color="gray.500">
                            <HStack>
                                <Icon as={FiClock} />
                                <Text>Last updated: {lastRefresh.toLocaleTimeString()}</Text>
                            </HStack>
                            <HStack>
                                <IconButton
                                    bg={"transparent"}
                                    onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                                    aria-label="Toggle auto-refresh"
                                >
                                    <Icon as={FiRefreshCw} />
                                </IconButton>
                                <Text>Auto-refresh: {isAutoRefresh ? "On" : "Off"}</Text>
                            </HStack>
                        </HStack>
                    </VStack>

                    {/* Overall Stats */}
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Total Slots</StatLabel>
                                    <StatNumber color="blue.500">{stats.total}</StatNumber>
                                    <StatHelpText>
                                        <Icon as={FaParking} mr={1} />
                                        Campus-wide
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Available Now</StatLabel>
                                    <StatNumber color="green.500">{stats.available}</StatNumber>
                                    <StatHelpText>
                                        <Icon as={FaCar} mr={1} />
                                        Ready to use
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Currently Occupied</StatLabel>
                                    <StatNumber color="orange.500">{stats.occupied}</StatNumber>
                                    <StatHelpText>
                                        <Icon as={FaCar} mr={1} />
                                        In use
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>

                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Occupancy Rate</StatLabel>
                                    <StatNumber color="purple.500">
                                        {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
                                    </StatNumber>
                                    <StatHelpText>
                                        <Icon as={FiMapPin} mr={1} />
                                        Campus average
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>
                </Box>

                {/* Controls */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" mb={6}>
                    <CardBody>
                        <HStack spacing={4} wrap="wrap" justify="space-between">
                            <HStack spacing={4}>
                                <HStack>
                                    <Icon as={FiFilter} color="gray.500" />
                                    <Text fontSize="sm" fontWeight="medium">Zone:</Text>
                                </HStack>
                                <Select
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(e.target.value)}
                                    maxW="200px"
                                    size="sm"
                                    placeholder="All Zones"
                                >
                                    {availableZones.map(zone => (
                                        <option key={zone} value={zone}>
                                            {parkingData[zone]?.name || zone}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>

                            <HStack spacing={4}>
                                <InputGroup maxW="250px" size="sm">
                                    <InputLeftElement>
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search by slot number, zone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<FiRefreshCw />}
                                    onClick={handleRefresh}
                                    isLoading={loading.parkingLots}
                                >
                                    Refresh
                                </Button>
                            </HStack>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Zone Information - Only show when a specific zone is selected */}
                {selectedZone && parkingData[selectedZone] && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" mb={6}>
                        <CardBody>
                            <VStack align="start" spacing={3}>
                                <HStack>
                                    <Icon as={FiMapPin} color="blue.500" />
                                    <Text fontSize="xl" fontWeight="bold">
                                        {parkingData[selectedZone].name}
                                    </Text>
                                </HStack>
                                <Text color="gray.600">
                                    {parkingData[selectedZone].description}
                                </Text>
                                <HStack spacing={6} fontSize="sm">
                                    <HStack>
                                        <Text fontWeight="medium">Total Slots:</Text>
                                        <Badge colorScheme="blue" variant="subtle">
                                            {parkingData[selectedZone].totalSlots}
                                        </Badge>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="medium">Available:</Text>
                                        <Badge colorScheme="green" variant="subtle">
                                            {parkingData[selectedZone].availableSlots}
                                        </Badge>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="medium">Occupied:</Text>
                                        <Badge colorScheme="orange" variant="subtle">
                                            {parkingData[selectedZone].totalSlots - parkingData[selectedZone].availableSlots}
                                        </Badge>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                )}

                {/* Parking Slots Grid */}
                <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                        {selectedZone ? `Available Slots in ${selectedZone}` : 'All Available Parking Slots'}
                    </Text>

                    {selectedZone ? (
                        // Show slots for specific zone
                        <SimpleGrid
                            columns={{ base: 2, lg: 6 }}
                            spacing={{ base: 1, lg: 3 }}
                            mb={6}
                        >
                            {filteredSlots.map((slot) => (
                                <Card
                                    key={slot.id}
                                    bg={slot.active ? "green.50" : "gray.100"}
                                    borderColor={slot.active ? "green.200" : "gray.300"}
                                    borderWidth="2px"
                                    _hover={{
                                        shadow: "lg",
                                        transform: "translateY(-2px)",
                                        cursor: "pointer"
                                    }}
                                    transition="all 0.2s"
                                    onClick={() => handleSlotClick(slot)}
                                >
                                    <CardBody p={3} textAlign="center">
                                        <VStack spacing={2}>
                                            <Text
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color={slot.active ? "green.700" : "gray.500"}
                                            >
                                                {slot.slotNumber}
                                            </Text>

                                            <Badge
                                                colorScheme={slot.active ? "green" : "red"}
                                                variant="solid"
                                                size="sm"
                                                borderRadius="full"
                                                px={2}
                                            >
                                                {slot.active ? "🟢 Available" : "🔴 Occupied"}
                                            </Badge>

                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                fontWeight="medium"
                                            >
                                                Zone {slot.zone}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    ) : (
                        // Show all zones separated into segments
                        <VStack spacing={6} align="stretch">
                            {availableZones.map((zone) => {
                                const zoneSlots = parkingData[zone]?.slots || []
                                const filteredZoneSlots = searchTerm
                                    ? zoneSlots.filter(slot =>
                                        slot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        slot.slotNumber.toString().includes(searchTerm) ||
                                        slot.zone.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    : zoneSlots

                                if (filteredZoneSlots.length === 0) return null

                                return (
                                    <Card key={zone} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                                        <CardBody p={{ base: 2, lg: 5 }}>
                                            <VStack align="start" spacing={4}>
                                                {/* Zone Header */}
                                                <HStack justify="space-between" w="100%">
                                                    <HStack>
                                                        <Icon as={FiMapPin} color="blue.500" />
                                                        <Text fontSize="lg" fontWeight="bold">
                                                            {parkingData[zone]?.name || zone}
                                                        </Text>
                                                    </HStack>
                                                    <HStack spacing={4} fontSize="sm">
                                                        <HStack>
                                                            <Text fontWeight="medium">Total:</Text>
                                                            <Badge colorScheme="blue" variant="subtle">
                                                                {parkingData[zone]?.totalSlots || 0}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack>
                                                            <Text fontWeight="medium">Available:</Text>
                                                            <Badge colorScheme="green" variant="subtle">
                                                                {parkingData[zone]?.availableSlots || 0}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack>
                                                            <Text fontWeight="medium">Occupied:</Text>
                                                            <Badge colorScheme="orange" variant="subtle">
                                                                {(parkingData[zone]?.totalSlots || 0) - (parkingData[zone]?.availableSlots || 0)}
                                                            </Badge>
                                                        </HStack>
                                                    </HStack>
                                                </HStack>

                                                {/* Zone Description */}
                                                <Text color="gray.600" fontSize="sm">
                                                    {parkingData[zone]?.description || `Parking area in ${zone}`}
                                                </Text>

                                                {/* Slots Grid for this Zone */}
                                                <SimpleGrid
                                                    columns={{ base: 2, lg: 9 }}
                                                    spacing={{ base: 1, lg: 3 }}
                                                    w="100%"
                                                >
                                                    {filteredZoneSlots.map((slot) => (
                                                        <Card
                                                            key={slot.id}
                                                            bg={slot.active ? "green.50" : "gray.100"}
                                                            borderColor={slot.active ? "green.200" : "gray.300"}
                                                            borderWidth="2px"
                                                            _hover={{
                                                                shadow: "lg",
                                                                transform: "translateY(-2px)",
                                                                cursor: "pointer"
                                                            }}
                                                            transition="all 0.2s"
                                                            onClick={() => handleSlotClick(slot)}
                                                        >
                                                            <CardBody p={3} textAlign="center">
                                                                <VStack spacing={2}>
                                                                    <Text
                                                                        fontSize="xl"
                                                                        fontWeight="bold"
                                                                        color={slot.active ? "green.700" : "gray.500"}
                                                                    >
                                                                        {slot.slotNumber}
                                                                    </Text>

                                                                    <Badge
                                                                        colorScheme={slot.active ? "green" : "red"}
                                                                        variant="solid"
                                                                        size="sm"
                                                                        borderRadius="full"
                                                                        px={2}
                                                                    >
                                                                        {slot.active ? "🟢 Available" : "🔴 Occupied"}
                                                                    </Badge>

                                                                    <Text
                                                                        fontSize="xs"
                                                                        color="gray.500"
                                                                        fontWeight="medium"
                                                                    >
                                                                        Zone {slot.zone}
                                                                    </Text>
                                                                </VStack>
                                                            </CardBody>
                                                        </Card>
                                                    ))}
                                                </SimpleGrid>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                )
                            })}
                        </VStack>
                    )}

                    {/* No Results Message */}
                    {filteredSlots.length === 0 && (
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box flex="1">
                                <AlertTitle>No slots found!</AlertTitle>
                                <AlertDescription>
                                    {selectedZone
                                        ? `No slots found in ${selectedZone}. Try selecting a different zone or clearing the zone filter.`
                                        : "No slots found matching your search criteria. Try adjusting your search terms or zone filter."
                                    }
                                </AlertDescription>
                            </Box>
                        </Alert>
                    )}
                </Box>
            </VStack>

            {/* Slot Details Modal */}
            <Modal isOpen={isSlotDetailsOpen} onClose={onSlotDetailsClose} size="md" >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack>
                            <Icon as={FaParking} color="blue.500" />
                            <Text>Slot {selectedSlot?.slotNumber} Details</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedSlot && (
                            <VStack spacing={4} align="stretch">
                                <Box textAlign="center" py={4}>
                                    <Text fontSize="4xl" fontWeight="bold" color={selectedSlot.active ? "green.500" : "red.500"}>
                                        {selectedSlot.slotNumber}
                                    </Text>
                                    <Badge
                                        colorScheme={selectedSlot.active ? "green" : "red"}
                                        variant="solid"
                                        size="lg"
                                        borderRadius="full"
                                        px={4}
                                        py={2}
                                        mt={2}
                                    >
                                        {selectedSlot.active ? "🟢 Available" : "🔴 Occupied"}
                                    </Badge>
                                </Box>

                                <Divider />

                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                            Zone
                                        </Text>
                                        <Text fontSize="md" fontWeight="semibold">
                                            {selectedSlot.zone}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                            Slot ID
                                        </Text>
                                        <Text fontSize="md" fontWeight="semibold" fontFamily="mono">
                                            {selectedSlot.id}
                                        </Text>
                                    </Box>
                                </SimpleGrid>

                                <Box>
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                        Last Updated
                                    </Text>
                                    <Text fontSize="md" fontWeight="semibold">
                                        {selectedSlot.lastUpdated.toLocaleTimeString()}
                                    </Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                        Status
                                    </Text>
                                    <Text fontSize="md" fontWeight="semibold" color={selectedSlot.active ? "green.600" : "red.600"}>
                                        {selectedSlot.active ? "Available for parking" : "Currently occupied"}
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onSlotDetailsClose}>
                            Close
                        </Button>
                        {selectedSlot?.active && (
                            <Button colorScheme="green" leftIcon={<FiNavigation />}>
                                Navigate to Slot
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    )
}
