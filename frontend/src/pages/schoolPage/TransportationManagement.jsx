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

        </Box>
    );
};

export default TransportationManagement;
