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
import { getStopTypeLabel } from './utils';

const RouteTab = ({ loading, error, onCreate, onView, onEdit }) => {
    const { routes, deleteRoute } = useTransportationStore();

    const handleDelete = async (id) => {
        try {
            const result = await deleteRoute(id);
            if (result.success) {
                // Success message will be handled by the store
            }
        } catch (error) {
            console.error('Error deleting route:', error);
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
                <Heading size="md">Routes</Heading>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => onCreate('route')}
                >
                    Add Route
                </Button>
            </Flex>

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
                                        onClick={() => onView('route', route)}
                                    />
                                    <IconButton
                                        size="sm"
                                        icon={<EditIcon />}
                                        aria-label="Edit"
                                        colorScheme="orange"
                                        variant="ghost"
                                        onClick={() => onEdit('route', route)}
                                    />
                                    <IconButton
                                        size="sm"
                                        icon={<DeleteIcon />}
                                        aria-label="Delete"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleDelete(route._id)}
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

export default RouteTab;
