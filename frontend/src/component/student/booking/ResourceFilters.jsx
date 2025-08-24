// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: ResourceFilters.jsx
// Description: Filter component for refining resource search results, providing location, type, and availability filtering options
// First Written on: July 21, 2024
// Edited on: Friday, August 3, 2024

import { Grid, InputGroup, InputLeftElement, Input, Select } from "@chakra-ui/react"
import { FiSearch } from "react-icons/fi"

const ResourceFilters = ({
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    capacityFilter,
    setCapacityFilter,
    locationFilter,
    setLocationFilter
}) => {
    return (
        <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={4} mt={4}>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>

            <Select placeholder="All Types" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="Study Room">Study Room</option>
                <option value="Meeting Room">Meeting Room</option>
                <option value="Seminar Hall">Seminar Hall</option>
            </Select>

            <Select
                placeholder="All Locations"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
            >
                <option value="Library">Library</option>
                <option value="Student Center">Student Center</option>
                <option value="Academic Building">Academic Building</option>
                <option value="Engineering Building">Engineering Building</option>
                <option value="Business School">Business School</option>
            </Select>

            <Select
                placeholder="All Capacities"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
            >
                <option value="Small">Small (1-4)</option>
                <option value="Medium">Medium (5-12)</option>
                <option value="Large">Large (13+)</option>
            </Select>

            <Select
                placeholder="All Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </Select>
        </Grid>
    )
}

export default ResourceFilters
