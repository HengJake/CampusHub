import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Badge,
    IconButton,
    Collapse,
    useColorModeValue,
    useToast,
    Icon,
    Spinner,
} from '@chakra-ui/react';
import {
    FaBell,
    FaCar,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
    FaClock
} from 'react-icons/fa';
import { useTransportationStore } from '../../store/transportation.js';
import { useAuthStore } from '../../store/auth.js';

export function EHailingNotification() {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { eHailings, fetchEHailingsByStudentId } = useTransportationStore();
    const { currentUser, isAuthenticated } = useAuthStore();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const shadowColor = useColorModeValue('lg', 'dark-lg');
    const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
    const summaryBgColor = useColorModeValue('gray.50', 'gray.700');

    const checkPendingRequests = async () => {
        if (!currentUser?.student._id) return;

        setIsLoading(true);
        try {
            await fetchEHailingsByStudentId(currentUser.student._id);
        } catch (error) {
            console.error('Error fetching e-hailing requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && currentUser?.student._id) {
            checkPendingRequests();
        }
    }, [isAuthenticated, currentUser, eHailings]);

    useEffect(() => {
        if (eHailings && eHailings.length > 0) {
            const pending = eHailings.filter(request =>
                request.status === 'waiting' || request.status === 'pending'
            );

            if (pending.length > 0) {
                setPendingRequests(pending);
                setIsVisible(true);
                // Auto-hide after 10 seconds
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 10000);

                return () => clearTimeout(timer);
            } else {
                setIsVisible(false);
            }
        } else {
            setIsVisible(false);
        }
    }, [eHailings]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'waiting':
                return 'yellow';
            case 'pending':
                return 'orange';
            case 'in_progress':
                return 'blue';
            case 'completed':
                return 'green';
            case 'cancelled':
                return 'red';
            default:
                return 'gray';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isVisible || !isAuthenticated || !currentUser?.student._id) {
        return null;
    }

    return (
        <Box
            position="fixed"
            top="20px"
            right="20px"
            zIndex={1000}
            maxW="350px"
            w="full"
        >
            <Box
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                boxShadow={shadowColor}
                overflow="hidden"
                animation="slideInRight 0.3s ease-out"
            >
                {/* Header */}
                <HStack
                    bg="blue.500"
                    color="white"
                    p={3}
                    justify="space-between"
                    align="center"
                >
                    <HStack spacing={2}>
                        <Icon as={FaBell} />
                        <Text fontSize="sm" fontWeight="semibold">
                            E-Hailing Notifications
                        </Text>
                        <Badge colorScheme="yellow" variant="solid" size="sm">
                            {pendingRequests.length}
                        </Badge>
                    </HStack>
                    <HStack spacing={1}>
                        <IconButton
                            size="sm"
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                            icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            onClick={toggleExpand}
                            aria-label="Toggle notification details"
                        />
                        <IconButton
                            size="sm"
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                            icon={<FaTimes />}
                            onClick={handleClose}
                            aria-label="Close notification"
                        />
                    </HStack>
                </HStack>

                {/* Content */}
                <Collapse in={isExpanded} animateOpacity>
                    <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
                        {isLoading ? (
                            <Box p={4} textAlign="center">
                                <Spinner size="sm" color="blue.500" />
                                <Text fontSize="xs" color="gray.500" mt={2}>
                                    Loading requests...
                                </Text>
                            </Box>
                        ) : pendingRequests.length > 0 ? (
                            pendingRequests.map((request, index) => {


                                return (
                                    <Box
                                        key={request._id || index}
                                        p={3}
                                        borderBottom="1px solid"
                                        borderColor={borderColor}
                                        _last={{ borderBottom: 'none' }}
                                        _hover={{ bg: hoverBgColor }}
                                    >
                                        <VStack align="start" spacing={2}>
                                            <HStack justify="space-between" w="full">
                                                <HStack spacing={2}>
                                                    <Icon as={FaCar} color="blue.500" />
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {request.routeId?.name || 'Route'}
                                                    </Text>
                                                </HStack>
                                                <Badge
                                                    colorScheme={getStatusColor(request.status)}
                                                    variant="subtle"
                                                    size="sm"
                                                >
                                                    {request.status}
                                                </Badge>
                                            </HStack>

                                            <HStack spacing={2} align="center" fontSize="xs" color="gray.600">
                                                <Icon as={FaClock} />
                                                <Text>
                                                    Requested: {formatTime(request.requestAt)}
                                                </Text>
                                            </HStack>

                                            {request.routeId && (
                                                <Text fontSize="xs" color="gray.600">
                                                    Est. Time: {request.routeId.estimateTimeMinute || 'N/A'} min
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>
                                )
                            })
                        ) : (
                            <Box p={4} textAlign="center">
                                <Text fontSize="sm" color="gray.500">
                                    No pending requests
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </Collapse>

                {/* Summary (always visible) */}
                {!isExpanded && (
                    <Box p={3} bg={summaryBgColor}>
                        <HStack justify="space-between" align="center">
                            <Text fontSize="sm" color="gray.600">
                                {pendingRequests.length} pending e-hailing request{pendingRequests.length !== 1 ? 's' : ''}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Click to expand
                            </Text>
                        </HStack>
                    </Box>
                )}
            </Box>

            <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </Box>
    );
}
