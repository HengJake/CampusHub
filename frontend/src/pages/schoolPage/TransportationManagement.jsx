import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useDisclosure,
    Spinner,
    Center,
    VStack,
    Text,
    Badge,
    HStack,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Icon,
    useColorModeValue,
    Card,
    CardBody,
    Progress,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Avatar,
} from '@chakra-ui/react';
import { useTransportationStore } from '../../store/transportation.js';
import {
    FiTrendingUp,
    FiMapPin,
    FiTruck,
    FiNavigation,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle
} from 'react-icons/fi';
import { FaCar, FaBus } from 'react-icons/fa';

// Import utility functions
import {
    getVehicleTypeLabel,
    getVehicleStatusLabel,
    getStopTypeLabel,
    getDayLabel,
    getStatusColor,
    formatTime,
    calculateDuration
} from '../../component/schoolAdminDashboard/transport/utils';

// Import tab components directly
import BusScheduleTab from '../../component/schoolAdminDashboard/transport/BusScheduleTab';
import VehicleTab from '../../component/schoolAdminDashboard/transport/VehicleTab';
import StopTab from '../../component/schoolAdminDashboard/transport/StopTab';
import RouteTab from '../../component/schoolAdminDashboard/transport/RouteTab';
import TransportModal from '../../component/schoolAdminDashboard/transport/TransportModal';
import DeleteConfirmationModal from '../../component/schoolAdminDashboard/transport/DeleteConfirmationModal';
import { useAuthStore } from '../../store/auth.js';

// Loading fallback component
const TabLoadingFallback = () => (
    <Center p={8}>
        <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Loading transportation data...</Text>
        </VStack>
    </Center>
);

const TransportationManagement = () => {
    const {
        loading,
        errors,
        busSchedules,
        vehicles,
        stops,
        routes,
        fetchBusSchedulesBySchoolId,
        fetchVehiclesBySchoolId,
        fetchStopsBySchoolId,
        fetchRoutesBySchoolId,
        fetchEHailingsBySchoolId,
        updateEHailingStatus,
        deleteBusSchedule,
        deleteVehicle,
        deleteStop,
        deleteRoute
    } = useTransportationStore();

    const { isAuthenticated, schoolId } = useAuthStore();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [dataLoaded, setDataLoaded] = useState({
        busSchedules: false,
        vehicles: false,
        stops: false,
        routes: false,
        eHailings: false
    });
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Delete confirmation modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteModalType, setDeleteModalType] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // E-Hailing data state
    const [eHailings, setEHailings] = useState([]);
    const [eHailingsLoading, setEHailingsLoading] = useState(false);
    const [eHailingsError, setEHailingsError] = useState(null);

    // Load data based on active tab
    const loadTabData = async (tabIndex) => {
        // Check if user is authenticated first
        if (!isAuthenticated || !schoolId) {
            return;
        }

        const tabDataMap = {
            0: { key: 'busSchedules', fetchFn: fetchBusSchedulesBySchoolId },
            1: { key: 'eHailings', fetchFn: fetchEHailingsBySchoolId },
            2: { key: 'vehicles', fetchFn: fetchVehiclesBySchoolId },
            3: { key: 'stops', fetchFn: fetchStopsBySchoolId },
            4: { key: 'routes', fetchFn: fetchRoutesBySchoolId },
        };

        const tabData = tabDataMap[tabIndex];

        if (tabData && !dataLoaded[tabData.key]) {
            try {
                const result = await tabData.fetchFn();

                if (result.success) {
                    setDataLoaded(prev => ({ ...prev, [tabData.key]: true }));

                    // Special handling for e-hailing data
                    if (tabData.key === 'eHailings') {
                        setEHailings(result.data || []);
                    }
                }
            } catch (error) {
                // Handle error silently or add proper error handling
                if (tabData.key === 'eHailings') {
                    setEHailingsError(error.message);
                }
            }
        }
    };

    // Function to fetch e-hailing data specifically
    const fetchEHailingData = async () => {
        if (!isAuthenticated || !schoolId) {
            return;
        }

        setEHailingsLoading(true);
        setEHailingsError(null);

        try {
            const result = await fetchEHailingsBySchoolId();

            if (result.success) {
                setEHailings(result.data || []);
                setDataLoaded(prev => ({ ...prev, eHailings: true }));
            } else {
                setEHailingsError(result.message || 'Failed to fetch e-hailing data');
            }
        } catch (error) {
            setEHailingsError(error.message || 'Error fetching e-hailing data');
        } finally {
            setEHailingsLoading(false);
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'waiting':
                return FiClock;
            case 'in_progress':
                return FiTruck;
            case 'completed':
                return FiCheckCircle;
            case 'cancelled':
                return FiXCircle;
            case 'delayed':
                return FiAlertCircle;
            default:
                return FiClock;
        }
    };

    // Analysis functions for e-hailing data
    const getRouteUsageStats = () => {
        if (!eHailings || eHailings.length === 0) return [];

        const routeStats = new Map();

        eHailings.forEach(request => {
            const routeId = request.routeId?._id || request.routeId;
            const routeName = request.routeId?.name || 'Unknown Route';

            if (!routeStats.has(routeId)) {
                routeStats.set(routeId, {
                    routeId,
                    routeName,
                    count: 0,
                    totalFare: 0,
                    avgTime: 0,
                    statuses: {}
                });
            }

            const stats = routeStats.get(routeId);
            stats.count++;

            if (request.routeId?.fare) {
                stats.totalFare += parseFloat(request.routeId.fare) || 0;
            }

            if (request.routeId?.estimateTimeMinute) {
                stats.avgTime += parseFloat(request.routeId.estimateTimeMinute) || 0;
            }

            const status = request.status || 'Unknown';
            stats.statuses[status] = (stats.statuses[status] || 0) + 1;
        });

        // Calculate averages and sort by usage
        return Array.from(routeStats.values())
            .map(stat => ({
                ...stat,
                avgFare: stat.count > 0 ? (stat.totalFare / stat.count).toFixed(2) : 0,
                avgTime: stat.count > 0 ? (stat.avgTime / stat.count).toFixed(1) : 0
            }))
            .sort((a, b) => b.count - a.count);
    };

    const getVehicleUsageStats = () => {
        if (!eHailings || eHailings.length === 0) return [];

        const vehicleStats = new Map();

        eHailings.forEach(request => {
            const vehicleId = request.vehicleId?._id || request.vehicleId;
            const vehicleInfo = request.vehicleId?.plateNumber || 'Unknown Vehicle';

            if (!vehicleStats.has(vehicleId)) {
                vehicleStats.set(vehicleId, {
                    vehicleId,
                    vehicleInfo,
                    count: 0,
                    totalFare: 0,
                    statuses: {}
                });
            }

            const stats = vehicleStats.get(vehicleId);
            stats.count++;

            if (request.routeId?.fare) {
                stats.totalFare += parseFloat(request.routeId.fare) || 0;
            }

            const status = request.status || 'Unknown';
            stats.statuses[status] = (stats.statuses[status] || 0) + 1;
        });

        return Array.from(vehicleStats.values())
            .map(stat => ({
                ...stat,
                avgFare: stat.count > 0 ? (stat.totalFare / stat.count).toFixed(2) : 0
            }))
            .sort((a, b) => b.count - a.count);
    };

    const getStatusDistribution = () => {
        if (!eHailings || eHailings.length === 0) return [];

        const statusCounts = {};

        eHailings.forEach(request => {
            const status = request.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return Object.entries(statusCounts)
            .map(([status, count]) => ({
                status,
                count,
                percentage: ((count / eHailings.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count);
    };

    const getTotalStats = () => {
        if (!eHailings || eHailings.length === 0) return {};

        const totalFare = eHailings.reduce((sum, request) => {
            return sum + (parseFloat(request.routeId?.fare) || 0);
        }, 0);

        const totalTime = eHailings.reduce((sum, request) => {
            return sum + (parseFloat(request.routeId?.estimateTimeMinute) || 0);
        }, 0);

        const completedRequests = eHailings.filter(request =>
            request.status?.toLowerCase() === 'completed'
        ).length;

        return {
            totalRequests: eHailings.length,
            totalFare: totalFare.toFixed(2),
            avgFare: (totalFare / eHailings.length).toFixed(2),
            avgTime: (totalTime / eHailings.length).toFixed(1),
            completionRate: ((completedRequests / eHailings.length) * 100).toFixed(1)
        };
    };

    // Load initial data for first tab only
    useEffect(() => {
        loadTabData(0);
    }, []);

    // Load data when authentication state changes
    useEffect(() => {
        if (isAuthenticated && schoolId) {
            loadTabData(activeTab);
        }
    }, [isAuthenticated, schoolId, activeTab]);

    // Load data when tab changes
    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);

    // Load e-hailing data when E-Hailing tab is selected
    useEffect(() => {
        if (activeTab === 1 && !dataLoaded.eHailings) {
            fetchEHailingData();
        }
    }, [activeTab, dataLoaded.eHailings]);

    const openCreateModal = (type) => {
        setModalType(type);
        setIsEditMode(false);
        setSelectedItem(null);
        onOpen();
    };

    const openViewModal = (type, item) => {
        setModalType(type);
        setSelectedItem(item);
        setIsEditMode(false);
        onOpen();
    };

    const openEditModal = (type, item) => {
        setModalType(type);
        setSelectedItem(item);
        setIsEditMode(true);
        onOpen();
    };

    const handleModalClose = () => {
        onClose();
        setSelectedItem(null);
        setIsEditMode(false);
        setModalType('');
    };

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    // Function to refresh data based on modal type
    const handleRefresh = async () => {
        try {
            // Add a small delay to ensure server-side operations are complete
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (modalType) {
                case 'busSchedule':
                    const busResult = await fetchBusSchedulesBySchoolId({}, true); // Force refresh
                    setDataLoaded(prev => ({ ...prev, busSchedules: true }));
                    break;
                case 'vehicle':
                    const vehicleResult = await fetchVehiclesBySchoolId({}, true); // Force refresh
                    setDataLoaded(prev => ({ ...prev, vehicles: true }));
                    break;
                case 'stop':
                    const stopResult = await fetchStopsBySchoolId({}, true); // Force refresh
                    setDataLoaded(prev => ({ ...prev, stops: true }));
                    break;
                case 'route':
                    const routeResult = await fetchRoutesBySchoolId({}, true); // Force refresh
                    setDataLoaded(prev => ({ ...prev, routes: true }));
                    break;
                case 'eHailing': // New case for e-hailing refresh
                    const eHailingResult = await fetchEHailingsBySchoolId({}, true); // Force refresh
                    setEHailings(eHailingResult.data || []); // Update eHailings state directly
                    setDataLoaded(prev => ({ ...prev, eHailings: true }));
                    break;
                default:
                    break;
            }
        } catch (error) {
            // Silent error handling for refresh operations
        }
    };

    // Function to open delete confirmation modal
    const openDeleteModal = (type, item) => {
        setDeleteModalType(type);
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    // Function to handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!itemToDelete || !deleteModalType) return;

        setIsDeleting(true);
        try {
            let result;

            // Call the appropriate delete function based on modal type
            switch (deleteModalType) {
                case 'busSchedule':
                    result = await deleteBusSchedule(itemToDelete._id);
                    break;
                case 'vehicle':
                    result = await deleteVehicle(itemToDelete._id);
                    break;
                case 'stop':
                    result = await deleteStop(itemToDelete._id);
                    break;
                case 'route':
                    result = await deleteRoute(itemToDelete._id);
                    break;
                default:
                    throw new Error('Unknown modal type for deletion');
            }

            if (result.success) {
                // Close the modal
                setDeleteModalOpen(false);
                setItemToDelete(null);
                setDeleteModalType('');

                // Refresh the current tab data
                await loadTabData(activeTab);
            } else {
                throw new Error(result.message || 'Failed to delete item');
            }
        } catch (error) {
            // Error toast will be handled by the modal
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    // Function to close delete modal
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setDeleteModalType('');
        setIsDeleting(false);
    };

    return (
        <Box>
            <Heading size="lg" mb={6}>Transportation Management</Heading>

            <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={handleTabChange}>
                <TabList>
                    <Tab>Bus Schedules</Tab>
                    <Tab>E-Hailing</Tab>
                    <Tab>Vehicles</Tab>
                    <Tab>Stops</Tab>
                    <Tab>Routes</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <BusScheduleTab
                            loading={loading.busSchedules}
                            error={errors.busSchedules}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    </TabPanel>
                    <TabPanel>
                        <Tabs variant="enclosed" colorScheme="green">
                            <TabList>
                                <Tab>Current Requests</Tab>
                                <Tab>Past Requests</Tab>
                                <Tab>Analysis</Tab>
                            </TabList>

                            <TabPanels>
                                {/* Current Requests Tab */}
                                <TabPanel>
                                    <VStack spacing={4} align="stretch">
                                        <HStack justify="space-between">
                                            <Heading size="md" color="green.600">Current E-Hailing Requests</Heading>
                                            <Button
                                                leftIcon={<Icon as={FiTrendingUp} />}
                                                colorScheme="green"
                                                size="sm"
                                                onClick={fetchEHailingData}
                                                isLoading={eHailingsLoading}
                                            >
                                                Refresh Data
                                            </Button>
                                        </HStack>

                                        {eHailingsError && (
                                            <Alert status="error" borderRadius="md">
                                                <AlertIcon />
                                                <Box>
                                                    <AlertTitle>Error loading e-hailing data</AlertTitle>
                                                    <AlertDescription>{eHailingsError}</AlertDescription>
                                                </Box>
                                            </Alert>
                                        )}

                                        {eHailingsLoading ? (
                                            <Center p={8}>
                                                <VStack spacing={4}>
                                                    <Spinner size="xl" color="green.500" />
                                                    <Text>Loading e-hailing data...</Text>
                                                </VStack>
                                            </Center>
                                        ) : eHailings.filter(request =>
                                            request && request.status?.toLowerCase() !== 'completed' &&
                                            request.status?.toLowerCase() !== 'cancelled'
                                        ).length === 0 ? (
                                            <Center p={8}>
                                                <VStack spacing={4}>
                                                    <Icon as={FaCar} boxSize={8} color="gray.400" />
                                                    <Text color="gray.500">No active e-hailing requests</Text>
                                                </VStack>
                                            </Center>
                                        ) : (
                                            <VStack spacing={3} align="stretch">
                                                {eHailings.filter(request =>
                                                    request && request.status?.toLowerCase() !== 'completed' &&
                                                    request.status?.toLowerCase() !== 'cancelled'
                                                ).map((request) => (
                                                    <Card key={request._id} variant="outline">
                                                        <CardBody>
                                                            <VStack align="start" spacing={3}>
                                                                <HStack justify="space-between" w="full">
                                                                    <Text fontSize="lg" fontWeight="semibold">
                                                                        {request.routeId?.name || 'Unknown Route'}
                                                                    </Text>
                                                                    {/* Enhanced Status dropdown */}
                                                                    <Menu>
                                                                        <MenuButton
                                                                            as={Button}
                                                                            size="sm"
                                                                            variant="solid"
                                                                            colorScheme={getStatusColor(request.status)}
                                                                            borderRadius="full"
                                                                            px={4}
                                                                            py={2}
                                                                            fontWeight="semibold"
                                                                            _hover={{
                                                                                transform: 'translateY(-1px)',
                                                                                boxShadow: 'lg',
                                                                                filter: 'brightness(1.1)'
                                                                            }}
                                                                            _active={{
                                                                                transform: 'translateY(0)',
                                                                                boxShadow: 'md'
                                                                            }}
                                                                            transition="all 0.2s"
                                                                        >
                                                                            <HStack spacing={2}>
                                                                                <Icon
                                                                                    as={getStatusIcon(request.status)}
                                                                                    boxSize={4}
                                                                                    color="white"
                                                                                />
                                                                                <Text textTransform="capitalize" color="white">
                                                                                    {request.status || 'Unknown'}
                                                                                </Text>
                                                                                <Icon as={FiTrendingUp} boxSize={3} color="white" />
                                                                            </HStack>
                                                                        </MenuButton>
                                                                        <MenuList
                                                                            minW="200px"
                                                                            py={2}
                                                                            borderRadius="lg"
                                                                            boxShadow="xl"
                                                                            border="1px solid"
                                                                            borderColor="gray.200"
                                                                        >
                                                                            {[
                                                                                { value: 'waiting', label: 'Waiting', icon: 'FiClock', color: 'yellow' },
                                                                                { value: 'in_progress', label: 'In Progress', icon: 'FiTruck', color: 'blue' },
                                                                                { value: 'completed', label: 'Completed', icon: 'FiCheckCircle', color: 'green' },
                                                                                { value: 'cancelled', label: 'Cancelled', icon: 'FiXCircle', color: 'red' },
                                                                                { value: 'delayed', label: 'Delayed', icon: 'FiAlertCircle', color: 'orange' }
                                                                            ].map((statusOption) => (
                                                                                <MenuItem
                                                                                    key={statusOption.value}
                                                                                    onClick={async () => {
                                                                                        if (request.status === statusOption.value) return;

                                                                                        const updatedEhailing = {
                                                                                            status: statusOption.value,
                                                                                            routeId: request.routeId._id || request.routeId,
                                                                                            studentId: request.studentId._id || request.studentId,
                                                                                            vehicleId: request.vehicleId._id || request.vehicleId,
                                                                                        }

                                                                                        try {
                                                                                            // Call the API to update the status
                                                                                            const result = await updateEHailingStatus(request._id, updatedEhailing);

                                                                                            if (result.success) {
                                                                                                // Update local state immediately for better UX
                                                                                                setEHailings(prev =>
                                                                                                    prev.map(item =>
                                                                                                        item._id === request._id
                                                                                                            ? { ...item, status: statusOption.value }
                                                                                                            : item
                                                                                                    )
                                                                                                );

                                                                                                // Refresh data from server to ensure consistency
                                                                                                await fetchEHailingsBySchoolId();
                                                                                                toast({
                                                                                                    title: `Request status updated to ${statusOption.label}`,
                                                                                                    description: `Request ID: ${request._id}`,
                                                                                                    status: 'success',
                                                                                                    duration: 5000,
                                                                                                    isClosable: true,
                                                                                                });
                                                                                            } else {
                                                                                                throw new Error(result.message || 'Failed to update status');
                                                                                            }
                                                                                        } catch (err) {
                                                                                            toast({
                                                                                                title: 'Failed to update status',
                                                                                                description: `Request ID: ${request._id} - ${err.message}`,
                                                                                                status: 'error',
                                                                                                duration: 5000,
                                                                                                isClosable: true,
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    _hover={{
                                                                                        bg: statusOption.color + '.50',
                                                                                        transform: 'translateX(4px)'
                                                                                    }}
                                                                                    transition="all 0.2s"
                                                                                    borderRadius="md"
                                                                                    mx={2}
                                                                                    my={1}
                                                                                >
                                                                                    <HStack spacing={3} w="full">
                                                                                        <Icon
                                                                                            as={getStatusIcon(statusOption.value)}
                                                                                            boxSize={5}
                                                                                            color={statusOption.color + '.600'}
                                                                                        />
                                                                                        <Text
                                                                                            fontWeight="medium"
                                                                                            color={statusOption.color + '.700'}
                                                                                        >
                                                                                            {statusOption.label}
                                                                                        </Text>
                                                                                        {request.status === statusOption.value && (
                                                                                            <Icon
                                                                                                as={FiTrendingUp}
                                                                                                color={statusOption.color + '.500'}
                                                                                                boxSize={4}
                                                                                                ml="auto"
                                                                                            />
                                                                                        )}
                                                                                    </HStack>
                                                                                </MenuItem>
                                                                            ))}
                                                                        </MenuList>
                                                                    </Menu>
                                                                </HStack>

                                                                <HStack spacing={4} align="center">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        From: {request.routeId?.stopIds?.[0]?.name || 'Start'}
                                                                    </Text>
                                                                    <Icon as={FiMapPin} color="blue.500" />
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        To: {request.routeId?.stopIds?.[1]?.name || 'End'}
                                                                    </Text>
                                                                </HStack>

                                                                <HStack spacing={6} fontSize="sm" color="gray.600">
                                                                    <Text>Vehicle: {request.vehicleId?.plateNumber || 'N/A'}</Text>
                                                                    <Text>Est. Time: {request.routeId?.estimateTimeMinute || 'N/A'} min</Text>
                                                                    <Text>Fare: RM {request.routeId?.fare || 'N/A'}</Text>
                                                                </HStack>

                                                                {/* Student Information */}
                                                                <Box
                                                                    p={3}
                                                                    bg="gray.50"
                                                                    borderRadius="md"
                                                                    border="1px solid"
                                                                    borderColor="gray.200"
                                                                >
                                                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                                        Student Details
                                                                    </Text>
                                                                    <HStack spacing={4} fontSize="sm" color="gray.600">
                                                                        <Avatar
                                                                            size="sm"
                                                                            name={request.studentId?.userId?.name}
                                                                            src={request.studentId?.userId?.profilePicture || undefined}
                                                                            bg="blue.400"
                                                                        />
                                                                        <VStack align="start" spacing={0}>
                                                                            <Text>Name: {request.studentId?.userId?.name || 'N/A'}</Text>
                                                                            <Text>ID: {request.studentId?._id || 'N/A'}</Text>
                                                                        </VStack>
                                                                    </HStack>
                                                                </Box>

                                                                <Text fontSize="sm" color="gray.600">
                                                                    Requested: {formatTime(request.requestAt)}
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        )}
                                    </VStack>
                                </TabPanel>

                                {/* Past Requests Tab */}
                                <TabPanel>
                                    <VStack spacing={4} align="stretch">
                                        <Heading size="md" color="blue.600">Past E-Hailing Requests</Heading>

                                        {eHailings.filter(request =>
                                            request && (request.status?.toLowerCase() === 'completed' ||
                                                request.status?.toLowerCase() === 'cancelled')
                                        ).length === 0 ? (
                                            <Center p={8}>
                                                <VStack spacing={4}>
                                                    <Icon as={FaCar} boxSize={8} color="gray.400" />
                                                    <Text color="gray.500">No completed or cancelled requests</Text>
                                                </VStack>
                                            </Center>
                                        ) : (
                                            <VStack spacing={3} align="stretch">
                                                {eHailings.filter(request =>
                                                    request && (request.status?.toLowerCase() === 'completed' ||
                                                        request.status?.toLowerCase() === 'cancelled')
                                                ).map((request) => (
                                                    <Card key={request._id} variant="outline">
                                                        <CardBody>
                                                            <VStack align="start" spacing={3}>
                                                                <HStack justify="space-between" w="full">
                                                                    <Text fontSize="lg" fontWeight="semibold">
                                                                        {request.routeId?.name || 'Unknown Route'}
                                                                    </Text>
                                                                    <HStack spacing={2}>
                                                                        <Box
                                                                            w={2}
                                                                            h={2}
                                                                            borderRadius="full"
                                                                            bg={getStatusColor(request.status) + '.500'}
                                                                            boxShadow="0 0 8px rgba(0,0,0,0.3)"
                                                                        />
                                                                        <Badge
                                                                            colorScheme={getStatusColor(request.status)}
                                                                            variant="outline"
                                                                            borderWidth="2px"
                                                                            borderRadius="full"
                                                                            px={3}
                                                                            py={1}
                                                                            fontWeight="semibold"
                                                                            textTransform="capitalize"
                                                                        >
                                                                            {request.status || 'Unknown'}
                                                                        </Badge>
                                                                    </HStack>
                                                                </HStack>

                                                                <HStack spacing={4} align="center">
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        From: {request.routeId?.stopIds?.[0]?.name || 'Start'}
                                                                    </Text>
                                                                    <Icon as={FiMapPin} color="blue.500" />
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        To: {request.routeId?.stopIds?.[1]?.name || 'End'}
                                                                    </Text>
                                                                </HStack>

                                                                <HStack spacing={6} fontSize="sm" color="gray.600">
                                                                    <Text>Vehicle: {request.vehicleId?.plateNumber || 'N/A'}</Text>
                                                                    <Text>Est. Time: {request.routeId?.estimateTimeMinute || 'N/A'} min</Text>
                                                                    <Text>Fare: RM {request.routeId?.fare || 'N/A'}</Text>
                                                                </HStack>

                                                                {/* Student Information */}
                                                                <Box
                                                                    p={3}
                                                                    bg="gray.50"
                                                                    borderRadius="md"
                                                                    border="1px solid"
                                                                    borderColor="gray.200"
                                                                >
                                                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                                                        Student Details
                                                                    </Text>
                                                                    <HStack spacing={4} fontSize="sm" color="gray.600">
                                                                        <Avatar
                                                                            size="sm"
                                                                            name={request.studentId?.userId?.name}
                                                                            src={request.studentId?.userId?.profilePicture || undefined}
                                                                            bg="blue.400"
                                                                        />
                                                                        <VStack align="start" spacing={0}>
                                                                            <Text>Name: {request.studentId?.userId?.name || 'N/A'}</Text>
                                                                            <Text>ID: {request.studentId?._id || 'N/A'}</Text>
                                                                        </VStack>
                                                                    </HStack>
                                                                </Box>

                                                                <Text fontSize="sm" color="gray.600">
                                                                    Requested: {formatTime(request.requestAt)}
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        )}
                                    </VStack>
                                </TabPanel>

                                {/* Analysis Tab */}
                                <TabPanel>
                                    <VStack spacing={6} align="stretch">
                                        <Heading size="lg" color="purple.600">E-Hailing Analytics</Heading>

                                        {/* Overall Statistics */}
                                        <Box>
                                            <Heading size="md" mb={4} color="green.600">Overall Statistics</Heading>
                                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                                {(() => {
                                                    const stats = getTotalStats();
                                                    return (
                                                        <>
                                                            <Stat>
                                                                <StatLabel>Total Requests</StatLabel>
                                                                <StatNumber>{stats.totalRequests || 0}</StatNumber>
                                                            </Stat>
                                                            <Stat>
                                                                <StatLabel>Total Revenue</StatLabel>
                                                                <StatNumber>RM {stats.totalFare || 0}</StatNumber>
                                                            </Stat>
                                                            <Stat>
                                                                <StatLabel>Avg Fare</StatLabel>
                                                                <StatNumber>RM {stats.avgFare || 0}</StatNumber>
                                                            </Stat>
                                                            <Stat>
                                                                <StatLabel>Completion Rate</StatLabel>
                                                                <StatNumber>{stats.completionRate || 0}%</StatNumber>
                                                                <StatHelpText>
                                                                    <StatArrow type="increase" />
                                                                </StatHelpText>
                                                            </Stat>
                                                        </>
                                                    );
                                                })()}
                                            </SimpleGrid>
                                        </Box>

                                        {/* Route Usage Analysis */}
                                        <Box>
                                            <Heading size="md" mb={4} color="blue.600">Most Used Routes</Heading>
                                            <VStack spacing={3} align="stretch">
                                                {getRouteUsageStats().slice(0, 5).map((route, index) => (
                                                    <Card key={route.routeId} variant="outline">
                                                        <CardBody>
                                                            <HStack justify="space-between" align="center">
                                                                <VStack align="start" spacing={1}>
                                                                    <Text fontSize="lg" fontWeight="semibold" color="blue.700">
                                                                        {route.routeName}
                                                                    </Text>
                                                                    <Text fontSize="sm" color="blue.600">
                                                                        {route.count} requests • RM {route.avgFare} avg fare • {route.avgTime} min avg time
                                                                    </Text>
                                                                </VStack>
                                                                <Badge colorScheme="blue" variant="outline" size="lg">
                                                                    #{index + 1}
                                                                </Badge>
                                                            </HStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        </Box>

                                        {/* Vehicle Usage Analysis */}
                                        <Box>
                                            <Heading size="md" mb={4} color="purple.600">Most Used Vehicles</Heading>
                                            <VStack spacing={3} align="stretch">
                                                {getVehicleUsageStats().slice(0, 5).map((vehicle, index) => (
                                                    <Card key={vehicle.vehicleId} variant="outline">
                                                        <CardBody>
                                                            <HStack justify="space-between" align="center">
                                                                <VStack align="start" spacing={1}>
                                                                    <Text fontSize="lg" fontWeight="semibold" color="purple.700">
                                                                        {vehicle.vehicleInfo}
                                                                    </Text>
                                                                    <Text fontSize="sm" color="purple.600">
                                                                        {vehicle.count} requests • RM {vehicle.avgFare} avg fare
                                                                    </Text>
                                                                </VStack>
                                                                <Badge colorScheme="purple" variant="outline" size="lg">
                                                                    #{index + 1}
                                                                </Badge>
                                                            </HStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        </Box>

                                        {/* Status Distribution */}
                                        <Box>
                                            <Heading size="md" mb={4} color="orange.600">Request Status Distribution</Heading>
                                            <VStack spacing={3} align="stretch">
                                                {getStatusDistribution().map((status) => (
                                                    <Card key={status.status} variant="outline">
                                                        <CardBody>
                                                            <HStack justify="space-between" align="center">
                                                                <HStack spacing={4}>
                                                                    <Badge colorScheme={getStatusColor(status.status)} variant="solid" size="lg">
                                                                        {status.status}
                                                                    </Badge>
                                                                    <Text fontSize="lg" color="orange.700">
                                                                        {status.count} requests
                                                                    </Text>
                                                                </HStack>
                                                                <Text fontSize="lg" fontWeight="bold" color="orange.700">
                                                                    {status.percentage}%
                                                                </Text>
                                                            </HStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </VStack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </TabPanel>
                    <TabPanel>
                        <VehicleTab
                            loading={loading.vehicles}
                            error={errors.vehicles}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    </TabPanel>
                    <TabPanel>
                        <StopTab
                            loading={loading.stops}
                            error={errors.stops}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    </TabPanel>
                    <TabPanel>
                        <RouteTab
                            loading={loading.routes}
                            error={errors.routes}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    </TabPanel>

                </TabPanels>
            </Tabs>

            <TransportModal
                isOpen={isOpen}
                onClose={handleModalClose}
                modalType={modalType}
                selectedItem={selectedItem}
                isEditMode={isEditMode}
                onRefresh={handleRefresh}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                itemToDelete={itemToDelete}
                modalType={deleteModalType}
                isDeleting={isDeleting}
            />

            {!isEditMode && selectedItem && (
                // View Details Mode
                <VStack spacing={4} align="stretch" mt={6}>
                    {modalType === 'busSchedule' && (
                        <Box>
                            <Heading size="md" mb={4}>Bus Schedule Details</Heading>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    <Text fontWeight="bold">Vehicle:</Text>
                                    <Text>{selectedItem.vehicleId?.plateNumber || 'N/A'} ({getVehicleTypeLabel(selectedItem.vehicleId?.type)})</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Routes:</Text>
                                    {selectedItem.routeTiming && selectedItem.routeTiming.length > 0 ? (
                                        <VStack align="start" spacing={2}>
                                            {selectedItem.routeTiming.map((route, index) => {
                                                return (
                                                    <Box key={route.routeId._id} p={3} border="1px" borderColor="gray.200" borderRadius="md" w="100%">
                                                        <Text fontWeight="semibold">{route.routeId?.name}</Text>
                                                        <Text fontSize="sm" color="gray.600">
                                                            Duration: {route.estimateTimeMinute} minutes | Fare: RM {route.fare}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600">
                                                            Stops: {route.stopIds?.length || 0} stops
                                                        </Text>
                                                    </Box>
                                                )
                                            })}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.300">No routes assigned</Text>
                                    )}
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Schedule:</Text>
                                    <Text>Day: {getDayLabel(selectedItem.dayActive)}</Text>
                                    <Text>Departure: {formatTime(selectedItem.departureTime)}</Text>
                                    <Text>Arrival: {formatTime(selectedItem.arrivalTime)}</Text>
                                    <Text>Duration: {calculateDuration(selectedItem.departureTime, selectedItem.arrivalTime)}</Text>
                                </Box>
                            </VStack>
                        </Box>
                    )}

                    {modalType === 'vehicle' && (
                        <Box>
                            <Heading size="md" mb={4}>Vehicle Details</Heading>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    <Text fontWeight="bold">Plate Number:</Text>
                                    <Text>{selectedItem.plateNumber}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Type:</Text>
                                    <Badge colorScheme="blue">{getVehicleTypeLabel(selectedItem.type)}</Badge>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Capacity:</Text>
                                    <Text>{selectedItem.capacity} passengers</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Status:</Text>
                                    <Badge colorScheme={getStatusColor(selectedItem.status)}>
                                        {getVehicleStatusLabel(selectedItem.status)}
                                    </Badge>
                                </Box>
                            </VStack>
                        </Box>
                    )}

                    {modalType === 'stop' && (
                        <Box>
                            <Heading size="md" mb={4}>Stop Details</Heading>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    <Text fontWeight="bold">Name:</Text>
                                    <Text>{selectedItem.name}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Type:</Text>
                                    <Badge colorScheme="blue">{getStopTypeLabel(selectedItem.type)}</Badge>
                                </Box>
                                {selectedItem.image && (
                                    <Box>
                                        <Text fontWeight="bold">Image:</Text>
                                        <Box mt={2}>
                                            <img
                                                src={selectedItem.image}
                                                alt={`${selectedItem.name} stop`}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <Text
                                                display="none"
                                                color="gray.500"
                                                fontSize="sm"
                                                style={{ display: 'none' }}
                                            >
                                                Image not available
                                            </Text>
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        </Box>
                    )}

                    {modalType === 'route' && (
                        <Box>
                            <Heading size="md" mb={4}>Route Details</Heading>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    <Text fontWeight="bold">Name:</Text>
                                    <Text>{selectedItem.name}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Duration:</Text>
                                    <Text>{selectedItem.estimateTimeMinute} minutes</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Fare:</Text>
                                    <Text>RM {selectedItem.fare}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Stops:</Text>
                                    {selectedItem.stopIds && selectedItem.stopIds.length > 0 ? (
                                        <VStack align="start" spacing={2}>
                                            {selectedItem.stopIds.map((stop, index) => (
                                                <Box key={stop._id} p={2} border="1px" borderColor="gray.200" borderRadius="md">
                                                    <Text fontSize="sm">
                                                        {index + 1}. {stop.name} ({getStopTypeLabel(stop.type)})
                                                    </Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500">No stops assigned</Text>
                                    )}
                                </Box>
                            </VStack>
                        </Box>
                    )}
                </VStack>
            )}
        </Box>
    );
};

export default TransportationManagement;
