// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: ResourceGrid.jsx
// Description: Grid layout component for displaying available resources in the booking system, providing visual representation of bookable facilities
// First Written on: July 15, 2024
// Edited on: Friday, August 9, 2024

import { Grid, Card, CardBody, VStack, HStack, Badge, Text, Divider, Alert, AlertIcon, AlertTitle, AlertDescription, Button, Box } from "@chakra-ui/react"
import { FiMapPin, FiUsers, FiCalendar, FiSearch } from "react-icons/fi"
import { getTypeIcon, getTypeColor, getStatusColor, getCapacityCategory, getCapacityCategoryColor } from "./utils"

const ResourceGrid = ({ resources, onBookRoom }) => {
    if (resources.length === 0) {
        return (
            <Card>
                <CardBody textAlign="center" py={10}>
                    <FiSearch size={48} color="#A0AEC0" style={{ marginBottom: '16px' }} />
                    <Text fontSize="lg" color="gray.600" mb={2}>
                        No resources found
                    </Text>
                    <Text color="gray.500">Try adjusting your search criteria</Text>
                </CardBody>
            </Card>
        )
    }

    return (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {resources.map((resource) => (
                <ResourceCard
                    key={resource._id}
                    resource={resource}
                    onBookRoom={onBookRoom}
                />
            ))}
        </Grid>
    )
}

const ResourceCard = ({ resource, onBookRoom }) => {
    return (
        <Card
            _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
            transition="all 0.3s"
            border="1px solid"
            borderColor="gray.200"
        >
            <CardBody>
                <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between">
                        <HStack>
                            <Text
                                as={getTypeIcon(resource.type)}
                                color={`${getTypeColor(resource.type)}.500`}
                                boxSize={6}
                            />
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="lg">
                                    {resource.name}
                                </Text>
                                <Badge colorScheme={getTypeColor(resource.type)} variant="subtle">
                                    {resource.type}
                                </Badge>
                            </VStack>
                        </HStack>
                        <Badge colorScheme={resource?.status ? "green" : "red"} variant="solid">
                            {(typeof resource?.status === 'boolean' ? (resource?.status ? "ACTIVE" : "INACTIVE") : "UNKNOWN")}
                        </Badge>
                    </HStack>

                    {/* Location & Capacity */}
                    <VStack align="start" spacing={2}>
                        <HStack>
                            <FiMapPin color="gray.500" size="14px" />
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                {resource.location}
                            </Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                            <HStack>
                                <FiUsers color="gray.500" size="14px" />
                                <Text fontSize="sm" color="gray.600">
                                    {resource.capacity} people
                                </Text>
                            </HStack>
                            <Badge colorScheme={getCapacityCategoryColor(resource.capacity)} variant="outline" size="sm">
                                {getCapacityCategory(resource.capacity)}
                            </Badge>
                        </HStack>
                    </VStack>

                    <Divider />

                    {/* Status-specific Information */}
                    {resource?.status === true && (
                        <Alert status="success" size="sm">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Available Now</AlertTitle>
                                <AlertDescription fontSize="xs">Ready for immediate booking</AlertDescription>
                            </Box>
                        </Alert>
                    )}

                    {resource?.status === false && (
                        <Alert status="error" size="sm">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Currently Unavailable</AlertTitle>
                                <AlertDescription fontSize="xs">
                                    This resource is currently inactive
                                </AlertDescription>
                            </Box>
                        </Alert>
                    )}

                    {typeof resource?.status !== 'boolean' && (
                        <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Status Unknown</AlertTitle>
                                <AlertDescription fontSize="xs">This resource's status is unclear</AlertDescription>
                            </Box>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <Button
                        colorScheme="blue"
                        onClick={() => onBookRoom(resource)}
                        leftIcon={<FiCalendar />}
                        size="sm"
                        isDisabled={resource?.status !== true}
                    >
                        {resource?.status === true ? "Book Now" : "Unavailable"}
                    </Button>
                </VStack>
            </CardBody>
        </Card>
    )
}

export default ResourceGrid
