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
    Text
} from '@chakra-ui/react';
import { useTransportationStore } from '../../store/transportation.js';

// Import tab components directly
import BusScheduleTab from '../../component/schoolAdminDashboard/transport/BusScheduleTab';
import VehicleTab from '../../component/schoolAdminDashboard/transport/VehicleTab';
import StopTab from '../../component/schoolAdminDashboard/transport/StopTab';
import RouteTab from '../../component/schoolAdminDashboard/transport/RouteTab';
import TransportModal from '../../component/schoolAdminDashboard/transport/TransportModal';

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
        fetchBusSchedules,
        fetchVehicles,
        fetchStops,
        fetchRoutes
    } = useTransportationStore();

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
        const tabDataMap = {
            0: { key: 'busSchedules', fetchFn: fetchBusSchedules },
            1: { key: 'vehicles', fetchFn: fetchVehicles },
            2: { key: 'stops', fetchFn: fetchStops },
            3: { key: 'routes', fetchFn: fetchRoutes }
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
        <Box p={6}>
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

            {/* Create/Edit Modal */}
            <Modal isOpen={isOpen} onClose={() => { onClose(); resetForms(); }} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {modalType === 'busSchedule' && (
                            isEditMode ? 'Edit Bus Schedule' :
                                selectedItem ? 'View Bus Schedule' : 'Add Bus Schedule'
                        )}
                        {modalType === 'vehicle' && (
                            isEditMode ? 'Edit Vehicle' :
                                selectedItem ? 'View Vehicle' : 'Add Vehicle'
                        )}
                        {modalType === 'stop' && (
                            isEditMode ? 'Edit Stop' :
                                selectedItem ? 'View Stop' : 'Add Stop'
                        )}
                        {modalType === 'route' && (
                            isEditMode ? 'Edit Route' :
                                selectedItem ? 'View Route' : 'Add Route'
                        )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {!isEditMode && selectedItem && (
                            // View Details Mode
                            <VStack spacing={4} align="stretch">
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

                                                 {isEditMode || !selectedItem ? (
                             // Edit Mode or Create Mode - Show forms
                             <VStack spacing={4}>
                                {modalType === 'busSchedule' && (
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Routes</FormLabel>
                                            <VStack align="start" spacing={2} maxH="200px" overflowY="auto" w="100%">
                                                {routes.map((route) => (
                                                    <Checkbox
                                                        key={route._id}
                                                        isChecked={selectedRouteIds.includes(route._id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedRouteIds([...selectedRouteIds, route._id]);
                                                            } else {
                                                                setSelectedRouteIds(selectedRouteIds.filter(id => id !== route._id));
                                                            }
                                                        }}
                                                    >
                                                        {route.name} - {route.estimateTimeMinute} min, RM {route.fare}
                                                    </Checkbox>
                                                ))}
                                            </VStack>
                                            <FormHelperText>Select multiple routes for this schedule</FormHelperText>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Vehicle</FormLabel>
                                            <Select
                                                placeholder="Select vehicle"
                                                value={busScheduleForm.vehicleId}
                                                onChange={(e) => setBusScheduleForm({ ...busScheduleForm, vehicleId: e.target.value })}
                                            >
                                                {vehicles.map((vehicle) => (
                                                    <option key={vehicle._id} value={vehicle._id}>
                                                        {vehicle.plateNumber} ({getVehicleTypeLabel(vehicle.type)})
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Day Active</FormLabel>
                                            <Select
                                                value={busScheduleForm.dayActive}
                                                onChange={(e) => setBusScheduleForm({ ...busScheduleForm, dayActive: parseInt(e.target.value) })}
                                            >
                                                {daysOfWeek.map((day) => (
                                                    <option key={day.value} value={day.value}>
                                                        {day.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Departure Time</FormLabel>
                                            <Input
                                                type="time"
                                                value={busScheduleForm.departureTime}
                                                onChange={(e) => setBusScheduleForm({ ...busScheduleForm, departureTime: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Arrival Time</FormLabel>
                                            <Input
                                                type="time"
                                                value={busScheduleForm.arrivalTime}
                                                onChange={(e) => setBusScheduleForm({ ...busScheduleForm, arrivalTime: e.target.value })}
                                            />
                                        </FormControl>
                                    </VStack>
                                )}

                                {modalType === 'vehicle' && (
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Plate Number</FormLabel>
                                            <Input
                                                placeholder="Enter plate number"
                                                value={vehicleForm.plateNumber}
                                                onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                value={vehicleForm.type}
                                                onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                                            >
                                                {vehicleTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Capacity</FormLabel>
                                            <NumberInput
                                                min={1}
                                                value={vehicleForm.capacity}
                                                onChange={(value) => setVehicleForm({ ...vehicleForm, capacity: parseInt(value) })}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                value={vehicleForm.status}
                                                onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}
                                            >
                                                {vehicleStatuses.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </VStack>
                                )}

                                {modalType === 'stop' && (
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Stop Name</FormLabel>
                                            <Input
                                                placeholder="Enter stop name"
                                                value={stopForm.name}
                                                onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                value={stopForm.type}
                                                onChange={(e) => setStopForm({ ...stopForm, type: e.target.value })}
                                            >
                                                {stopTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </VStack>
                                )}

                                {modalType === 'route' && (
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Route Name</FormLabel>
                                            <Input
                                                placeholder="Enter route name"
                                                value={routeForm.name}
                                                onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Stops</FormLabel>
                                            <VStack align="start" spacing={2} maxH="200px" overflowY="auto" w="100%">
                                                {stops.map((stop) => (
                                                    <Checkbox
                                                        key={stop._id}
                                                        isChecked={selectedStopIds.includes(stop._id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedStopIds([...selectedStopIds, stop._id]);
                                                            } else {
                                                                setSelectedStopIds(selectedStopIds.filter(id => id !== stop._id));
                                                            }
                                                        }}
                                                    >
                                                        {stop.name} ({getStopTypeLabel(stop.type)})
                                                    </Checkbox>
                                                ))}
                                            </VStack>
                                            <FormHelperText>Select multiple stops for the route</FormHelperText>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Estimated Time (minutes)</FormLabel>
                                            <NumberInput
                                                min={1}
                                                value={routeForm.estimateTimeMinute}
                                                onChange={(value) => setRouteForm({ ...routeForm, estimateTimeMinute: parseInt(value) })}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Fare (RM)</FormLabel>
                                            <NumberInput
                                                min={0}
                                                step={0.50}
                                                value={routeForm.fare}
                                                onChange={(value) => setRouteForm({ ...routeForm, fare: parseFloat(value) })}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                    </VStack>
                                )}
                            </VStack>
                        ) : null}
                    </ModalBody>


        </Box>
    );
};

export default TransportationManagement;
