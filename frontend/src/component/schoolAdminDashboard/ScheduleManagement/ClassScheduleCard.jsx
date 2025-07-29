import React, { useState } from 'react';
import { Box, Text, Collapse, VStack, HStack, Badge, Grid } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

// Component for rendering individual class item
export const ClassItem = ({ item, getTypeColor, rowSpan = 1 }) => (
    <Box
        bg={`${getTypeColor(item.type, item.examType)}.100`}
        borderLeft="3px solid"
        borderLeftColor={`${getTypeColor(item.type, item.examType)}.400`}
        p={2}
        borderRadius="sm"
        mb={1}
        fontSize="xs"
        gridRow={rowSpan > 1 ? `span ${rowSpan}` : undefined}
        display="flex"
        flexDirection="column"
        justifyContent="center"
    >
        <Text fontWeight="bold" mb={1}>
            {item.code}
        </Text>
        <Text mb={1} noOfLines={2}>
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

// Helper function to find consecutive classes
const findConsecutiveClasses = (items, timeSlots) => {
    const consecutiveGroups = new Map();

    items.forEach(item => {
        const timeIndex = timeSlots.indexOf(item.time);
        if (timeIndex === -1) return;

        const key = `${item.day}-${item.code}-${item.subject}`;

        if (!consecutiveGroups.has(key)) {
            consecutiveGroups.set(key, {
                item,
                startIndex: timeIndex,
                endIndex: timeIndex,
                timeSlots: [item.time]
            });
        } else {
            const group = consecutiveGroups.get(key);
            if (timeIndex === group.endIndex + 1) {
                group.endIndex = timeIndex;
                group.timeSlots.push(item.time);
            }
        }
    });

    return consecutiveGroups;
};

// Main component that manages the clustering state
export const ClusteredScheduleGrid = ({
    daysOfWeek,
    timeSlots,
    gridBg,
    getItemsForSlot,
    getTypeColor,
    allItems = [], // Add this prop to pass all schedule items
    filter,
}) => {
    // State to track expanded clusters
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

    // Find consecutive classes for merging
    const consecutiveGroups = findConsecutiveClasses(allItems, timeSlots);
    const mergedSlots = new Set(); // Track which slots are part of merged cells

    // Component for clustered classes
    const ClusteredClasses = ({ day, time, slotData }) => {
        const clusterId = `${day}-${time}`;
        const isExpanded = expandedClusters.has(clusterId);
        const { items, count, shouldCluster } = slotData;

        if (count === 0) return null;

        // Check if this slot should be skipped (part of a merged cell)
        if (mergedSlots.has(`${day}-${time}`)) {
            return null;
        }

        // console.log(items)

        if (!shouldCluster) {
            // Single item - check if it's part of a consecutive group
            const item = items[0];
            const groupKey = `${day}-${item.code}-${item.subject}`;
            const group = consecutiveGroups.get(groupKey);

            if (group && group.timeSlots.length > 1 && group.timeSlots[0] === time) {
                // This is the start of a merged cell
                const rowSpan = group.timeSlots.length;

                // Mark subsequent slots as merged
                for (let i = 1; i < group.timeSlots.length; i++) {
                    mergedSlots.add(`${day}-${group.timeSlots[i]}`);
                }

                return (
                    <ClassItem
                        item={item}
                        getTypeColor={getTypeColor}
                        rowSpan={rowSpan}
                    />
                );
            } else if (group && group.timeSlots[0] !== time) {
                // This slot is part of a merged cell but not the first one
                return null;
            }

            // Regular single item
            return <ClassItem item={item} getTypeColor={getTypeColor} />;
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
                        {items && items.map((item) => (
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
                            let slotData = getItemsForSlot(day, time);

                            let filteredItems = slotData

                            // if (slotData.items.length > 0) {
                            //    //TODO:
                            //     const filtered = slotData.items.filter(item => item.id == "6885ccf07399d77d7676174a");

                            //     filteredItems = {
                            //         ...slotData,
                            //         items: filtered,
                            //         count: filtered.length,
                            //         shouldCluster: filtered.length > 1 // or whatever your clustering logic is
                            //     };
                            // }

                            // console.log("FILTERED ITEMS", filteredItems)
                            // Skip rendering if this slot is part of a merged cell
                            if (mergedSlots.has(`${day}-${time}`)) {
                                return null;
                            }

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
                                        slotData={filteredItems}
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