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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  useToast,
} from "@chakra-ui/react"
import { FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiHome, FiUsers } from "react-icons/fi"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useFacilityStore } from "../../store/facility.js";
import { useEffect } from "react";
import React from "react";
import ComfirmationMessage from "../../component/common/ComfirmationMessage.jsx";

const COLORS = ["#344E41", "#A4C3A2", "#48BB78", "#ED8936", "#4299E1", "#F6AD55", "#9F7AEA"];

const FACILITY_TYPES = [
  { value: "court", label: "Court" },
  { value: "study_room", label: "Study Room" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "seminar_room", label: "Seminar Room" },
];

export function FacilityManagement() {
  const { resources, fetchResources, createResource, updateResource, deleteResource, lockerUnits, fetchLockerUnits, createLockerUnit, updateLockerUnits, deleteLockerUnits, bookings, fetchBookings, createBooking, updateBooking, deleteBooking} = useFacilityStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [facilityType, setFacilityType] = useState("All");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const toast = useToast();
  const [form, setForm] = React.useState({
    name: "",
    location: "",
    type: "study_room",
    capacity: 1,
  });


  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [facilityToDelete, setFacilityToDelete] = React.useState(null);

  useEffect(() => {
    fetchResources();
    fetchLockerUnits();
    fetchBookings();
  }, [fetchResources, fetchLockerUnits, fetchBookings]);
  console.log("🚀 ~ FacilityManagement ~ bookings:", bookings)
  console.log("🚀 ~ FacilityManagement ~ lockerUnits:", lockerUnits)
  console.log("🚀 ~ FacilityManagement ~ resources:", resources)

  const filteredResources = resources.filter((resource) => {
    const matchesType = facilityType === "All" || resource.type === facilityType;
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });
  // Helper: status badge color
  const getStatusColor = (status) => (status ? "green" : "red");

  // Filter out lockers from all resource displays
  

  // Use filteredResources instead of resources throughout the component
  // For stats, pie chart, and table:
  // - totalFacilities, avgCapacity, typeCounts, pieData, and the table rows should all use filteredResources

  // Example replacements:
  // const totalFacilities = resources.length;
  const totalFacilities = filteredResources.length;
  const avgCapacity = totalFacilities > 0 ? Math.round(filteredResources.reduce((sum, f) => sum + (f.capacity || 0), 0) / totalFacilities) : 0;
  const typeCounts = filteredResources.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(typeCounts).map(([type, count]) => ({ name: type.replace("_", " "), value: count }));

  // Helper: count related locker units/bookings for a resource
  const getBookingCount = (resourceId) => bookings.filter(b => b.resourceId === resourceId).length;

  // In the table, map over filteredResources instead of resources
  // {filteredResources.map((facility) => ( ... ))}

  const openAddModal = () => {
    setForm({ name: "", location: "", type: "study_room", capacity: 1 });
    setIsEditing(false);
    setSelectedFacility(null);
    onOpen();
  };

  const openEditModal = (facility) => {
    setForm({
      name: facility.name || "",
      location: facility.location || "",
      type: facility.type || "study_room",
      capacity: facility.capacity || 1,
    });
    setIsEditing(true);
    setSelectedFacility(facility);
    onOpen();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let res;
      if (isEditing && selectedFacility) {
        res = await updateResource(selectedFacility._id, form);
      } else {
        res = await createResource(form);
      }
      if (res.success) {
        toast({ title: isEditing ? "Facility updated!" : "Facility added!", status: "success", duration: 2000, isClosable: true });
        fetchResources();
        onClose();
        setForm({ name: "", location: "", type: "study_room", capacity: 1 });
        setIsEditing(false);
        setSelectedFacility(null);
      } else {
        toast({ title: "Error", description: res.message, status: "error", duration: 3000, isClosable: true });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (facility) => {
    setFacilityToDelete(facility);
    setIsDeleteOpen(true);
  };
  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
    setFacilityToDelete(null);
  };
  const handleDelete = async () => {
    if (!facilityToDelete) return;
    const res = await deleteResource(facilityToDelete._id);
    if (res.success) {
      toast({ title: "Facility deleted!", status: "success", duration: 2000, isClosable: true });
      fetchResources();
    } else {
      toast({ title: "Error", description: res.message, status: "error", duration: 3000, isClosable: true });
    }
    closeDeleteDialog();
  };

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Facility Management
            </Text>
            <Text color="gray.600">Monitor and manage campus resources</Text>
          </Box>
          <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={openAddModal}>
            Add Facility
          </Button>
        </HStack>

        {/* Add/Edit Facility Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{isEditing ? "Edit Facility" : "Add New Facility"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired mb={3}>
                <FormLabel>Name</FormLabel>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Facility Name" />
              </FormControl>
              <FormControl isRequired mb={3}>
                <FormLabel>Location</FormLabel>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" />
              </FormControl>
              <FormControl isRequired mb={3}>
                <FormLabel>Type</FormLabel>
                <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {FACILITY_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired mb={3}>
                <FormLabel>Capacity</FormLabel>
                <NumberInput min={1} value={form.capacity} onChange={(_, v) => setForm(f => ({ ...f, capacity: v }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="green" onClick={handleSubmit} isLoading={isSubmitting}>
                {isEditing ? "Update Facility" : "Add Facility"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <Card bg="white">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Total Facilities</StatLabel>
                    <StatNumber color="#344E41">{totalFacilities}</StatNumber>
                    <StatHelpText>Across campus</StatHelpText>
                  </Box>
                  <Box color="#344E41" fontSize="2xl">
                    <FiHome />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="white">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Average Capacity</StatLabel>
                    <StatNumber color="#A4C3A2">{avgCapacity}</StatNumber>
                    <StatHelpText>People per facility</StatHelpText>
                  </Box>
                  <Box color="#A4C3A2" fontSize="2xl">
                    <FiUsers />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Facility Type Pie Chart */}
        <Card bg="white">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Facility Types Distribution
            </Text>
            <Box h={{ base: "250px", md: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Facilities Table */}
        <Card bg="white">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              All Facilities
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Location</Th>
                  <Th>Type</Th>
                  <Th>Capacity</Th>
                  <Th>Status</Th>
                  <Th>Bookings</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredResources.map((facility) => (
                  <Tr key={facility._id}>
                    <Td>{facility.name}</Td>
                    <Td>{facility.location}</Td>
                    <Td>
                      <Badge colorScheme="blue">{facility.type.replace("_", " ")}</Badge>
                    </Td>
                    <Td>{facility.capacity}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(facility.status)}>
                        {facility.status ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td>{getBookingCount(facility._id)}</Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit />} onClick={() => openEditModal(facility)}>Edit</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => openDeleteDialog(facility)}>
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
        <ComfirmationMessage
          title="Confirm delete facility?"
          description="This facility will be permanently deleted and cannot be restored."
          isOpen={isDeleteOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDelete}
        />
      </VStack>
    </Box>
  );
}
