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
        deleteBusSchedule,
        deleteVehicle,
        deleteStop,
        deleteRoute
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

    // Delete confirmation modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteModalType, setDeleteModalType] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Function to refresh data based on modal type
    const handleRefresh = async () => {
        try {
            console.log('🔄 Starting refresh for modal type:', modalType);

            // Add a small delay to ensure server-side operations are complete
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (modalType) {
                case 'busSchedule':
                    console.log('🔄 Refreshing bus schedules...');
                    const busResult = await fetchBusSchedulesBySchoolId({}, true); // Force refresh
                    console.log('🔄 Bus schedules refresh result:', busResult);
                    setDataLoaded(prev => ({ ...prev, busSchedules: true }));
                    break;
                case 'vehicle':
                    console.log('🔄 Refreshing vehicles...');
                    const vehicleResult = await fetchVehiclesBySchoolId({}, true); // Force refresh
                    console.log('🔄 Vehicles refresh result:', vehicleResult);
                    setDataLoaded(prev => ({ ...prev, vehicles: true }));
                    break;
                case 'stop':
                    console.log('🔄 Refreshing stops...');
                    const stopResult = await fetchStopsBySchoolId({}, true); // Force refresh
                    console.log('🔄 Stops refresh result:', stopResult);
                    setDataLoaded(prev => ({ ...prev, stops: true }));
                    break;
                case 'route':
                    console.log('🔄 Refreshing routes...');
                    const routeResult = await fetchRoutesBySchoolId({}, true); // Force refresh
                    console.log('🔄 Routes refresh result:', routeResult);
                    setDataLoaded(prev => ({ ...prev, routes: true }));
                    break;
                default:
                    console.log('🔄 Unknown modal type for refresh:', modalType);
                    break;
            }

            console.log('🔄 Refresh completed successfully');
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
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
            console.error('Error during delete process:', error);
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
