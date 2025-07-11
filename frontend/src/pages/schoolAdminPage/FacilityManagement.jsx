import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  Text,
  Badge,
  VStack,
  HStack,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react"
import { FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiHome, FiUsers, FiTool } from "react-icons/fi"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useAdminStore } from "../../store/TBI/adminStore.js"

const COLORS = ["#344E41", "#A4C3A2", "#48BB78", "#ED8936"]

const usageData = [
  { name: "Sports", value: 35, bookings: 45 },
  { name: "Academic", value: 40, bookings: 78 },
  { name: "Meeting", value: 15, bookings: 12 },
  { name: "Recreation", value: 10, bookings: 23 },
]

export function FacilityManagement() {
  const { facilities } = useAdminStore()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "green"
      case "Occupied":
        return "blue"
      case "Maintenance":
        return "red"
      default:
        return "gray"
    }
  }

  const getMaintenanceColor = (maintenance) => {
    switch (maintenance) {
      case "Excellent":
        return "green"
      case "Good":
        return "blue"
      case "Fair":
        return "yellow"
      case "Under Repair":
        return "red"
      default:
        return "gray"
    }
  }

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Facility Management
            </Text>
            <Text color="gray.600">Monitor and manage campus facilities</Text>
          </Box>
          <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }}>
            Add Facility
          </Button>
        </HStack>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Total Facilities</StatLabel>
                    <StatNumber color="#344E41">{facilities.length}</StatNumber>
                    <StatHelpText>Across campus</StatHelpText>
                  </Box>
                  <Box color="#344E41" fontSize="2xl">
                    <FiHome />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Average Capacity</StatLabel>
                    <StatNumber color="#A4C3A2">
                      {Math.round(facilities.reduce((sum, f) => sum + f.capacity, 0) / facilities.length)}
                    </StatNumber>
                    <StatHelpText>People per facility</StatHelpText>
                  </Box>
                  <Box color="#A4C3A2" fontSize="2xl">
                    <FiUsers />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Maintenance Required</StatLabel>
                    <StatNumber color="#ED8936">
                      {facilities.filter((f) => f.maintenance === "Under Repair").length}
                    </StatNumber>
                    <StatHelpText>Facilities need attention</StatHelpText>
                  </Box>
                  <Box color="#ED8936" fontSize="2xl">
                    <FiTool />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Facility Usage Chart */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                Facility Usage by Type
              </Text>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* Booking Statistics */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                Booking Statistics
              </Text>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#344E41" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </Grid>

        {/* Facilities Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              All Facilities
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Facility Name</Th>
                  <Th>Type</Th>
                  <Th>Capacity</Th>
                  <Th>Status</Th>
                  <Th>Maintenance</Th>
                  <Th>Bookings</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {facilities.map((facility) => (
                  <Tr key={facility.id}>
                    <Td>
                      <Box>
                        <Text fontWeight="medium">{facility.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {facility.location}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">{facility.type}</Badge>
                    </Td>
                    <Td>{facility.capacity}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(facility.status)}>{facility.status}</Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getMaintenanceColor(facility.maintenance)}>{facility.maintenance}</Badge>
                    </Td>
                    <Td>
                      <VStack spacing={1}>
                        <Text fontWeight="medium">{facility.bookings}</Text>
                        <Progress value={(facility.bookings / 100) * 100} size="sm" colorScheme="green" w="60px" />
                      </VStack>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                          <MenuItem icon={<FiTool />}>Schedule Maintenance</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500">
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
