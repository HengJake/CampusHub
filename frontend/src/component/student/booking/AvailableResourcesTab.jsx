import { useState } from "react"
import { VStack, Card, CardBody, Text, Grid, HStack } from "@chakra-ui/react"
import ResourceFilters from "./ResourceFilters"
import ResourceGrid from "./ResourceGrid"

const AvailableResourcesTab = ({ resources, onBookRoom, lastUpdated }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [capacityFilter, setCapacityFilter] = useState("")
    const [locationFilter, setLocationFilter] = useState("")

    // Filter resources based on search and filters
    const filteredResources = resources.filter((resource) => {
        if (!resource || typeof resource !== 'object') return false

        const matchesSearch =
            (resource.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (resource.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (resource.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesType = !typeFilter || resource.type === typeFilter
        const matchesStatus = !statusFilter || resource.status === (statusFilter === "true")
        const matchesCapacity = !capacityFilter || getCapacityCategory(resource.capacity) === capacityFilter
        const matchesLocation = !locationFilter || (resource.location || '').includes(locationFilter)

        return matchesSearch && matchesType && matchesStatus && matchesCapacity && matchesLocation
    })

    const getCapacityCategory = (capacity) => {
        if (!capacity || typeof capacity !== 'number') return "Small"
        if (capacity <= 4) return "Small"
        if (capacity <= 12) return "Medium"
        return "Large"
    }

    return (
        <VStack spacing={6} align="stretch">
            {/* Advanced Filters */}
            <Card mb={6}>
                <CardBody>
                    <HStack justify="space-between">
                        <Text fontWeight="bold" mb={4}>
                            Search & Filter Options
                        </Text>
                        <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color="gray.600">
                                Last Updated: {lastUpdated.toLocaleTimeString()}
                            </Text>
                            <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                {filteredResources.length} resources found
                            </Text>
                        </VStack>
                    </HStack>

                    <ResourceFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        capacityFilter={capacityFilter}
                        setCapacityFilter={setCapacityFilter}
                        locationFilter={locationFilter}
                        setLocationFilter={setLocationFilter}
                    />
                </CardBody>
            </Card>

            {/* Resources Grid */}
            <ResourceGrid
                resources={filteredResources}
                onBookRoom={onBookRoom}
            />
        </VStack>
    )
}

export default AvailableResourcesTab
