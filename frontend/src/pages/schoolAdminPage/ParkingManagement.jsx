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
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react"
import { FiPlus, FiMapPin, FiUsers, FiAlertTriangle } from "react-icons/fi"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const COLORS = ["#344E41", "#A4C3A2", "#48BB78", "#ED8936"]

const weeklyData = [
  { day: "Mon", occupancy: 85 },
  { day: "Tue", occupancy: 92 },
  { day: "Wed", occupancy: 78 },
  { day: "Thu", occupancy: 88 },
  { day: "Fri", occupancy: 95 },
  { day: "Sat", occupancy: 45 },
  { day: "Sun", occupancy: 32 },
]

export function ParkingManagement() {
  const { parkingLots } = useAdminStore()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const totalSpots = parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0)
  const totalOccupied = parkingLots.reduce((sum, lot) => sum + lot.occupiedSpots, 0)
  const overallOccupancy = Math.round((totalOccupied / totalSpots) * 100)

  const pieData = parkingLots.map((lot, index) => ({
    name: lot.name,
    value: lot.occupiedSpots,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Parking Management
            </Text>
            <Text color="gray.600">Monitor parking lots and manage permits</Text>
          </Box>
          <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }}>
            Add Parking Lot
          </Button>
        </HStack>

        {/* Overview Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Total Spots</StatLabel>
                    <StatNumber color="#344E41">{totalSpots}</StatNumber>
                    <StatHelpText>Across all lots</StatHelpText>
                  </Box>
                  <Box color="#344E41" fontSize="2xl">
                    <FiMapPin />
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
                    <StatLabel color="gray.600">Occupied</StatLabel>
                    <StatNumber color="#A4C3A2">{totalOccupied}</StatNumber>
                    <StatHelpText>{overallOccupancy}% occupancy</StatHelpText>
                  </Box>
                  <CircularProgress value={overallOccupancy} color="#A4C3A2" size="50px">
                    <CircularProgressLabel fontSize="xs">{overallOccupancy}%</CircularProgressLabel>
                  </CircularProgress>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Available</StatLabel>
                    <StatNumber color="#48BB78">{totalSpots - totalOccupied}</StatNumber>
                    <StatHelpText>Ready for use</StatHelpText>
                  </Box>
                  <Box color="#48BB78" fontSize="2xl">
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
                    <StatLabel color="gray.600">Violations</StatLabel>
                    <StatNumber color="#ED8936">12</StatNumber>
                    <StatHelpText>This week</StatHelpText>
                  </Box>
                  <Box color="#ED8936" fontSize="2xl">
                    <FiAlertTriangle />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Occupancy Distribution */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                Occupancy Distribution
              </Text>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* Weekly Occupancy Trend */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                Weekly Occupancy Trend
              </Text>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="occupancy" stroke="#344E41" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </Grid>

        {/* Parking Lots Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Parking Lots Overview
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Parking Lot</Th>
                  <Th>Type</Th>
                  <Th>Total Spots</Th>
                  <Th>Occupied</Th>
                  <Th>Available</Th>
                  <Th>Occupancy Rate</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {parkingLots.map((lot) => {
                  const occupancyRate = Math.round((lot.occupiedSpots / lot.totalSpots) * 100)
                  const available = lot.totalSpots - lot.occupiedSpots

                  return (
                    <Tr key={lot.id}>
                      <Td>
                        <Box>
                          <Text fontWeight="medium">{lot.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {lot.location}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">{lot.type}</Badge>
                      </Td>
                      <Td>{lot.totalSpots}</Td>
                      <Td>{lot.occupiedSpots}</Td>
                      <Td>{available}</Td>
                      <Td>
                        <VStack spacing={1}>
                          <Text fontWeight="medium">{occupancyRate}%</Text>
                          <Progress
                            value={occupancyRate}
                            size="sm"
                            colorScheme={occupancyRate > 90 ? "red" : occupancyRate > 70 ? "yellow" : "green"}
                            w="80px"
                          />
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={occupancyRate > 90 ? "red" : occupancyRate > 70 ? "yellow" : "green"}>
                          {occupancyRate > 90 ? "Full" : occupancyRate > 70 ? "Busy" : "Available"}
                        </Badge>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Recent Violations */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Recent Violations
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Vehicle</Th>
                  <Th>Violation Type</Th>
                  <Th>Location</Th>
                  <Th>Fine</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>2024-01-20</Td>
                  <Td>ABC-123</Td>
                  <Td>Expired Permit</Td>
                  <Td>Main Parking Lot</Td>
                  <Td>$25</Td>
                  <Td>
                    <Badge colorScheme="red">Unpaid</Badge>
                  </Td>
                </Tr>
                <Tr>
                  <Td>2024-01-19</Td>
                  <Td>XYZ-789</Td>
                  <Td>No Permit</Td>
                  <Td>Faculty Parking</Td>
                  <Td>$50</Td>
                  <Td>
                    <Badge colorScheme="green">Paid</Badge>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
