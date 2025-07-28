import React, { useState } from 'react';
import { Box, Text, Collapse, VStack, HStack, Badge, Grid } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

// Component for rendering individual class item
export const ClassItem = ({ item, getTypeColor }) => (
    <Box
        bg={`${getTypeColor(item.type, item.examType)}.100`}
        borderLeft="3px solid"
        borderLeftColor={`${getTypeColor(item.type, item.examType)}.400`}
        p={2}
        borderRadius="sm"
        mb={1}
        fontSize="xs"
    >
        <Text fontWeight="bold" mb={1}>
            {item.code}
        </Text>
        <Text mb={1} noOfLines={1}>
            {item.subject}
        </Text>
        <Text color="gray.600" noOfLines={1}>
            {item.room}
        </Text>
        {item.lecturer && (
            <Text color="gray.600" noOfLines={1}>
                {item.lecturer}
            </Text>
        )}
    </Box>
);

// Main component that manages the clustering state
export const ClusteredScheduleGrid = ({
    daysOfWeek,
    timeSlots,
    gridBg,
    getItemsForSlot,
    getTypeColor
}) => {
    // State to track expanded clusters - now properly inside a component
    const [expandedClusters, setExpandedClusters] = useState(new Set());

    // Helper function to toggle cluster expansion
    const toggleCluster = (day, time) => {
        const clusterId = `${day}-${time}`;
        const newExpanded = new Set(expandedClusters);

        if (newExpanded.has(clusterId)) {
            newExpanded.delete(clusterId);
        } else {
            newExpanded.add(clusterId);
        }

        setExpandedClusters(newExpanded);
    };

    // Component for clustered classes
    const ClusteredClasses = ({ day, time, slotData }) => {
        const clusterId = `${day}-${time}`;
        const isExpanded = expandedClusters.has(clusterId);
        const { items, count, shouldCluster } = slotData;

        if (count === 0) return null;

        if (!shouldCluster) {
            // Single item, render normally
            return <ClassItem item={items[0]} getTypeColor={getTypeColor} />;
        }

        return (
            <Box>
                {/* Cluster Summary */}
                <Box
                    bg="blue.50"
                    borderLeft="3px solid"
                    borderLeftColor="blue.400"
                    p={2}
                    borderRadius="sm"
                    mb={1}
                    cursor="pointer"
                    onClick={() => toggleCluster(day, time)}
                    _hover={{ bg: "blue.100" }}
                    transition="background-color 0.2s"
                >
                    <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                            <HStack>
                                <Badge colorScheme="blue" size="sm">
                                    {count} Classes
                                </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                                Click to {isExpanded ? 'collapse' : 'expand'}
                            </Text>
                        </VStack>
                        {isExpanded ? (
                            <ChevronUpIcon boxSize={4} color="blue.500" />
                        ) : (
                            <ChevronDownIcon boxSize={4} color="blue.500" />
                        )}
                    </HStack>
                </Box>

                {/* Expanded Classes */}
                <Collapse in={isExpanded} animateOpacity>
                    <VStack spacing={1} align="stretch" pl={2}>
                        {items.map((item) => (
                            <ClassItem
                                key={item.id}
                                item={item}
                                getTypeColor={getTypeColor}
                            />
                        ))}
                    </VStack>
                </Collapse>
            </Box>
        );
    };

    return (
        <Box overflowX="auto">
            <Grid templateColumns="80px repeat(7, 1fr)" gap={1} minW="800px">
                {/* Header Row */}
                <Box />
                {daysOfWeek.map((day) => (
                    <Box
                        key={day}
                        p={3}
                        bg="blue.500"
                        color="white"
                        textAlign="center"
                        fontWeight="bold"
                        fontSize="sm"
                    >
                        {day}
                    </Box>
                ))}

                {/* Time Slots */}
                {timeSlots.map((time) => (
                    <React.Fragment key={time}>
                        <Box
                            p={2}
                            bg="gray.100"
                            textAlign="center"
                            fontSize="sm"
                            fontWeight="medium"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {time}
                        </Box>
                        {daysOfWeek.map((day) => {
                            const slotData = getItemsForSlot(day, time);
                            return (
                                <Box
                                    key={`${day}-${time}`}
                                    minH="60px"
                                    bg={gridBg}
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    p={1}
                                >
                                    <ClusteredClasses
                                        day={day}
                                        time={time}
                                        slotData={slotData}
                                    />
                                </Box>
                            );
                        })}
                    </React.Fragment>
                ))}
            </Grid>
        </Box>
    );
};