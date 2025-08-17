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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    IconButton,
    Badge,
    VStack,
    HStack,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Text
} from '@chakra-ui/react';
import {
    AddIcon,
    ViewIcon,
    EditIcon,
    DeleteIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../../store/transportation.js';
import { getStopTypeLabel } from './utils';

const StopTab = ({ loading, error, onCreate, onView, onEdit }) => {
    const { stops, deleteStop } = useTransportationStore();

    const handleDelete = async (id) => {
        try {
            const result = await deleteStop(id);
            if (result.success) {
                // Success message will be handled by the store
            }
        } catch (error) {
            console.error('Error deleting stop:', error);
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
                <Heading size="md">Stops</Heading>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => onCreate('stop')}
                >
                    Add Stop
                </Button>
            </Flex>

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
                                                    onClick={() => onView('stop', stop)}
                                                />
                                                <IconButton
                                                    size="sm"
                                                    icon={<EditIcon />}
                                                    aria-label="Edit"
                                                    colorScheme="orange"
                                                    variant="ghost"
                                                    onClick={() => onEdit('stop', stop)}
                                                />
                                                <IconButton
                                                    size="sm"
                                                    icon={<DeleteIcon />}
                                                    aria-label="Delete"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(stop._id)}
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
                        {stops.map((stop) => (
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
                                                    onClick={() => onView('stop', stop)}
                                                />
                                                <IconButton
                                                    size="sm"
                                                    icon={<EditIcon />}
                                                    aria-label="Edit"
                                                    colorScheme="orange"
                                                    variant="ghost"
                                                    onClick={() => onEdit('stop', stop)}
                                                />
                                                <IconButton
                                                    size="sm"
                                                    icon={<DeleteIcon />}
                                                    aria-label="Delete"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(stop._id)}
                                                />
                                            </HStack>
                                        </Box>
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Box>
            </>
        </Box>
    );
};

export default StopTab;
