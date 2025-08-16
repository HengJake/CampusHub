import React from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Badge,
    Text,
    VStack,
    HStack,
    IconButton
} from '@chakra-ui/react';
import {
    AddIcon,
    ViewIcon,
    EditIcon,
    DeleteIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../../store/transportation.js';
import { getVehicleTypeLabel, getVehicleStatusLabel, getStatusColor } from './utils';

const VehicleTab = ({ loading, error, onCreate, onView, onEdit }) => {
    const { vehicles, deleteVehicle } = useTransportationStore();

    const handleDelete = async (id) => {
        try {
            const result = await deleteVehicle(id);
            if (result.success) {
                // Success message will be handled by the store
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" p={8}>
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Vehicles</Heading>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => onCreate('vehicle')}
                >
                    Add Vehicle
                </Button>
            </Flex>

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
                                        onClick={() => onView('vehicle', vehicle)}
                                    />
                                    <IconButton
                                        size="sm"
                                        icon={<EditIcon />}
                                        aria-label="Edit"
                                        colorScheme="orange"
                                        variant="ghost"
                                        onClick={() => onEdit('vehicle', vehicle)}
                                    />
                                    <IconButton
                                        size="sm"
                                        icon={<DeleteIcon />}
                                        aria-label="Delete"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleDelete(vehicle._id)}
                                    />
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default VehicleTab;
