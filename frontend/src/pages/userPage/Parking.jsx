import {
    Box,
    Text,
    Card,
    CardBody,
    CardHeader,
    VStack,
    HStack,
    Badge,
    Icon,
    useColorModeValue,
    Button,
    SimpleGrid,
    Progress,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Container,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Select,
    Input,
    Textarea,
    Switch,
} from "@chakra-ui/react"
import {
    FiMapPin,
    FiClock,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiNavigation,
    FiBell,
    FiUsers,
    FiFilter,
    FiSearch,
} from "react-icons/fi"
import {
    FaParking,
    FaCar
} from "react-icons/fa"
import { useState, useEffect } from "react"

// Mock parking data with real-time simulation
const initialParkingData = [
    {
        id: "P1",
        name: "Main Campus Parking",
        zone: "Academic Block",
        totalSpots: 150,
        availableSpots: 45,
        occupiedSpots: 105,
        location: { lat: 40.7128, lng: -74.006 },
        distance: "0.2 km",
        walkTime: "3 min",
        hourlyRate: 2.5,
        maxStay: "8 hours",
        features: ["Covered", "Security", "EV Charging"],
        accessibility: true,
        vehicleTypes: ["Car", "Motorcycle"],
        peakHours: "8:00 AM - 6:00 PM",
        status: "available",
        lastUpdated: new Date(),
        floors: [
            { floor: "Ground", total: 50, available: 15, occupied: 35 },
            { floor: "Level 1", total: 50, available: 18, occupied: 32 },
            { floor: "Level 2", total: 50, available: 12, occupied: 38 },
        ],
    },
    {
        id: "P2",
        name: "Library Complex Parking",
        zone: "Library Block",
        totalSpots: 80,
        availableSpots: 12,
        occupiedSpots: 68,
        location: { lat: 40.713, lng: -74.0058 },
        distance: "0.4 km",
        walkTime: "5 min",
        hourlyRate: 2.0,
        maxStay: "4 hours",
        features: ["Covered", "24/7 Access"],
        accessibility: true,
        vehicleTypes: ["Car", "Motorcycle", "Bicycle"],
        peakHours: "9:00 AM - 5:00 PM",
        status: "limited",
        lastUpdated: new Date(),
        floors: [
            { floor: "Ground", total: 40, available: 5, occupied: 35 },
            { floor: "Level 1", total: 40, available: 7, occupied: 33 },
        ],
    },
    {
        id: "P3",
        name: "Sports Complex Parking",
        zone: "Sports & Recreation",
        totalSpots: 60,
        availableSpots: 0,
        occupiedSpots: 60,
        location: { lat: 40.7125, lng: -74.0065 },
        distance: "0.6 km",
        walkTime: "8 min",
        hourlyRate: 1.5,
        maxStay: "6 hours",
        features: ["Open Air", "Security"],
        accessibility: true,
        vehicleTypes: ["Car", "Motorcycle"],
        peakHours: "6:00 AM - 10:00 PM",
        status: "full",
        lastUpdated: new Date(),
        floors: [{ floor: "Ground", total: 60, available: 0, occupied: 60 }],
    },
    {
        id: "P4",
        name: "Dormitory Parking",
        zone: "Residential Area",
        totalSpots: 120,
        availableSpots: 35,
        occupiedSpots: 85,
        location: { lat: 40.7132, lng: -74.0062 },
        distance: "0.8 km",
        walkTime: "10 min",
        hourlyRate: 1.0,
        maxStay: "24 hours",
        features: ["Covered", "Resident Priority", "Security"],
        accessibility: true,
        vehicleTypes: ["Car", "Motorcycle", "Bicycle"],
        peakHours: "6:00 PM - 8:00 AM",
        status: "available",
        lastUpdated: new Date(),
        floors: [
            { floor: "Ground", total: 60, available: 20, occupied: 40 },
            { floor: "Level 1", total: 60, available: 15, occupied: 45 },
        ],
    },
    {
        id: "P5",
        name: "Visitor Parking",
        zone: "Main Entrance",
        totalSpots: 40,
        availableSpots: 8,
        occupiedSpots: 32,
        location: { lat: 40.7126, lng: -74.0059 },
        distance: "0.1 km",
        walkTime: "2 min",
        hourlyRate: 3.0,
        maxStay: "3 hours",
        features: ["Visitor Only", "Security", "Reception Nearby"],
        accessibility: true,
        vehicleTypes: ["Car"],
        peakHours: "9:00 AM - 4:00 PM",
        status: "limited",
        lastUpdated: new Date(),
        floors: [{ floor: "Ground", total: 40, available: 8, occupied: 32 }],
    },
]

export default function Parking() {
    const [parkingData, setParkingData] = useState(initialParkingData)
    const [selectedParking, setSelectedParking] = useState(null)
    const [isAutoRefresh, setIsAutoRefresh] = useState(true)
    const [lastRefresh, setLastRefresh] = useState(new Date())
    const [filterZone, setFilterZone] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [notifications, setNotifications] = useState([])

    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
    const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure()
    const { isOpen: isNotifyOpen, onOpen: onNotifyOpen, onClose: onNotifyClose } = useDisclosure()

    const toast = useToast()
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    // Real-time simulation effect
    useEffect(() => {
        if (!isAutoRefresh) return

        const interval = setInterval(() => {
            setParkingData((prevData) =>
                prevData.map((parking) => {
                    // Simulate random changes in parking availability
                    const change = Math.floor(Math.random() * 6) - 3 // -3 to +3 change
                    const newAvailable = Math.max(0, Math.min(parking.totalSpots, parking.availableSpots + change))
                    const newOccupied = parking.totalSpots - newAvailable

                    let newStatus = "available"
                    if (newAvailable === 0) newStatus = "full"
                    else if (newAvailable < parking.totalSpots * 0.2) newStatus = "limited"

                    // Update floor data proportionally
                    const updatedFloors = parking.floors.map((floor) => {
                        const floorRatio = floor.total / parking.totalSpots
                        const floorAvailable = Math.round(newAvailable * floorRatio)
                        return {
                            ...floor,
                            available: floorAvailable,
                            occupied: floor.total - floorAvailable,
                        }
                    })

                    return {
                        ...parking,
                        availableSpots: newAvailable,
                        occupiedSpots: newOccupied,
                        status: newStatus,
                        lastUpdated: new Date(),
                        floors: updatedFloors,
                    }
                }),
            )
            setLastRefresh(new Date())
        }, 5000) // Update every 5 seconds

        return () => clearInterval(interval)
    }, [isAutoRefresh])

    const getStatusColor = (status) => {
        switch (status) {
            case "available":
                return "green"
            case "limited":
                return "yellow"
            case "full":
                return "red"
            default:
                return "gray"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "available":
                return FiCheckCircle
            case "limited":
                return FiAlertCircle
            case "full":
                return FiXCircle
            default:
                return FaParking
        }
    }

    const getOccupancyPercentage = (parking) => {
        return Math.round((parking.occupiedSpots / parking.totalSpots) * 100)
    }

    const getTotalStats = () => {
        const total = parkingData.reduce((acc, p) => acc + p.totalSpots, 0)
        const available = parkingData.reduce((acc, p) => acc + p.availableSpots, 0)
        const occupied = parkingData.reduce((acc, p) => acc + p.occupiedSpots, 0)
        return { total, available, occupied }
    }

    const filteredParkingData = parkingData.filter((parking) => {
        const matchesZone = filterZone === "all" || parking.zone.toLowerCase().includes(filterZone.toLowerCase())
        const matchesStatus = filterStatus === "all" || parking.status === filterStatus
        const matchesSearch =
            parking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parking.zone.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesZone && matchesStatus && matchesSearch
    })

    const handleRefresh = () => {
        // Simulate manual refresh
        toast({
            title: "Refreshing parking data...",
            status: "info",
            duration: 1000,
            isClosable: true,
        })
        setLastRefresh(new Date())
    }

    const handleNotifyWhenAvailable = (parkingId) => {
        const parking = parkingData.find((p) => p.id === parkingId)
        setNotifications((prev) => [
            ...prev,
            {
                id: Date.now(),
                parkingId,
                parkingName: parking.name,
                threshold: 5,
                active: true,
            },
        ])
        toast({
            title: "Notification Set",
            description: `You'll be notified when ${parking.name} has available spots`,
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        onNotifyClose()
    }

    const handleReportIssue = () => {
        toast({
            title: "Issue Reported",
            description: "Thank you for reporting the parking issue. Our team will investigate.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        onReportClose()
    }

    const stats = getTotalStats()

    return (
        <Container maxW="7xl" py={6}>
            <VStack spacing={6} align="stretch">
                {/* Header Section */}
                <Box>
                    <HStack justify="space-between" align="center" mb={4}>
                        <VStack align="start" spacing={1}>
                            <HStack>
                                <Icon as={FaParking} boxSize={8} color="blue.500" />
                                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                                    Real-Time Parking
                                </Text>
                            </HStack>
                            <Text color="gray.600">
                                Live parking availability across campus • Last updated: {lastRefresh.toLocaleTimeString()}
                            </Text>
                        </VStack>

                        <HStack spacing={3}>
                            <HStack>
                                <Text fontSize="sm" color="gray.600">
                                    Auto-refresh
                                </Text>
                                <Switch
                                    isChecked={isAutoRefresh}
                                    onChange={(e) => setIsAutoRefresh(e.target.checked)}
                                    colorScheme="blue"
                                />
                            </HStack>
                            <Button leftIcon={<FiRefreshCw />} onClick={handleRefresh} variant="outline" size="sm">
                                Refresh
                            </Button>
                        </HStack>
                    </HStack>

                    {/* Overall Stats */}
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <Stat>
                                    <StatLabel>Total Spots</StatLabel>
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
                                        <StatArrow type="increase" />
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
                                    <StatNumber color="purple.500">{Math.round((stats.occupied / stats.total) * 100)}%</StatNumber>
                                    <StatHelpText>
                                        <Icon as={FiUsers} mr={1} />
                                        Campus average
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Filters and Search */}
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" mb={6}>
                        <CardBody>
                            <HStack spacing={4} wrap="wrap">
                                <HStack>
                                    <Icon as={FiFilter} color="gray.500" />
                                    <Text fontSize="sm" fontWeight="medium">
                                        Filters:
                                    </Text>
                                </HStack>

                                <FormControl maxW="200px">
                                    <Select size="sm" value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
                                        <option value="all">All Zones</option>
                                        <option value="academic">Academic Block</option>
                                        <option value="library">Library Block</option>
                                        <option value="sports">Sports & Recreation</option>
                                        <option value="residential">Residential Area</option>
                                        <option value="main">Main Entrance</option>
                                    </Select>
                                </FormControl>

                                <FormControl maxW="150px">
                                    <Select size="sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                        <option value="all">All Status</option>
                                        <option value="available">Available</option>
                                        <option value="limited">Limited</option>
                                        <option value="full">Full</option>
                                    </Select>
                                </FormControl>

                                <HStack>
                                    <Icon as={FiSearch} color="gray.500" />
                                    <Input
                                        placeholder="Search parking areas..."
                                        size="sm"
                                        maxW="250px"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </HStack>
                            </HStack>
                        </CardBody>
                    </Card>
                </Box>

                {/* Parking Areas Grid */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {filteredParkingData.map((parking) => (
                        <Card
                            key={parking.id}
                            bg={bgColor}
                            borderColor={borderColor}
                            borderWidth="1px"
                            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                            transition="all 0.2s"
                        >
                            <CardHeader pb={3}>
                                <HStack justify="space-between" align="start">
                                    <VStack align="start" spacing={1}>
                                        <HStack>
                                            <Icon as={getStatusIcon(parking.status)} color={`${getStatusColor(parking.status)}.500`} />
                                            <Text fontSize="lg" fontWeight="bold">
                                                {parking.name}
                                            </Text>
                                        </HStack>
                                        <HStack spacing={4}>
                                            <HStack spacing={1}>
                                                <Icon as={FiMapPin} size="sm" color="gray.500" />
                                                <Text fontSize="sm" color="gray.600">
                                                    {parking.zone}
                                                </Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                                <Icon as={FiNavigation} size="sm" color="gray.500" />
                                                <Text fontSize="sm" color="gray.600">
                                                    {parking.distance} • {parking.walkTime}
                                                </Text>
                                            </HStack>
                                        </HStack>
                                    </VStack>

                                    <Badge colorScheme={getStatusColor(parking.status)} variant="solid" px={3} py={1} borderRadius="full">
                                        {parking.status.toUpperCase()}
                                    </Badge>
                                </HStack>
                            </CardHeader>

                            <CardBody pt={0}>
                                <VStack spacing={4} align="stretch">
                                    {/* Availability Stats */}
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="green.500">
                                                {parking.availableSpots}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Available
                                            </Text>
                                        </VStack>

                                        <VStack align="center" spacing={0}>
                                            <Text fontSize="lg" fontWeight="semibold">
                                                {parking.totalSpots}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Total Spots
                                            </Text>
                                        </VStack>

                                        <VStack align="end" spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                                                {parking.occupiedSpots}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Occupied
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    {/* Occupancy Progress Bar */}
                                    <Box>
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" fontWeight="medium">
                                                Occupancy
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {getOccupancyPercentage(parking)}%
                                            </Text>
                                        </HStack>
                                        <Progress
                                            value={getOccupancyPercentage(parking)}
                                            colorScheme={
                                                getOccupancyPercentage(parking) > 80
                                                    ? "red"
                                                    : getOccupancyPercentage(parking) > 60
                                                        ? "yellow"
                                                        : "green"
                                            }
                                            size="lg"
                                            borderRadius="md"
                                        />
                                    </Box>

                                    {/* Floor Breakdown */}
                                    {parking.floors.length > 1 && (
                                        <Box>
                                            <Text fontSize="sm" fontWeight="medium" mb={2}>
                                                Floor Breakdown
                                            </Text>
                                            <VStack spacing={2}>
                                                {parking.floors.map((floor, index) => (
                                                    <HStack key={index} justify="space-between" w="full">
                                                        <Text fontSize="sm">{floor.floor}</Text>
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme="green" variant="subtle">
                                                                {floor.available} free
                                                            </Badge>
                                                            <Badge colorScheme="gray" variant="subtle">
                                                                {floor.total} total
                                                            </Badge>
                                                        </HStack>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}

                                    {/* Features */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                                            Features
                                        </Text>
                                        <HStack wrap="wrap" spacing={2}>
                                            {parking.features.map((feature, index) => (
                                                <Badge key={index} variant="outline" colorScheme="blue">
                                                    {feature}
                                                </Badge>
                                            ))}
                                            {parking.accessibility && (
                                                <Badge variant="outline" colorScheme="purple">
                                                    Accessible
                                                </Badge>
                                            )}
                                        </HStack>
                                    </Box>

                                    {/* Pricing and Info */}
                                    <HStack justify="space-between" fontSize="sm" color="gray.600">
                                        <Text>${parking.hourlyRate}/hour</Text>
                                        <Text>Max: {parking.maxStay}</Text>
                                        <Text>Peak: {parking.peakHours}</Text>
                                    </HStack>

                                    <Divider />

                                    {/* Action Buttons */}
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            variant="solid"
                                            flex={1}
                                            onClick={() => {
                                                setSelectedParking(parking)
                                                onDetailsOpen()
                                            }}
                                        >
                                            View Details
                                        </Button>

                                        {parking.status === "full" && (
                                            <Button
                                                size="sm"
                                                colorScheme="orange"
                                                variant="outline"
                                                leftIcon={<FiBell />}
                                                onClick={() => {
                                                    setSelectedParking(parking)
                                                    onNotifyOpen()
                                                }}
                                            >
                                                Notify Me
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            variant="ghost"
                                            leftIcon={<FiAlertCircle />}
                                            onClick={() => {
                                                setSelectedParking(parking)
                                                onReportOpen()
                                            }}
                                        >
                                            Report Issue
                                        </Button>
                                    </HStack>

                                    {/* Last Updated */}
                                    <HStack justify="center" spacing={1}>
                                        <Icon as={FiClock} size="sm" color="gray.400" />
                                        <Text fontSize="xs" color="gray.500">
                                            Updated {parking.lastUpdated.toLocaleTimeString()}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* No Results Message */}
                {filteredParkingData.length === 0 && (
                    <Alert status="info">
                        <AlertIcon />
                        <AlertTitle>No parking areas found!</AlertTitle>
                        <AlertDescription>Try adjusting your filters or search terms to find parking areas.</AlertDescription>
                    </Alert>
                )}

                {/* Active Notifications */}
                {notifications.length > 0 && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardHeader>
                            <HStack>
                                <Icon as={FiBell} color="orange.500" />
                                <Text fontWeight="bold">Active Notifications</Text>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                            <VStack spacing={2} align="stretch">
                                {notifications.map((notification) => (
                                    <Alert key={notification.id} status="info" borderRadius="md">
                                        <AlertIcon />
                                        <Box flex="1">
                                            <AlertTitle fontSize="sm">Watching {notification.parkingName}</AlertTitle>
                                            <AlertDescription fontSize="xs">You'll be notified when spots become available</AlertDescription>
                                        </Box>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                                        >
                                            Cancel
                                        </Button>
                                    </Alert>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                )}
            </VStack>

            {/* Parking Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack>
                            <Icon as={FaParking} color="blue.500" />
                            <Text>{selectedParking?.name}</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedParking && (
                            <VStack spacing={4} align="stretch">
                                <SimpleGrid columns={2} spacing={4}>
                                    <Stat>
                                        <StatLabel>Available Spots</StatLabel>
                                        <StatNumber color="green.500">{selectedParking.availableSpots}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Total Capacity</StatLabel>
                                        <StatNumber>{selectedParking.totalSpots}</StatNumber>
                                    </Stat>
                                </SimpleGrid>

                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Location & Access
                                    </Text>
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="sm">Zone: {selectedParking.zone}</Text>
                                        <Text fontSize="sm">Distance: {selectedParking.distance}</Text>
                                        <Text fontSize="sm">Walking Time: {selectedParking.walkTime}</Text>
                                    </VStack>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Pricing & Rules
                                    </Text>
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="sm">Hourly Rate: ${selectedParking.hourlyRate}</Text>
                                        <Text fontSize="sm">Maximum Stay: {selectedParking.maxStay}</Text>
                                        <Text fontSize="sm">Peak Hours: {selectedParking.peakHours}</Text>
                                    </VStack>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Vehicle Types Allowed
                                    </Text>
                                    <HStack wrap="wrap" spacing={2}>
                                        {selectedParking.vehicleTypes.map((type, index) => (
                                            <Badge key={index} colorScheme="blue" variant="outline">
                                                {type}
                                            </Badge>
                                        ))}
                                    </HStack>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Features & Amenities
                                    </Text>
                                    <HStack wrap="wrap" spacing={2}>
                                        {selectedParking.features.map((feature, index) => (
                                            <Badge key={index} colorScheme="green" variant="outline">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </HStack>
                                </Box>

                                {selectedParking.floors.length > 1 && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            Floor Details
                                        </Text>
                                        <VStack spacing={2}>
                                            {selectedParking.floors.map((floor, index) => (
                                                <HStack key={index} justify="space-between" w="full" p={2} bg="gray.50" borderRadius="md">
                                                    <Text fontWeight="medium">{floor.floor}</Text>
                                                    <HStack spacing={4}>
                                                        <Text fontSize="sm" color="green.600">
                                                            {floor.available} available
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600">
                                                            {floor.occupied} occupied
                                                        </Text>
                                                        <Text fontSize="sm" color="blue.600">
                                                            {floor.total} total
                                                        </Text>
                                                    </HStack>
                                                </HStack>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onDetailsClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Notification Setup Modal */}
            <Modal isOpen={isNotifyOpen} onClose={onNotifyClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Set Parking Notification</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text>
                                Get notified when <strong>{selectedParking?.name}</strong> has available parking spots.
                            </Text>

                            <FormControl>
                                <FormLabel>Notify me when at least</FormLabel>
                                <Select defaultValue="5">
                                    <option value="1">1 spot is available</option>
                                    <option value="3">3 spots are available</option>
                                    <option value="5">5 spots are available</option>
                                    <option value="10">10 spots are available</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notification method</FormLabel>
                                <VStack align="start" spacing={2}>
                                    <HStack>
                                        <Switch defaultChecked />
                                        <Text fontSize="sm">Push notification</Text>
                                    </HStack>
                                    <HStack>
                                        <Switch />
                                        <Text fontSize="sm">Email notification</Text>
                                    </HStack>
                                    <HStack>
                                        <Switch />
                                        <Text fontSize="sm">SMS notification</Text>
                                    </HStack>
                                </VStack>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onNotifyClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => handleNotifyWhenAvailable(selectedParking?.id)}>
                            Set Notification
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Report Issue Modal */}
            <Modal isOpen={isReportOpen} onClose={onReportClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Report Parking Issue</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text>
                                Report an issue with <strong>{selectedParking?.name}</strong>
                            </Text>

                            <FormControl>
                                <FormLabel>Issue Type</FormLabel>
                                <Select placeholder="Select issue type">
                                    <option value="incorrect-count">Incorrect spot count</option>
                                    <option value="blocked-access">Blocked access</option>
                                    <option value="lighting">Poor lighting</option>
                                    <option value="security">Security concern</option>
                                    <option value="maintenance">Maintenance needed</option>
                                    <option value="other">Other</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea placeholder="Please describe the issue in detail..." rows={4} />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Your Contact (Optional)</FormLabel>
                                <Input placeholder="Email or phone number for follow-up" />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onReportClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleReportIssue}>
                            Submit Report
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    )
}
