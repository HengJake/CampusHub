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
    Badge
} from '@chakra-ui/react';
import { useTransportationStore } from '../../store/transportation.js';

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
        fetchRoutesBySchoolId
    } = useTransportationStore();

    const { isAuthenticated, schoolId } = useAuthStore();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [dataLoaded, setDataLoaded] = useState({
        busSchedules: false,
        vehicles: false,
        stops: false,
        routes: false
    });
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Load data based on active tab
    const loadTabData = async (tabIndex) => {
        // Check if user is authenticated first
        if (!isAuthenticated || !schoolId) {
            return;
        }

        const tabDataMap = {
            0: { key: 'busSchedules', fetchFn: fetchBusSchedulesBySchoolId },
            1: { key: 'vehicles', fetchFn: fetchVehiclesBySchoolId },
            2: { key: 'stops', fetchFn: fetchStopsBySchoolId },
            3: { key: 'routes', fetchFn: fetchRoutesBySchoolId }
        };

        const tabData = tabDataMap[tabIndex];

        if (tabData && !dataLoaded[tabData.key]) {
            try {
                const result = await tabData.fetchFn();

                if (result.success) {
                    setDataLoaded(prev => ({ ...prev, [tabData.key]: true }));
                }
            } catch (error) {
                // Handle error silently or add proper error handling
            }
        }
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

    return (
        <Box>
            <Heading size="lg" mb={6}>Transportation Management</Heading>

            <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={handleTabChange}>
                <TabList>
                    <Tab>Bus Schedules</Tab>
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
                        />
                    </TabPanel>
                    <TabPanel>
                        <VehicleTab
                            loading={loading.vehicles}
                            error={errors.vehicles}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
                        />
                    </TabPanel>
                    <TabPanel>
                        <StopTab
                            loading={loading.stops}
                            error={errors.stops}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
                        />
                    </TabPanel>
                    <TabPanel>
                        <RouteTab
                            loading={loading.routes}
                            error={errors.routes}
                            onCreate={openCreateModal}
                            onView={openViewModal}
                            onEdit={openEditModal}
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
                                    {selectedItem.routeId && selectedItem.routeId.length > 0 ? (
                                        <VStack align="start" spacing={2}>
                                            {selectedItem.routeId.map((route, index) => (
                                                <Box key={route._id} p={3} border="1px" borderColor="gray.200" borderRadius="md" w="100%">
                                                    <Text fontWeight="semibold">{route.name}</Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Duration: {route.estimateTimeMinute} minutes | Fare: RM {route.fare}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Stops: {route.stopIds?.length || 0} stops
                                                    </Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500">No routes assigned</Text>
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
