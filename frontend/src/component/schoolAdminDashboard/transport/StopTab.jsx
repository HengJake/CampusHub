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
    IconButton,
    Badge,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    Image,
    SimpleGrid
} from '@chakra-ui/react';
import {
    AddIcon,
    ViewIcon,
    EditIcon,
    DeleteIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../../store/transportation.js';
import { getStopTypeLabel } from './utils';

const StopTab = ({ loading, error, onCreate, onView, onEdit, onDelete }) => {
    const { stops } = useTransportationStore();

    const handleDelete = (stop) => {
        if (onDelete) {
            onDelete('stop', stop);
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
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">Stops</Heading>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => onCreate('stop')}
                >
                    Add Stop
                </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                {stops.map((stop) => (
                    <Card key={stop._id} shadow="md" _hover={{ shadow: "lg" }} transition="all 0.2s">

                        {/* Type */}
                        <Box position="absolute" top={2} right={2} zIndex={1000}>
                            <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                                {getStopTypeLabel(stop.type)}
                            </Badge>
                        </Box>


                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                {/* Image Section */}
                                <Box position="relative">

                                    <Text
                                        bg={"rgba(255, 255, 255, 0.3)"}
                                        backdropFilter={"blur(10px)"}
                                        fontWeight="bold"
                                        fontSize="lg"
                                        color="gray.800"
                                        position="absolute"
                                        bottom={2}
                                        left={2}
                                        zIndex={1000}
                                        px={3}
                                        py={2}
                                        borderRadius="md"
                                        border="1px solid rgba(255, 255, 255, 0.2)"
                                        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                                    >
                                        {stop.name}
                                    </Text>

                                    {stop.image ? (
                                        <Image
                                            src={stop.image}
                                            alt={`${stop.name} stop`}
                                            borderRadius="lg"
                                            objectFit="cover"
                                            height="200px"
                                            width="100%"
                                            fallback={
                                                <Box
                                                    height="200px"
                                                    width="100%"
                                                    bg="gray.100"
                                                    borderRadius="lg"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Text color="gray.500" fontSize="sm">
                                                        Image not available
                                                    </Text>
                                                </Box>
                                            }
                                        />
                                    ) : (
                                        <Box
                                            height="200px"
                                            width="100%"
                                            bg="gray.100"
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Text color="gray.500" fontSize="sm">
                                                No image
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {/* Content Section */}
                                <VStack spacing={3} align="stretch">

                                    {/* Actions */}
                                    <HStack spacing={2} justify="center" pt={2}>
                                        <IconButton
                                            size="sm"
                                            icon={<ViewIcon />}
                                            aria-label="View"
                                            colorScheme="blue"
                                            onClick={() => onView('stop', stop)}
                                        />
                                        <IconButton
                                            size="sm"
                                            icon={<EditIcon />}
                                            aria-label="Edit"
                                            colorScheme="orange"
                                            onClick={() => onEdit('stop', stop)}
                                        />
                                        <IconButton
                                            size="sm"
                                            icon={<DeleteIcon />}
                                            aria-label="Delete"
                                            colorScheme="red"
                                            onClick={() => handleDelete(stop)}
                                        />
                                    </HStack>
                                </VStack>
                            </VStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>

            {stops.length === 0 && (
                <Box textAlign="center" py={12}>
                    <Text color="gray.500" fontSize="lg">
                        No stops found. Create your first stop to get started.
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default StopTab;
