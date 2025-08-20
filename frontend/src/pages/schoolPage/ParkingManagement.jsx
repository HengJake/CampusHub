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
import { FiPlus, FiMapPin, FiUsers, FiAlertTriangle, FiDownload, FiPieChart, FiTrendingUp, FiClock, FiZap, FiStar, FiActivity } from "react-icons/fi"
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

import { useFacilityStore } from "../../store/facility"
import { useShowToast } from "../../store/utils/toast"
import React, { useState, useEffect } from "react"
import ParkingTemplateModal from "../../component/schoolAdminDashboard/facility/ParkingTemplateModal"
import ParkingBulkUploadModal from "../../component/schoolAdminDashboard/facility/ParkingBulkUploadModal"



export function ParkingManagement() {
  // Colors for charts
  const COLORS = [
    "#0088FE", // Blue
    "#00C49F", // Green
    "#FFBB28", // Yellow
    "#FF8042", // Orange
    "#8884D8", // Purple
    "#82CA9D", // Light Green
    "#FFC658", // Light Yellow
    "#FF7C80", // Pink
  ]

  // Mock data for analytics charts
  const weeklyData = [
    { day: "Mon", occupancy: 85 },
    { day: "Tue", occupancy: 92 },
    { day: "Wed", occupancy: 78 },
    { day: "Thu", occupancy: 88 },
    { day: "Fri", occupancy: 95 },
    { day: "Sat", occupancy: 45 },
    { day: "Sun", occupancy: 32 },
  ]

  const zoneDistributionData = [
    { name: "Zone A", value: 35 },
    { name: "Zone B", value: 28 },
    { name: "Zone C", value: 22 },
    { name: "Zone D", value: 15 },
  ]

  const hourlyData = [
    { hour: 6, weekday: 25, weekend: 15 },
    { hour: 8, weekday: 65, weekend: 35 },
    { hour: 10, weekday: 85, weekend: 55 },
    { hour: 12, weekday: 75, weekend: 65 },
    { hour: 14, weekday: 70, weekend: 70 },
    { hour: 16, weekday: 80, weekend: 75 },
    { hour: 18, weekday: 60, weekend: 80 },
    { hour: 20, weekday: 40, weekend: 60 },
    { hour: 22, weekday: 25, weekend: 45 },
    { hour: 0, weekday: 15, weekend: 25 },
  ]

  const monthlyData = [
    { month: "Jan", totalSlots: 120, activeSlots: 110, utilization: 78 },
    { month: "Feb", totalSlots: 120, activeSlots: 115, utilization: 82 },
    { month: "Mar", totalSlots: 125, activeSlots: 120, utilization: 85 },
    { month: "Apr", totalSlots: 125, activeSlots: 118, utilization: 83 },
    { month: "May", totalSlots: 130, activeSlots: 125, utilization: 87 },
    { month: "Jun", totalSlots: 130, activeSlots: 128, utilization: 89 },
    { month: "Jul", totalSlots: 135, activeSlots: 130, utilization: 91 },
    { month: "Aug", totalSlots: 135, activeSlots: 132, utilization: 92 },
    { month: "Sep", totalSlots: 140, activeSlots: 135, utilization: 94 },
    { month: "Oct", totalSlots: 140, activeSlots: 138, utilization: 96 },
    { month: "Nov", totalSlots: 145, activeSlots: 140, utilization: 97 },
    { month: "Dec", totalSlots: 145, activeSlots: 142, utilization: 98 },
  ]

  const {
    parkingLots,
    fetchParkingLots,
    createParkingLot,
    updateParkingLot,
    deleteParkingLot,
    bulkCreateParkingLots,
    loading,
    getSchoolId
  } = useFacilityStore();
  const showToast = useShowToast();

  // Modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    zone: "",
    slotNumber: 0,
    active: true
  });
  const [editId, setEditId] = useState(null);

  // Bulk operations state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [previewParkingLots, setPreviewParkingLots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Search and Filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch parking lots on mount
  useEffect(() => {
    fetchParkingLots().then(res => {
      if (res.success) {
        showToast.success("Parking lots loaded");
        console.log("Parking lots loaded", res.data);
        // Debug: Log the structure of the first parking lot if it exists
        if (res.data && res.data.length > 0) {
          console.log("First parking lot structure:", JSON.stringify(res.data[0], null, 2));
        }
      } else {
        showToast.error("Failed to load parking lots", res.message);
        console.error("Failed to load parking lots", res.message);
      }
    });
  }, []);

  // Handlers
  const handleOpenEdit = (lot) => {
    setFormData({
      zone: lot.zone,
      slotNumber: lot.slotNumber,
      active: lot.active
    });
    setIsEdit(true);
    setEditId(lot.id || lot._id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "slotNumber" ? Number(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Update

        const updatedFormData = {
          ...formData,
          schoolId: await getSchoolId()
        }

        const res = await updateParkingLot(editId, updatedFormData);
        if (res.success) {
          showToast.success("Parking lot updated");
          console.log("Parking lot updated", res.data);
          handleCloseModal();
        } else {
          showToast.error("Update failed", res.message);
          console.error("Update failed", res.message);
        }
      } else {
        // Create
        const res = await createParkingLot(formData);
        if (res.success) {
          showToast.success("Parking lot created");
          console.log("Parking lot created", res.data);
          handleCloseModal();
        } else {
          showToast.error("Creation failed", res.message);
          console.error("Creation failed", res.message);
        }
      }
      // Refresh list
      await fetchParkingLots();
    } catch (error) {
      console.error("Error in form submission:", error);
      showToast.error("An unexpected error occurred", error.message || "Please try again");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parking lot?")) return;

    try {
      const res = await deleteParkingLot(id);
      if (res.success) {
        showToast.success("Parking lot deleted");
        console.log("Parking lot deleted", id);
        await fetchParkingLots();
      } else {
        showToast.error("Delete failed", res.message);
        console.error("Delete failed", res.message);
      }
    } catch (error) {
      console.error("Error deleting parking lot:", error);
      showToast.error("An unexpected error occurred", error.message || "Please try again");
    }
  };

  const handleDeleteClick = (lot, e) => {
    e.stopPropagation(); // Prevent opening edit modal
    setDeleteTarget(lot);
    setShowDeleteModal(true);
  };

  // Bulk operations handlers
  const handleGenerateParkingLots = (generatedLots) => {
    setPreviewParkingLots(generatedLots);
    setIsBulkUploadModalOpen(true);
  };

  const handleConfirmCreation = async (parkingLotsData) => {
    try {
      const res = await bulkCreateParkingLots(parkingLotsData);
      if (res.success) {
        showToast.success(res.message);
        setPreviewParkingLots([]);
        await fetchParkingLots(); // Refresh the list
      } else {
        showToast.error("Bulk creation failed", res.message);
      }
    } catch (error) {
      console.error("Error in bulk creation:", error);
      showToast.error("An unexpected error occurred", error.message || "Please try again");
    }
  };



  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await deleteParkingLot(deleteTarget.id || deleteTarget._id);
      if (res.success) {
        showToast.success("Parking lot deleted");
        console.log("Parking lot deleted", deleteTarget.id || deleteTarget._id);
        await fetchParkingLots();
        setShowDeleteModal(false);
        setDeleteTarget(null);
      } else {
        showToast.error("Delete failed", res.message);
        console.error("Delete failed", res.message);
      }
    } catch (error) {
      console.error("Error deleting parking lot:", error);
      showToast.error("An unexpected error occurred", error.message || "Please try again");
    }
  };

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  return (
    <Box minH="100%" flex={1}>
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" flexDir={{ base: "column", lg: "row" }} align={{ base: "start", lg: "" }}>
          <Box>
            <HStack spacing={3} align="center">
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="#333333">
                  Parking Management
                </Text>
                <Text color="gray.600">Monitor parking lots and manage permits</Text>
              </Box>
            </HStack>
          </Box>
          <HStack spacing={3} my={{ base: "4", lg: "0" }}>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              colorScheme="blue"
              onClick={() => setIsTemplateModalOpen(true)}
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              transition="all 0.2s"
              borderRadius="lg"
            >
              Generate Lots
            </Button>
          </HStack>
        </HStack>

        {/* Zone Statistics */}
        {parkingLots && parkingLots.length > 0 && (
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
            {(() => {
              const zones = parkingLots.reduce((acc, lot) => {
                const zone = lot.zone || 'Unknown Zone';
                if (!acc[zone]) {
                  acc[zone] = { total: 0, active: 0, inactive: 0 };
                }
                acc[zone].total++;
                if (lot.active) {
                  acc[zone].active++;
                } else {
                  acc[zone].inactive++;
                }
                return acc;
              }, {});

              return Object.entries(zones).map(([zoneName, stats]) => (
                <Card
                  key={zoneName}
                  bg={bgColor}
                  borderColor={borderColor}
                  borderWidth="1px"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.2s"
                  borderRadius="lg"
                >
                  <CardBody p={4}>
                    <VStack spacing={2} align="center">
                      <Box
                        p={2}
                        bg="linear-gradient(135deg, #344E41 0%, #588157 100%)"
                        borderRadius="full"
                        color="white"
                      >
                        <FiMapPin size={20} />
                      </Box>
                      <Text fontSize="md" fontWeight="bold" color="#344E41">
                        {zoneName}
                      </Text>
                      <HStack spacing={3}>
                        <Stat textAlign="center">
                          <StatNumber fontSize="lg" color="green.500">{stats.active}</StatNumber>
                          <StatLabel fontSize="2xs">Active</StatLabel>
                        </Stat>
                        <Stat textAlign="center">
                          <StatNumber fontSize="lg" color="gray.500">{stats.inactive}</StatNumber>
                          <StatLabel fontSize="2xs">Inactive</StatLabel>
                        </Stat>
                        <Stat textAlign="center">
                          <StatNumber fontSize="lg" color="blue.500">{stats.total}</StatNumber>
                          <StatLabel fontSize="2xs">Total</StatLabel>
                        </Stat>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ));
            })()}
          </Grid>
        )}

        {/* Search and Filter */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg">
          <CardBody p={4}>
            <HStack spacing={4} align="center">
              <Box flex={1} position="relative">
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  color="gray.400"
                  zIndex={1}
                >
                  🔍
                </Box>
                <input
                  placeholder="Search by zone or slot number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "12px 16px 12px 40px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    width: "100%",
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#344E41";
                    e.target.style.boxShadow = "0 0 0 3px rgba(52, 78, 65, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </Box>
              <Button
                variant={statusFilter === 'all' ? 'solid' : 'outline'}
                colorScheme={statusFilter === 'all' ? 'blue' : 'gray'}
                onClick={() => setStatusFilter('all')}
                size="md"
                borderRadius="lg"
                _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <FiActivity />
                  <Text>All</Text>
                </HStack>
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'solid' : 'outline'}
                colorScheme={statusFilter === 'active' ? 'green' : 'gray'}
                onClick={() => setStatusFilter('active')}
                size="md"
                borderRadius="lg"
                _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <FiZap />
                  <Text>Active</Text>
                </HStack>
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'solid' : 'outline'}
                colorScheme={statusFilter === 'inactive' ? 'red' : 'gray'}
                onClick={() => setStatusFilter('inactive')}
                size="md"
                borderRadius="lg"
                _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <FiAlertTriangle />
                  <Text>Inactive</Text>
                </HStack>
              </Button>
            </HStack>
          </CardBody>
        </Card>



        {/* Parking Lots Grid Map View */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" borderRadius="lg">
          <CardBody p={4}>
            <HStack spacing={3} align="center" mb={4}>
              <Box
                p={2}
                bg="linear-gradient(135deg, #344E41 0%, #588157 100%)"
                borderRadius="full"
                color="white"
              >
                <FiMapPin size={20} />
              </Box>
              <Text fontSize="lg" fontWeight="semibold" color="#333333">
                Parking Lots Overview
              </Text>
            </HStack>
            {loading.parkingLots ? (
              <Box textAlign="center" py={6}>
                <CircularProgress isIndeterminate color="#344E41" />
                <Text mt={3}>Loading parking lots...</Text>
              </Box>
            ) : !parkingLots || parkingLots.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Text color="gray.500">No parking lots found</Text>
              </Box>
            ) : (
              <VStack spacing={6} align="stretch">
                {(() => {
                  // Filter parking lots based on search and status
                  let filteredLots = parkingLots;

                  // Apply search filter
                  if (searchTerm) {
                    filteredLots = filteredLots.filter(lot =>
                      (lot.zone && lot.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (lot.slotNumber && lot.slotNumber.toString().includes(searchTerm))
                    );
                  }

                  // Apply status filter
                  if (statusFilter !== 'all') {
                    filteredLots = filteredLots.filter(lot =>
                      statusFilter === 'active' ? lot.active : !lot.active
                    );
                  }

                  // Group filtered parking lots by zone
                  const zones = filteredLots.reduce((acc, lot) => {
                    const zone = lot.zone || 'Unknown Zone';
                    if (!acc[zone]) {
                      acc[zone] = [];
                    }
                    acc[zone].push(lot);
                    return acc;
                  }, {});

                  if (Object.keys(zones).length === 0) {
                    return (
                      <Box textAlign="center" py={6}>
                        <Text color="gray.500">No parking lots match your search criteria</Text>
                      </Box>
                    );
                  }

                  return Object.entries(zones).map(([zoneName, zoneLots]) => (
                    <Box key={zoneName}>
                      <HStack spacing={3} align="center" mb={4}>
                        <Box
                          p={2}
                          bg="linear-gradient(135deg, #344E41 0%, #588157 100%)"
                          borderRadius="full"
                          color="white"
                        >
                          <FiMapPin size={16} />
                        </Box>
                        <Text fontSize="lg" fontWeight="bold" color="#344E41">
                          {zoneName} ({zoneLots.length} slots)
                        </Text>
                      </HStack>
                      <Grid
                        templateColumns={{
                          base: "repeat(3, 1fr)",
                          md: "repeat(6, 1fr)",
                          lg: "repeat(8, 1fr)",
                          xl: "repeat(10, 1fr)"
                        }}
                        gap={2}
                      >
                        {zoneLots.map((lot) => (
                          <Card
                            key={lot.id || lot._id}
                            cursor="pointer"
                            onClick={() => handleOpenEdit(lot)}
                            _hover={{ transform: "scale(1.02)", shadow: "md" }}
                            transition="all 0.2s"
                            bg={lot.active ? "green.50" : "red.50"}
                            borderColor={lot.active ? "green.200" : "red.200"}
                            borderWidth="1px"
                            position="relative"
                            minH="80px"
                          >
                            <CardBody p={2} textAlign="center">
                              <VStack spacing={1}>
                                <Text fontSize="sm" fontWeight="bold" color="#333333">
                                  {lot.slotNumber || 'N/A'}
                                </Text>
                                <Box
                                  fontSize="lg"
                                  color={lot.active ? "green.500" : "red.500"}
                                >
                                  {lot.active ? "🅿️" : "🚘"}
                                </Box>
                                <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                                  {lot.active ? "Active" : "Inactive"}
                                </Text>
                              </VStack>

                              {/* Delete Button */}
                              <Button
                                size="xs"
                                colorScheme="red"
                                position="absolute"
                                top={1}
                                right={1}
                                onClick={(e) => handleDeleteClick(lot, e)}
                                opacity={0}
                                _groupHover={{ opacity: 1 }}
                                _hover={{ opacity: 1 }}
                                transition="opacity 0.2s"
                                zIndex={2}
                                minW="20px"
                                h="20px"
                                fontSize="10px"
                              >
                                ✕
                              </Button>
                            </CardBody>
                          </Card>
                        ))}
                      </Grid>
                    </Box>
                  ));
                })()}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Enhanced Modal for Add/Edit Parking Lot */}
        {isModalOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Card minW="400px" maxW="500px" w="full">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xl" fontWeight="bold" color="#333333">
                      {isEdit ? "Edit" : "Add"} Parking Lot
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCloseModal}
                      _hover={{ bg: "gray.100" }}
                    >
                      ✕
                    </Button>
                  </HStack>

                  {isEdit && (
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <VStack spacing={2} align="stretch">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          Slot Details
                        </Text>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Slot Number:</Text>
                          <Text fontSize="sm" fontWeight="medium">{formData.slotNumber}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Zone:</Text>
                          <Text fontSize="sm" fontWeight="medium">{formData.zone}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Status:</Text>
                          <Badge colorScheme={formData.active ? "green" : "red"}>
                            {formData.active ? "Active" : "Inactive"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                          Zone
                        </Text>
                        <input
                          name="zone"
                          placeholder="Enter zone (e.g., Zone A, Zone B)"
                          value={formData.zone}
                          onChange={handleChange}
                          required
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            width: "100%",
                            fontSize: "14px"
                          }}
                        />
                      </Box>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                          Slot Number
                        </Text>
                        <input
                          name="slotNumber"
                          type="number"
                          placeholder="Enter slot number"
                          value={formData.slotNumber}
                          onChange={handleChange}
                          min={1}
                          required
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            width: "100%",
                            fontSize: "14px"
                          }}
                        />
                      </Box>

                      <Box>
                        <HStack spacing={3} align="center">
                          <input
                            name="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={handleChange}
                            style={{ width: "18px", height: "18px" }}
                          />
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">
                            Active
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Active slots are available for parking
                        </Text>
                      </Box>

                      <HStack justify="flex-end" spacing={3} pt={2}>
                        <Button
                          onClick={handleCloseModal}
                          variant="outline"
                          colorScheme="gray"
                          size="md"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          colorScheme="green"
                          size="md"
                          isLoading={loading.parkingLots}
                        >
                          {isEdit ? "Update" : "Create"}
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            zIndex={1001}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Card minW="400px" maxW="500px" w="full">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box textAlign="center">
                    <Box fontSize="4xl" color="red.500" mb={3}>
                      ⚠️
                    </Box>
                    <Text fontSize="xl" fontWeight="bold" color="#333333">
                      Delete Parking Lot
                    </Text>
                    <Text fontSize="md" color="gray.600" mt={2}>
                      Are you sure you want to delete this parking lot?
                    </Text>
                  </Box>

                  {deleteTarget && (
                    <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                      <VStack spacing={2} align="stretch">
                        <Text fontSize="sm" fontWeight="semibold" color="red.700">
                          Slot Details
                        </Text>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="red.600">Slot Number:</Text>
                          <Text fontSize="sm" fontWeight="medium">{deleteTarget.slotNumber}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="red.600">Zone:</Text>
                          <Text fontSize="sm" fontWeight="medium">{deleteTarget.zone}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="red.600">Status:</Text>
                          <Badge colorScheme={deleteTarget.active ? "green" : "red"}>
                            {deleteTarget.active ? "Active" : "Inactive"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  <Text fontSize="sm" color="red.600" textAlign="center">
                    This action cannot be undone.
                  </Text>

                  <HStack justify="center" spacing={4}>
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteTarget(null);
                      }}
                      variant="outline"
                      colorScheme="gray"
                      size="md"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmDelete}
                      colorScheme="red"
                      size="md"
                      isLoading={loading.parkingLots}
                    >
                      Delete
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}

        {/* Template Generation Modal */}
        <ParkingTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onGenerate={handleGenerateParkingLots}
          existingZones={parkingLots}
        />

        {/* Bulk Upload Modal */}
        <ParkingBulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onConfirm={handleConfirmCreation}
          parkingLots={previewParkingLots}
          isLoading={loading.parkingLots}
        />

        {/* Analytics Section */}
        <Card bg="yellow.50" borderColor="yellow.200" borderWidth="1px" borderRadius="lg">
          <CardBody p={4}>
            <HStack w="100%" justify="space-between" mb={4}>
              <HStack spacing={3} align="center">
                <Box
                  p={2}
                  bg="linear-gradient(135deg, #D69E2E 0%, #F6AD55 100%)"
                  borderRadius="full"
                  color="white"
                >
                  <FiPieChart size={20} />
                </Box>
                <Text fontSize="lg" fontWeight="semibold" color="#333333">
                  Parking Analytics
                </Text>
              </HStack>
              <Badge colorScheme="yellow" variant="subtle" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <FiStar size={12} />
                  <Text fontSize="xs">Demo Feature</Text>
                </HStack>
              </Badge>
            </HStack>

            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
              {/* Weekly Occupancy Trend */}
              <Box>
                <HStack spacing={2} align="center" mb={3}>
                  <FiTrendingUp color="#344E41" />
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Weekly Occupancy Trend
                  </Text>
                </HStack>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Occupancy']}
                      labelFormatter={(label) => `${label}day`}
                    />
                    <Line
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#344E41"
                      strokeWidth={3}
                      dot={{ fill: "#344E41", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Zone Distribution Pie Chart */}
              <Box>
                <HStack spacing={2} align="center" mb={3}>
                  <FiMapPin color="#8884D8" />
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Zone Distribution
                  </Text>
                </HStack>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={zoneDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {zoneDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Hourly Usage Pattern */}
              <Box>
                <HStack spacing={2} align="center" mb={3}>
                  <FiClock color="#48BB78" />
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Hourly Usage Pattern (Weekday vs Weekend)
                  </Text>
                </HStack>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      labelFormatter={(label) => `${label}:00`}
                    />
                    <Line
                      type="monotone"
                      dataKey="weekday"
                      stroke="#48BB78"
                      strokeWidth={2}
                      name="Weekday"
                      dot={{ fill: "#48BB78", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weekend"
                      stroke="#ED8936"
                      strokeWidth={2}
                      name="Weekend"
                      dot={{ fill: "#ED8936", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Monthly Statistics */}
              <Box>
                <HStack spacing={2} align="center" mb={3}>
                  <FiPieChart color="#D69E2E" />
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Monthly Parking Statistics
                  </Text>
                </HStack>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalSlots"
                      stroke="#3182CE"
                      strokeWidth={2}
                      name="Total Slots"
                      dot={{ fill: "#3182CE", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeSlots"
                      stroke="#38A169"
                      strokeWidth={2}
                      name="Active Slots"
                      dot={{ fill: "#38A169", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      stroke="#D69E2E"
                      strokeWidth={2}
                      name="Utilization %"
                      dot={{ fill: "#D69E2E", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* Additional Analytics Cards */}
            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} mt={6}>
              <Card bg="blue.50" borderColor="blue.200" borderRadius="lg" _hover={{ transform: "translateY(-2px)", shadow: "lg" }} transition="all 0.2s">
                <CardBody p={4}>
                  <VStack spacing={3} align="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)"
                      borderRadius="full"
                      color="white"
                    >
                      <FiClock size={24} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      Peak Hours
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                      9AM - 11AM
                    </Text>
                    <Text fontSize="sm" color="blue.600" textAlign="center">
                      85% average occupancy
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="green.50" borderColor="green.200" borderRadius="lg" _hover={{ transform: "translateY(-2px)", shadow: "lg" }} transition="all 0.2s">
                <CardBody p={4}>
                  <VStack spacing={3} align="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, #38A169 0%, #68D391 100%)"
                      borderRadius="full"
                      color="white"
                    >
                      <FiStar size={24} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      Best Zone
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.700">
                      Zone A
                    </Text>
                    <Text fontSize="sm" color="green.600" textAlign="center">
                      92% utilization rate
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="orange.50" borderColor="orange.200" borderRadius="lg" _hover={{ transform: "translateY(-2px)", shadow: "lg" }} transition="all 0.2s">
                <CardBody p={4}>
                  <VStack spacing={3} align="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, #ED8936 0%, #F6AD55 100%)"
                      borderRadius="full"
                      color="white"
                    >
                      <FiZap size={24} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold" color="orange.600">
                      Quiet Hours
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                      2AM - 6AM
                    </Text>
                    <Text fontSize="sm" color="orange.600" textAlign="center">
                      15% average occupancy
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="purple.50" borderColor="purple.200" borderRadius="lg" _hover={{ transform: "translateY(-2px)", shadow: "lg" }} transition="all 0.2s">
                <CardBody p={4}>
                  <VStack spacing={3} align="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, #805AD5 0%, #B794F4 100%)"
                      borderRadius="full"
                      color="white"
                    >
                      <FiTrendingUp size={24} />
                    </Box>
                    <Text fontSize="lg" fontWeight="bold" color="purple.600">
                      Weekly Trend
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.700">
                      +12%
                    </Text>
                    <Text fontSize="sm" color="purple.600" textAlign="center">
                      vs last week
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
