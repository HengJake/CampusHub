import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Stack,
    VStack,
    HStack,
    Flex,
    Heading,
    Text,
    IconButton,
    Badge,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SimpleGrid,
    Card,
    CardBody,
    CardHeader,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Divider,
    Container,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Checkbox,
    CheckboxGroup,
    Switch,
    FormHelperText,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon
} from '@chakra-ui/react';
import {
    ViewIcon,
    EditIcon,
    DeleteIcon,
    AddIcon,
    CalendarIcon,
    InfoIcon,
    TimeIcon,
    RepeatIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../store/transportation.js';

const TransportationManagement = () => {
    const {
        busSchedules,
        vehicles,
        stops,
        routes,
        loading,
        errors,
        fetchBusSchedules,
        fetchVehicles,
        fetchStops,
        fetchRoutes,
        createBusSchedule,
        updateBusSchedule,
        deleteBusSchedule,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        createStop,
        updateStop,
        deleteStop,
        createRoute,
        updateRoute,
        deleteRoute
    } = useTransportationStore();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Form states
    const [busScheduleForm, setBusScheduleForm] = useState({
        routeId: [],
        vehicleId: '',
        departureTime: '',
        arrivalTime: '',
        dayActive: 1
    });

    const [vehicleForm, setVehicleForm] = useState({
        plateNumber: '',
        type: 'bus',
        capacity: 1,
        status: 'available'
    });

    const [stopForm, setStopForm] = useState({
        name: '',
        type: 'campus'
    });

    const [routeForm, setRouteForm] = useState({
        name: '',
        stopIds: [],
        estimateTimeMinute: 30,
        fare: 0
    });

    const [selectedRouteIds, setSelectedRouteIds] = useState([]);
    const [selectedStopIds, setSelectedStopIds] = useState([]);

    const daysOfWeek = [
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
        { value: 7, label: 'Sunday' }
    ];

    const vehicleTypes = [
        { value: 'bus', label: 'Bus' },
        { value: 'car', label: 'Car' }
    ];

    const vehicleStatuses = [
        { value: 'available', label: 'Available' },
        { value: 'in_service', label: 'In Service' },
        { value: 'under_maintenance', label: 'Under Maintenance' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const stopTypes = [
        { value: 'dorm', label: 'Dormitory' },
        { value: 'campus', label: 'Campus' },
        { value: 'shopping_mall', label: 'Shopping Mall' },
        { value: 'airport', label: 'Airport' },
        { value: 'train_station', label: 'Train Station' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([
            fetchBusSchedules(),
            fetchVehicles(),
            fetchStops(),
            fetchRoutes()
        ]);
    };

    const handleBusScheduleSubmit = async () => {
        try {
            const formData = {
                ...busScheduleForm,
                routeId: selectedRouteIds
            };

            let result;
            if (isEditMode && selectedItem) {
                result = await updateBusSchedule(selectedItem._id, formData);
            } else {
                result = await createBusSchedule(formData);
            }

            if (result.success) {
                toast({
                    title: isEditMode ? 'Bus Schedule Updated' : 'Bus Schedule Created',
                    description: isEditMode ? 'Bus schedule has been updated successfully.' : 'Bus schedule has been created successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
                resetForms();
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while processing the request.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleVehicleSubmit = async () => {
        try {
            let result;
            if (isEditMode && selectedItem) {
                result = await updateVehicle(selectedItem._id, vehicleForm);
            } else {
                result = await createVehicle(vehicleForm);
            }

            if (result.success) {
                toast({
                    title: isEditMode ? 'Vehicle Updated' : 'Vehicle Created',
                    description: isEditMode ? 'Vehicle has been updated successfully.' : 'Vehicle has been created successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
                resetForms();
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while processing the request.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleStopSubmit = async () => {
        try {
            let result;
            if (isEditMode && selectedItem) {
                result = await updateStop(selectedItem._id, stopForm);
            } else {
                result = await createStop(stopForm);
            }

            if (result.success) {
                toast({
                    title: isEditMode ? 'Stop Updated' : 'Stop Created',
                    description: isEditMode ? 'Stop has been updated successfully.' : 'Stop has been created successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
                resetForms();
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while processing the request.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRouteSubmit = async () => {
        try {
            const formData = {
                ...routeForm,
                stopIds: selectedStopIds
            };

            let result;
            if (isEditMode && selectedItem) {
                result = await updateRoute(selectedItem._id, formData);
            } else {
                result = await createRoute(formData);
            }

            if (result.success) {
                toast({
                    title: isEditMode ? 'Route Updated' : 'Route Created',
                    description: isEditMode ? 'Route has been updated successfully.' : 'Route has been created successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
                resetForms();
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while processing the request.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (type, id) => {
        try {
            let result;
            switch (type) {
                case 'busSchedule':
                    result = await deleteBusSchedule(id);
                    break;
                case 'vehicle':
                    result = await deleteVehicle(id);
                    break;
                case 'stop':
                    result = await deleteStop(id);
                    break;
                case 'route':
                    result = await deleteRoute(id);
                    break;
                default:
                    return;
            }

            if (result.success) {
                toast({
                    title: 'Deleted Successfully',
                    description: `${type} has been deleted successfully.`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const resetForms = () => {
        setBusScheduleForm({
            routeId: [],
            vehicleId: '',
            departureTime: '',
            arrivalTime: '',
            dayActive: 1
        });
        setVehicleForm({
            plateNumber: '',
            type: 'bus',
            capacity: 1,
            status: 'available'
        });
        setStopForm({
            name: '',
            type: 'campus'
        });
        setRouteForm({
            name: '',
            stopIds: [],
            estimateTimeMinute: 30,
            fare: 0
        });
        setSelectedRouteIds([]);
        setSelectedStopIds([]);
        setSelectedItem(null);
        setIsEditMode(false);
    };

    const openCreateModal = (type) => {
        setModalType(type);
        setIsEditMode(false);
        resetForms();
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

        // Populate forms with existing data
        switch (type) {
            case 'busSchedule':
                setBusScheduleForm({
                    routeId: item.routeId?.map(route => route._id) || [],
                    vehicleId: item.vehicleId?._id || '',
                    departureTime: item.departureTime || '',
                    arrivalTime: item.arrivalTime || '',
                    dayActive: item.dayActive || 1
                });
                setSelectedRouteIds(item.routeId?.map(route => route._id) || []);
                break;
            case 'vehicle':
                setVehicleForm({
                    plateNumber: item.plateNumber || '',
                    type: item.type || 'bus',
                    capacity: item.capacity || 1,
                    status: item.status || 'available'
                });
                break;
            case 'stop':
                setStopForm({
                    name: item.name || '',
                    type: item.type || 'campus'
                });
                break;
            case 'route':
                setRouteForm({
                    name: item.name || '',
                    stopIds: item.stopIds?.map(stop => stop._id) || [],
                    estimateTimeMinute: item.estimateTimeMinute || 30,
                    fare: item.fare || 0
                });
                setSelectedStopIds(item.stopIds?.map(stop => stop._id) || []);
                break;
            default:
                break;
        }
        onOpen();
    };

    const getDayLabel = (dayNumber) => {
        const day = daysOfWeek.find(d => d.value === dayNumber);
        return day ? day.label : 'Unknown';
    };

    const getVehicleTypeLabel = (type) => {
        const vehicleType = vehicleTypes.find(t => t.value === type);
        return vehicleType ? vehicleType.label : type;
    };

    const getVehicleStatusLabel = (status) => {
        const vehicleStatus = vehicleStatuses.find(s => s.value === status);
        return vehicleStatus ? vehicleStatus.label : status;
    };

    const getStopTypeLabel = (type) => {
        const stopType = stopTypes.find(t => t.value === type);
        return stopType ? stopType.label : type;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'green';
            case 'in_service':
                return 'blue';
            case 'under_maintenance':
                return 'orange';
            case 'inactive':
                return 'red';
            default:
                return 'gray';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';

        // If it's already a time string like "HH:mm", format it nicely
        if (typeof timeString === 'string' && timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const minute = parseInt(minutes);

            // Convert to 12-hour format with AM/PM
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const displayMinute = minute.toString().padStart(2, '0');

            return `${displayHour}:${displayMinute} ${period}`;
        }

        // If it's a Date object, convert to readable time string
        if (timeString instanceof Date) {
            return timeString.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
            });
        }

        // If it's a number (minutes since midnight), convert to time
        if (typeof timeString === 'number') {
            const hours = Math.floor(timeString / 60);
            const minutes = timeString % 60;
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            const displayMinute = minutes.toString().padStart(2, '0');

            return `${displayHour}:${displayMinute} ${period}`;
        }

        return 'N/A';
    };

    const formatTimeRange = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';

        const start = formatTime(startTime);
        const end = formatTime(endTime);

        if (start === 'N/A' || end === 'N/A') return 'N/A';

        return `${start} - ${end}`;
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';

        let startMinutes, endMinutes;

        // Convert start time to minutes since midnight
        if (typeof startTime === 'string' && startTime.includes(':')) {
            const [hours, minutes] = startTime.split(':');
            startMinutes = parseInt(hours) * 60 + parseInt(minutes);
        } else if (startTime instanceof Date) {
            startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
        } else if (typeof startTime === 'number') {
            startMinutes = startTime;
        } else {
            return 'N/A';
        }

        // Convert end time to minutes since midnight
        if (typeof endTime === 'string' && endTime.includes(':')) {
            const [hours, minutes] = endTime.split(':');
            endMinutes = parseInt(hours) * 60 + parseInt(minutes);
        } else if (endTime instanceof Date) {
            endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
        } else if (typeof endTime === 'number') {
            endMinutes = endTime;
        } else {
            return 'N/A';
        }

        // Handle overnight trips (end time is next day)
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60; // Add 24 hours
        }

        const durationMinutes = endMinutes - startMinutes;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        if (hours === 0) {
            return `${minutes} min`;
        } else if (minutes === 0) {
            return `${hours} hr`;
        } else {
            return `${hours} hr ${minutes} min`;
        }
    };

    return (
        <Box p={6}>
            <Heading size="lg" mb={6}>Transportation Management</Heading>

            <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
                <TabList>
                    <Tab>Bus Schedules</Tab>
                    <Tab>Vehicles</Tab>
                    <Tab>Stops</Tab>
                    <Tab>Routes</Tab>
                </TabList>

                <TabPanels>
                    {/* Bus Schedules Tab */}
                    <TabPanel>
                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md">Bus Schedules</Heading>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={() => openCreateModal('busSchedule')}
                                >
                                    Add Bus Schedule
                                </Button>
                            </Flex>

                            {loading.busSchedules ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="xl" />
                                </Flex>
                            ) : errors.busSchedules ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertTitle>Error!</AlertTitle>
                                    <AlertDescription>{errors.busSchedules}</AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <Box display={{ base: "none", lg: "block" }}>
                                        <TableContainer>
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Vehicle</Th>
                                                        <Th>Departure</Th>
                                                        <Th>Arrival</Th>
                                                        <Th>Duration</Th>
                                                        <Th>Day</Th>
                                                        <Th>Actions</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {busSchedules.map((schedule) => {

                                                        return (
                                                            <Tr key={schedule._id}>
                                                                <Td>{schedule.vehicleId?.plateNumber || 'N/A'}</Td>
                                                                <Td>{formatTime(schedule.departureTime)}</Td>
                                                                <Td>{formatTime(schedule.arrivalTime)}</Td>
                                                                <Td>{calculateDuration(schedule.departureTime, schedule.arrivalTime)}</Td>
                                                                <Td>{getDayLabel(schedule.dayActive)}</Td>
                                                                <Td>
                                                                    <HStack spacing={2}>
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<ViewIcon />}
                                                                            aria-label="View"
                                                                            colorScheme="blue"
                                                                            variant="ghost"
                                                                            onClick={() => openViewModal('busSchedule', schedule)}
                                                                        />
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<EditIcon />}
                                                                            aria-label="Edit"
                                                                            colorScheme="orange"
                                                                            variant="ghost"
                                                                            onClick={() => openEditModal('busSchedule', schedule)}
                                                                        />
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<DeleteIcon />}
                                                                            aria-label="Delete"
                                                                            colorScheme="red"
                                                                            variant="ghost"
                                                                            onClick={() => handleDelete('busSchedule', schedule._id)}
                                                                        />
                                                                    </HStack>
                                                                </Td>
                                                            </Tr>
                                                        )
                                                    })}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Box>

                                    {/* Mobile Accordion View */}
                                    <Box display={{ base: "block", lg: "none" }}>
                                        <Accordion allowMultiple>
                                            {busSchedules.map((schedule) => {
                                                if (!schedule) return null;

                                                return (
                                                    <AccordionItem key={schedule._id}>
                                                        <h2>
                                                            <AccordionButton>
                                                                <Box as="span" flex="1" textAlign="left">
                                                                    <Text fontWeight="medium">{schedule.vehicleId?.plateNumber || 'N/A'}</Text>
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        {formatTimeRange(schedule.departureTime, schedule.arrivalTime)}
                                                                    </Text>
                                                                </Box>
                                                                <AccordionIcon />
                                                            </AccordionButton>
                                                        </h2>
                                                        <AccordionPanel pb={4}>
                                                            <VStack spacing={3} align="stretch">
                                                                <Box>
                                                                    <Text fontWeight="semibold">Vehicle:</Text>
                                                                    <Text>{schedule.vehicleId?.plateNumber || 'N/A'}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Departure Time:</Text>
                                                                    <Text>{formatTime(schedule.departureTime)}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Arrival Time:</Text>
                                                                    <Text>{formatTime(schedule.arrivalTime)}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Duration:</Text>
                                                                    <Text>{calculateDuration(schedule.departureTime, schedule.arrivalTime)}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Operating Day:</Text>
                                                                    <Text>{getDayLabel(schedule.dayActive)}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Actions:</Text>
                                                                    <HStack spacing={2}>
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<ViewIcon />}
                                                                            aria-label="View"
                                                                            colorScheme="blue"
                                                                            variant="ghost"
                                                                            onClick={() => openViewModal('busSchedule', schedule)}
                                                                        />
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<EditIcon />}
                                                                            aria-label="Edit"
                                                                            colorScheme="orange"
                                                                            variant="ghost"
                                                                            onClick={() => openEditModal('busSchedule', schedule)}
                                                                        />
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<DeleteIcon />}
                                                                            aria-label="Delete"
                                                                            colorScheme="red"
                                                                            variant="ghost"
                                                                            onClick={() => handleDelete('busSchedule', schedule._id)}
                                                                        />
                                                                    </HStack>
                                                                </Box>
                                                            </VStack>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Vehicles Tab */}
                    <TabPanel>
                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md">Vehicles</Heading>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={() => openCreateModal('vehicle')}
                                >
                                    Add Vehicle
                                </Button>
                            </Flex>

                            {loading.vehicles ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="xl" />
                                </Flex>
                            ) : errors.vehicles ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertTitle>Error!</AlertTitle>
                                    <AlertDescription>{errors.vehicles}</AlertDescription>
                                </Alert>
                            ) : (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                    {vehicles.map((vehicle) => (
                                        <Card key={vehicle._id}>
                                            <CardHeader>
                                                <Flex justify="space-between" align="center">
                                                    <Heading size="sm">{vehicle.plateNumber}</Heading>
                                                    <Badge colorScheme={getStatusColor(vehicle.status)}>
                                                        {getVehicleStatusLabel(vehicle.status)}
                                                    </Badge>
                                                </Flex>
                                            </CardHeader>
                                            <CardBody>
                                                <VStack align="start" spacing={2}>
                                                    <Text><strong>Type:</strong> {getVehicleTypeLabel(vehicle.type)}</Text>
                                                    <Text><strong>Capacity:</strong> {vehicle.capacity} passengers</Text>
                                                    <HStack spacing={2}>
                                                        <IconButton
                                                            size="sm"
                                                            icon={<ViewIcon />}
                                                            aria-label="View"
                                                            colorScheme="blue"
                                                            variant="ghost"
                                                            onClick={() => openViewModal('vehicle', vehicle)}
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            icon={<EditIcon />}
                                                            aria-label="Edit"
                                                            colorScheme="orange"
                                                            variant="ghost"
                                                            onClick={() => openEditModal('vehicle', vehicle)}
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            icon={<DeleteIcon />}
                                                            aria-label="Delete"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => handleDelete('vehicle', vehicle._id)}
                                                        />
                                                    </HStack>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Stops Tab */}
                    <TabPanel>
                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md">Stops</Heading>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={() => openCreateModal('stop')}
                                >
                                    Add Stop
                                </Button>
                            </Flex>

                            {loading.stops ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="xl" />
                                </Flex>
                            ) : errors.stops ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertTitle>Error!</AlertTitle>
                                    <AlertDescription>{errors.stops}</AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <Box display={{ base: "none", lg: "block" }}>
                                        <TableContainer>
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Name</Th>
                                                        <Th>Type</Th>
                                                        <Th>Actions</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {stops.map((stop) => (
                                                        <Tr key={stop._id}>
                                                            <Td>{stop.name}</Td>
                                                            <Td>
                                                                <Badge colorScheme="blue">
                                                                    {getStopTypeLabel(stop.type)}
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                <HStack spacing={2}>
                                                                    <IconButton
                                                                        size="sm"
                                                                        icon={<ViewIcon />}
                                                                        aria-label="View"
                                                                        colorScheme="blue"
                                                                        variant="ghost"
                                                                        onClick={() => openViewModal('stop', stop)}
                                                                    />
                                                                    <IconButton
                                                                        size="sm"
                                                                        icon={<EditIcon />}
                                                                        aria-label="Edit"
                                                                        colorScheme="orange"
                                                                        variant="ghost"
                                                                        onClick={() => openEditModal('stop', stop)}
                                                                    />
                                                                    <IconButton
                                                                        size="sm"
                                                                        icon={<DeleteIcon />}
                                                                        aria-label="Delete"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={() => handleDelete('stop', stop._id)}
                                                                    />
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Box>

                                    {/* Mobile Accordion View */}
                                    <Box display={{ base: "block", lg: "none" }}>
                                        <Accordion allowMultiple>
                                            {stops.map((stop) => {
                                                if (!stop) return null;

                                                return (
                                                    <AccordionItem key={stop._id}>
                                                        <h2>
                                                            <AccordionButton>
                                                                <Box as="span" flex="1" textAlign="left">
                                                                    <Text fontWeight="medium">{stop.name}</Text>
                                                                    <Badge colorScheme="blue">
                                                                        {getStopTypeLabel(stop.type)}
                                                                    </Badge>
                                                                </Box>
                                                                <AccordionIcon />
                                                            </AccordionButton>
                                                        </h2>
                                                        <AccordionPanel pb={4}>
                                                            <VStack spacing={3} align="stretch">
                                                                <Box>
                                                                    <Text fontWeight="semibold">Name:</Text>
                                                                    <Text>{stop.name}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Type:</Text>
                                                                    <Badge colorScheme="blue">
                                                                        {getStopTypeLabel(stop.type)}
                                                                    </Badge>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="semibold">Actions:</Text>
                                                                    <HStack spacing={2}>
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<ViewIcon />}
                                                                            aria-label="View"
                                                                            colorScheme="blue"
                                                                            variant="ghost"
                                                                            onClick={() => openViewModal('stop', stop)}
                                                                        />
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<EditIcon />}
                                                                            aria-label="Edit"
                                                                            colorScheme="orange"
                                                                            variant="ghost"
                                                                            onClick={() => openEditModal('stop', stop)}
                                                                        />
                                                                        <IconButton
                                                                            size="sm"
                                                                            icon={<DeleteIcon />}
                                                                            aria-label="Delete"
                                                                            colorScheme="red"
                                                                            variant="ghost"
                                                                            onClick={() => handleDelete('stop', stop._id)}
                                                                        />
                                                                    </HStack>
                                                                </Box>
                                                            </VStack>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Routes Tab */}
                    <TabPanel>
                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md">Routes</Heading>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={() => openCreateModal('route')}
                                >
                                    Add Route
                                </Button>
                            </Flex>

                            {loading.routes ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="xl" />
                                </Flex>
                            ) : errors.routes ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertTitle>Error!</AlertTitle>
                                    <AlertDescription>{errors.routes}</AlertDescription>
                                </Alert>
                            ) : (
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    {routes.map((route) => (
                                        <Card key={route._id}>
                                            <CardHeader>
                                                <Heading size="sm">{route.name}</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <VStack align="start" spacing={2}>
                                                    <Text><strong>Stops:</strong> {route.stopIds?.length || 0} stops</Text>
                                                    <Text><strong>Duration:</strong> {route.estimateTimeMinute} minutes</Text>
                                                    <Text><strong>Fare:</strong> RM {route.fare}</Text>
                                                    <HStack spacing={2}>
                                                        <IconButton
                                                            size="sm"
                                                            icon={<ViewIcon />}
                                                            aria-label="View"
                                                            colorScheme="blue"
                                                            variant="ghost"
                                                            onClick={() => openViewModal('route', route)}
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            icon={<EditIcon />}
                                                            aria-label="Edit"
                                                            colorScheme="orange"
                                                            variant="ghost"
                                                            onClick={() => openEditModal('route', route)}
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            icon={<DeleteIcon />}
                                                            aria-label="Delete"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => handleDelete('route', route._id)}
                                                        />
                                                    </HStack>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>

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
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => { onClose(); resetForms(); }}>
                            {!isEditMode && selectedItem ? 'Close' : 'Cancel'}
                        </Button>
                        {isEditMode ? (
                            <Button
                                colorScheme="blue"
                                onClick={() => {
                                    switch (modalType) {
                                        case 'busSchedule':
                                            handleBusScheduleSubmit();
                                            break;
                                        case 'vehicle':
                                            handleVehicleSubmit();
                                            break;
                                        case 'stop':
                                            handleStopSubmit();
                                            break;
                                        case 'route':
                                            handleRouteSubmit();
                                            break;
                                        default:
                                            break;
                                    }
                                }}
                             >
                                 Update
                             </Button>
                         ) : (
                             <Button
                                 colorScheme="blue"
                                 onClick={() => {
                                     switch (modalType) {
                                         case 'busSchedule':
                                             handleBusScheduleSubmit();
                                             break;
                                         case 'vehicle':
                                             handleVehicleSubmit();
                                             break;
                                         case 'stop':
                                             handleStopSubmit();
                                             break;
                                         case 'route':
                                             handleRouteSubmit();
                                             break;
                                         default:
                                             break;
                                     }
                                 }}
                             >
                                 Create
                             </Button>
                         )}
                     </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TransportationManagement;
