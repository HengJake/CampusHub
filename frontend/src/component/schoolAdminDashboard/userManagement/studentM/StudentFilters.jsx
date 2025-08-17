import {
    Card,
    CardBody,
    HStack,
    Input,
    Select
} from "@chakra-ui/react"

export function StudentFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
}) {
    return (
        <Card>
            <CardBody>
                <HStack spacing={4} mb={4}>
                    <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        flex="1"
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        w="200px"
                    >
                        <option value="all">All Status</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="graduated">Graduated</option>
                        <option value="dropped">Dropped</option>
                    </Select>
                </HStack>
            </CardBody>
        </Card>
    );
}
