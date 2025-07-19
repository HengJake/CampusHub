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

import { useFacilityStore } from "../../store/facility"
import { useShowToast } from "../../store/utils/toast"
import React, { useState, useEffect } from "react"

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
  const {
    parkingLots,
    fetchParkingLots,
    createParkingLot,
    updateParkingLot,
    deleteParkingLot,
    loading,
  } = useFacilityStore();
  const showToast = useShowToast();

  // Modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    zone: "",
    slotNumber: 0,
    active: true
  });
  const [editId, setEditId] = useState(null);

  // Fetch parking lots on mount
  useEffect(() => {
    fetchParkingLots().then(res => {
      if (res.success) {
        showToast.success("Parking lots loaded");
        console.log("Parking lots loaded", res.data);
      } else {
        showToast.error("Failed to load parking lots", res.message);
        console.error("Failed to load parking lots", res.message);
      }
    });
  }, []);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({ zone: "", slotNumber: 0, active: true });
    setIsEdit(false);
    setEditId(null);
    setIsModalOpen(true);
  };

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
    if (isEdit) {
      // Update
      const res = await updateParkingLot(editId, formData);
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
    fetchParkingLots();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parking lot?")) return;
    const res = await deleteParkingLot(id);
    if (res.success) {
      showToast.success("Parking lot deleted");
      console.log("Parking lot deleted", id);
      fetchParkingLots();
    } else {
      showToast.error("Delete failed", res.message);
      console.error("Delete failed", res.message);
    }
  };

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

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
          <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={handleOpenAdd}>
            Add Parking Lot
          </Button>
        </HStack>

        {/* Parking Lots Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Parking Lots Overview
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>School ID</Th>
                  <Th>Zone</Th>
                  <Th>Slot Number</Th>
                  <Th>Active</Th>
                  <Th>Created At</Th>
                  <Th>Updated At</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {parkingLots.map((lot) => (
                  <Tr key={lot.id || lot._id}>
                    <Td>{lot._id}</Td>
                    <Td>{lot.schoolId}</Td>
                    <Td>{lot.zone}</Td>
                    <Td>{lot.slotNumber}</Td>
                    <Td>
                      <Badge colorScheme={lot.active ? "green" : "red"}>{lot.active ? "Active" : "Inactive"}</Badge>
                    </Td>
                    <Td>{lot.createdAt ? new Date(lot.createdAt).toLocaleString() : ""}</Td>
                    <Td>{lot.updatedAt ? new Date(lot.updatedAt).toLocaleString() : ""}</Td>
                    <Td>
                      <Button size="xs" colorScheme="yellow" mr={2} onClick={() => handleOpenEdit(lot)}>
                        Edit
                      </Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDelete(lot.id || lot._id)}>
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Modal for Add/Edit Parking Lot */}
        <Box>
          <Card display={isModalOpen ? "block" : "none"} position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex={1000} minW="350px">
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">{isEdit ? "Edit" : "Add"} Parking Lot</Text>
                  <input name="zone" placeholder="Zone" value={formData.zone} onChange={handleChange} required style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                  <input name="slotNumber" type="number" placeholder="Slot Number" value={formData.slotNumber} onChange={handleChange} min={0} required style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input name="active" type="checkbox" checked={formData.active} onChange={handleChange} style={{ marginRight: 8 }} />
                    Active
                  </label>
                  <HStack justify="flex-end">
                    <Button onClick={handleCloseModal} variant="ghost">Cancel</Button>
                    <Button type="submit" colorScheme="green">{isEdit ? "Update" : "Create"}</Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </Box>
      </VStack>
    </Box>
  )
}
