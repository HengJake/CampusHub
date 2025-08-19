import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    Badge,
    Button,
    useDisclosure,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Select,
    Textarea,
    FormControl,
    FormLabel,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Flex,
    Icon,
    useColorModeValue,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Grid,
    Divider
} from '@chakra-ui/react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiEye, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import { useServiceStore } from '../../store/service.js';

export default function BugManagement() {
    const [bugReports, setBugReports] = useState([]);
    const [selectedBug, setSelectedBug] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        critical: 0
    });

    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    const { isOpen: isResolveOpen, onOpen: onResolveOpen, onClose: onResolveClose } = useDisclosure();
    const [resolveForm, setResolveForm] = useState({
        status: '',
        priority: '',
        resolution: ''
    });

    const { getAllBugReports, updateBugReport } = useServiceStore();
    const toast = useToast();
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    useEffect(() => {
        fetchBugReports();
    }, []);

    const fetchBugReports = async () => {
        try {
            setIsLoading(true);
            setError('');
            const result = await getAllBugReports();

            if (result.success) {
                const reports = result.data || [];
                setBugReports(reports);
                calculateStats(reports);
            } else {
                setError(result.message || 'Failed to fetch bug reports');
            }
        } catch (err) {
            setError('An error occurred while fetching bug reports: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (reports) => {
        const total = reports.length;
        const pending = reports.filter(r => r.status === 'reported').length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const critical = reports.filter(r => r.priority === 'Critical').length;

        setStats({ total, pending, resolved, critical });
    };

    const handleViewBug = (bug) => {
        setSelectedBug(bug);
        onViewOpen();
    };

    const handleResolveBug = (bug) => {
        setSelectedBug(bug);
        setResolveForm({
            status: bug.status,
            priority: bug.priority,
            resolution: bug.resolution || ''
        });
        onResolveOpen();
    };

    const handleUpdateBug = async () => {
        try {
            if (!selectedBug?._id) return;

            const result = await updateBugReport(selectedBug._id, {
                status: resolveForm.status,
                priority: resolveForm.priority,
                resolution: resolveForm.resolution,
                resolvedAt: resolveForm.status === 'resolved' ? new Date().toISOString() : null
            });

            if (result.success) {
                toast({
                    title: "Bug Report Updated",
                    description: "The bug report has been updated successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onResolveClose();
                fetchBugReports();
            } else {
                throw new Error(result.message || "Failed to update bug report");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update bug report. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "reported":
                return "yellow";
            case "investigating":
                return "blue";
            case "fixing":
                return "orange";
            case "resolved":
                return "green";
            case "closed":
                return "gray";
            default:
                return "gray";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "critical":
                return "red";
            case "high":
                return "orange";
            case "medium":
                return "yellow";
            case "low":
                return "green";
            default:
                return "gray";
        }
    };

    const filteredReports = bugReports.filter(report => {
        if (filter === 'all') return true;
        if (filter === 'pending') return report.status === 'reported';
        if (filter === 'resolved') return report.status === 'resolved';
        if (filter === 'critical') return report.priority === 'Critical';
        return true;
    });

    if (isLoading) {
        return (
            <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.600">Loading bug reports...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box minH="100vh" p={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {/* Header */}
                <Box>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.800" mb={2}>
                        Bug Report Management
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">Review and resolve bug reports from all users</Text>
                </Box>

                {/* Error Display */}
                {error && (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Error loading bug reports</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Box>
                    </Alert>
                )}

                {/* Statistics Cards */}
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: 4, md: 6 }}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Total Reports</StatLabel>
                                <StatNumber color="blue.600">{stats.total}</StatNumber>
                                <StatHelpText>
                                    <StatArrow type="increase" />
                                    All time
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Reported</StatLabel>
                                <StatNumber color="yellow.600">{stats.pending}</StatNumber>
                                <StatHelpText>
                                    <StatArrow type="decrease" />
                                    Need attention
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Resolved</StatLabel>
                                <StatNumber color="green.600">{stats.resolved}</StatNumber>
                                <StatHelpText>
                                    <StatArrow type="increase" />
                                    Completed
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Critical Priority</StatLabel>
                                <StatNumber color="red.600">{stats.critical}</StatNumber>
                                <StatHelpText>
                                    <StatArrow type="decrease" />
                                    High priority
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Filter and Table */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                            {/* Filter Controls */}
                            <VStack spacing={4} align="stretch">
                                <Text fontSize="lg" fontWeight="semibold">
                                    Bug Reports
                                </Text>
                                <HStack spacing={3} justify={{ base: "space-between", md: "flex-end" }} align="center">
                                    <Select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        w={{ base: "150px", md: "200px" }}
                                        size={{ base: "sm", md: "md" }}
                                    >
                                        <option value="all">All Reports</option>
                                        <option value="pending">Reported</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="critical">Critical Priority</option>
                                    </Select>
                                    <Button
                                        leftIcon={<FiTrendingUp />}
                                        variant="outline"
                                        size={{ base: "sm", md: "md" }}
                                        onClick={fetchBugReports}
                                    >
                                        Refresh
                                    </Button>
                                </HStack>
                            </VStack>

                            {/* Reports Table - Desktop */}
                            <Box display={{ base: "none", lg: "block" }}>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>User</Th>
                                                <Th>Priority</Th>
                                                <Th>Status</Th>
                                                <Th>File Path</Th>
                                                <Th>Submitted</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredReports.map((report) => (
                                                <Tr key={report._id}>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="medium">
                                                                {report.userId?.name || report.userId?.email || 'Unknown User'}
                                                            </Text>
                                                            <Text fontSize="sm" color="gray.500">
                                                                {report.userId?.role || 'Unknown Role'}
                                                            </Text>
                                                            {report.userId && (
                                                                <Text fontSize="xs" color="gray.400" fontFamily="mono">
                                                                    ID: {report.userId._id || report.userId}
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getPriorityColor(report.priority)} variant="subtle">
                                                            {report.priority}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getStatusColor(report.status)} variant="subtle">
                                                            {report.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" fontFamily="mono" color="gray.600" maxW="200px" isTruncated>
                                                            {report.errorFile}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" color="gray.600">
                                                            {new Date(report.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="blue"
                                                                variant="ghost"
                                                                leftIcon={<FiEye />}
                                                                onClick={() => handleViewBug(report)}
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="green"
                                                                variant="ghost"
                                                                leftIcon={<FiCheckCircle />}
                                                                onClick={() => handleResolveBug(report)}
                                                            >
                                                                Resolve
                                                            </Button>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            {/* Mobile Card View */}
                            <Box display={{ base: "block", lg: "none" }}>
                                <VStack spacing={4} align="stretch">
                                    {filteredReports.map((report) => (
                                        <Card key={report._id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                                            <CardBody>
                                                <VStack spacing={4} align="stretch">
                                                    {/* User Info */}
                                                    <Box>
                                                        <Text fontWeight="medium" fontSize="md" mb={1}>
                                                            {report.userId?.name || report.userId?.email || 'Unknown User'}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500" mb={1}>
                                                            {report.userId?.role || 'Unknown Role'}
                                                        </Text>
                                                        {report.userId && (
                                                            <Text fontSize="xs" color="gray.400" fontFamily="mono">
                                                                ID: {report.userId._id || report.userId}
                                                            </Text>
                                                        )}
                                                    </Box>

                                                    {/* Priority and Status */}
                                                    <HStack spacing={3} wrap="wrap">
                                                        <Badge colorScheme={getPriorityColor(report.priority)} variant="subtle">
                                                            {report.priority}
                                                        </Badge>
                                                        <Badge colorScheme={getStatusColor(report.status)} variant="subtle">
                                                            {report.status}
                                                        </Badge>
                                                    </HStack>

                                                    {/* File Path */}
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                                                            File Path
                                                        </Text>
                                                        <Text fontSize="sm" fontFamily="mono" color="gray.600" wordBreak="break-all">
                                                            {report.errorFile}
                                                        </Text>
                                                    </Box>

                                                    {/* Submitted Date */}
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                                                            Submitted
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600">
                                                            {new Date(report.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </Box>

                                                    {/* Actions */}
                                                    <HStack spacing={2} justify="center">
                                                        <Button
                                                            size="sm"
                                                            colorScheme="blue"
                                                            variant="outline"
                                                            leftIcon={<FiEye />}
                                                            onClick={() => handleViewBug(report)}
                                                            flex={1}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            colorScheme="green"
                                                            variant="outline"
                                                            leftIcon={<FiCheckCircle />}
                                                            onClick={() => handleResolveBug(report)}
                                                            flex={1}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </VStack>
                            </Box>

                            {filteredReports.length === 0 && (
                                <Box textAlign="center" py={8}>
                                    <Icon as={FiAlertTriangle} boxSize={8} color="gray.400" mb={2} />
                                    <Text color="gray.500">No bug reports found</Text>
                                </Box>
                            )}
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>

            {/* View Bug Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Bug Report Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedBug && (
                            <VStack spacing={{ base: 4, lg: 6 }} align="stretch">
                                {/* User Info */}
                                <Box p={4} bg="gray.50" borderRadius="md">
                                    <VStack align="start" spacing={2}>
                                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                            Reported by: {selectedBug.userId?.name || selectedBug.userId?.email || 'Unknown User'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Role: {selectedBug.userId?.role || 'Unknown Role'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Submitted: {new Date(selectedBug.createdAt).toLocaleString()}
                                        </Text>
                                        {selectedBug.userId && (
                                            <Text fontSize="xs" color="gray.500" fontFamily="mono">
                                                User ID: {selectedBug.userId._id || selectedBug.userId}
                                            </Text>
                                        )}
                                    </VStack>
                                </Box>

                                {/* Priority and Status */}
                                <HStack spacing={4}>
                                    <Badge colorScheme={getPriorityColor(selectedBug.priority)} size="lg">
                                        Priority: {selectedBug.priority}
                                    </Badge>
                                    <Badge colorScheme={getStatusColor(selectedBug.status)} size="lg">
                                        Status: {selectedBug.status}
                                    </Badge>
                                </HStack>

                                {/* Screenshot */}
                                {selectedBug.image && (
                                    <Box>
                                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                                            Screenshot
                                        </Text>
                                        <Image
                                            src={selectedBug.image}
                                            alt="Bug screenshot"
                                            maxH="300px"
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="gray.200"
                                        />
                                    </Box>
                                )}

                                {/* File Path */}
                                <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                                        File Where Error Occurred
                                    </Text>
                                    <Text fontFamily="mono" bg="gray.50" p={3} borderRadius="md">
                                        {selectedBug.errorFile}
                                    </Text>
                                </Box>

                                {/* Console Log */}
                                <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                                        Console Log Message
                                    </Text>
                                    <Text fontFamily="mono" bg="gray.50" p={3} borderRadius="md" whiteSpace="pre-wrap">
                                        {selectedBug.consoleLogMessage}
                                    </Text>
                                </Box>

                                {/* Description */}
                                {selectedBug.description && (
                                    <Box>
                                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                                            Additional Description
                                        </Text>
                                        <Text bg="gray.50" p={3} borderRadius="md">
                                            {selectedBug.description}
                                        </Text>
                                    </Box>
                                )}

                                {/* Resolution */}
                                {selectedBug.resolution && (
                                    <Box>
                                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                                            Resolution
                                        </Text>
                                        <Text bg="green.50" p={3} borderRadius="md" color="green.800">
                                            {selectedBug.resolution}
                                        </Text>
                                    </Box>
                                )}

                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onViewClose}>
                            Close
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={() => {
                                onViewClose();
                                handleResolveBug(selectedBug);
                            }}
                        >
                            Resolve Bug
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Resolve Bug Modal */}
            <Modal isOpen={isResolveOpen} onClose={onResolveClose} size="lg" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Resolve Bug Report</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={resolveForm.status}
                                    onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                                >
                                    <option value="reported">Reported</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="fixing">Fixing</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Priority</FormLabel>
                                <Select
                                    value={resolveForm.priority}
                                    onChange={(e) => setResolveForm({ ...resolveForm, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Resolution Notes</FormLabel>
                                <Textarea
                                    value={resolveForm.resolution}
                                    onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                                    placeholder="Describe how the bug was resolved..."
                                    rows={4}
                                />
                            </FormControl>

                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onResolveClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="green" onClick={handleUpdateBug}>
                            Update Bug Report
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
