// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: client-management.jsx
// Description: Client management interface for company administrators to oversee client schools, manage relationships, and monitor client status
// First Written on: July 12, 2024
// Edited on: Friday, August 10, 2024

"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
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
  Select,
  Card,
  CardBody,
  Flex,
  Spacer,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useAcademicStore } from "../../store/academic.js";
import { useUserStore } from "../../store/user.js";


// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    status: "Active",
    userId: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    schoolId: null,
    schoolName: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSubAdminOpen,
    onOpen: onSubAdminOpen,
    onClose: onSubAdminClose,
  } = useDisclosure();
  const toast = useToast();

  // Get academic store functions
  const {
    students,
    schools,
    lecturers,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    loading,
    errors,
    fetchStudents,
    fetchLecturers,
    fetchStudentsBySchoolId,
    fetchLecturersBySchoolId,
  } = useAcademicStore();

  // Get user store functions
  const { fetchUsers, users } = useUserStore();

  // Load data on component mount
  useEffect(() => {
    fetchSchools();
    fetchStudents();
    fetchLecturers();
    fetchUsers();
  }, [fetchSchools, fetchStudents, fetchLecturers, fetchUsers]);

  // Monitor data loading for debugging
  useEffect(() => {
    console.log('Schools loaded:', schools.length);
    console.log('Students loaded:', students.length);
    console.log('Lecturers loaded:', lecturers.length);

    if (students.length > 0) {
      console.log('Sample student:', students[0]);
      console.log('Student schoolId:', students[0].schoolId);
    }

    if (schools.length > 0) {
      console.log('Sample school:', schools[0]);
      console.log('School _id:', schools[0]._id);
    }
  }, [schools, students, lecturers]);

  // Remove debug console.log

  const loadData = async () => {
    try {
      // Fetch all students and lecturers to get user counts
      await fetchStudents();
      await fetchLecturers();
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };



  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (school) => {
    setSelectedClient(school);
    setFormData({
      name: school.name,
      address: school.address,
      city: school.city,
      country: school.country,
      status: school.status,
      userId: school.userId || "",
    });
    onOpen();
  };

  const handleDelete = (schoolId, schoolName) => {
    setDeleteModal({
      isOpen: true,
      schoolId: schoolId,
      schoolName: schoolName
    });
  };

  const deleteAllSchoolData = async (schoolId) => {
    try {
      const response = await fetch(`/api/school-data-status/${schoolId}/all-data`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete school data');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Error deleting school data: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First, delete all school data
      toast({
        title: "Deleting school data",
        description: "Please wait while we clean up all school data...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      const dataDeletionResult = await deleteAllSchoolData(deleteModal.schoolId);
      
      if (!dataDeletionResult.success) {
        throw new Error(dataDeletionResult.message);
      }

      // Then delete the school record itself
      const schoolDeletionResult = await deleteSchool(deleteModal.schoolId);
      
      if (!schoolDeletionResult.success) {
        throw new Error(schoolDeletionResult.message);
      }

      toast({
        title: "School completely deleted",
        description: `Successfully deleted school and ${dataDeletionResult.data?.totalDeleted || 0} related records`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      setDeleteModal({ isOpen: false, schoolId: null, schoolName: "" });
    } catch (error) {
      toast({
        title: "Error deleting school",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, schoolId: null, schoolName: "" });
  };

  const handleSubmit = async () => {
    try {
      if (selectedClient) {
        // Update existing school
        const result = await updateSchool(selectedClient._id, formData);
        if (!result.success) throw new Error(result.message);
        toast({
          title: "School updated",
          description: "School has been successfully updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new school
        const result = await createSchool(formData);
        if (!result.success) throw new Error(result.message);
        toast({
          title: "School created",
          description: "School has been successfully created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      setSelectedClient(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        country: "",
        status: "Active",
        userId: "",
      });
    } catch (error) {
      toast({
        title: "Error saving school",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStudentCount = (schoolId) => {
    // Filter students by schoolId to get actual count
    // Convert ObjectIds to strings for proper comparison
    const studentCount = students.filter((student) =>
      student.schoolId && student.schoolId._id.toString() === schoolId.toString()
    ).length;

    // Debug logging to see what's happening
    console.log(`School ${schoolId}: ${studentCount} students`);
    console.log(`Total students loaded: ${students.length}`);

    return studentCount;
  };

  const getLecturerCount = (schoolId) => {
    return lecturers.filter((lecturer) =>
      lecturer.schoolId && lecturer.schoolId.toString() === schoolId.toString()
    ).length;
  };

  const getSchoolStats = (schoolId) => {
    // Get actual student count
    const studentCount = getStudentCount(schoolId);
    // For staff count, we can use lecturers count if available
    const lecturerCount = getLecturerCount(schoolId);

    return {
      students: studentCount,
      staff: lecturerCount,
    };
  };

  const getSchoolAdmin = (userId) => {
    // Find the user from the school's userId reference
    if (!userId) return "Unassigned";
    const user = users.find((user) => user._id === userId);
    return user ? user.name : "Unassigned";
  };

  // Pie chart data for overall user distribution
  const getOverallUserStats = () => {
    const totalStudents = students.length;
    const totalLecturers = lecturers.length;
    
    return {
      labels: ['Students', 'Lecturers'],
      datasets: [
        {
          data: [totalStudents, totalLecturers],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const getSchoolUserStats = (schoolId) => {
    const studentCount = getStudentCount(schoolId);
    const lecturerCount = getLecturerCount(schoolId);

    return {
      labels: ['Students', 'Lecturers'],
      datasets: [
        {
          data: [studentCount, lecturerCount],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <VStack w={"100%"} h={"100%"} pl={2} gap={8}>
      {/* Header */}
      <Flex w={"100%"}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Client Management
          </Text>
          <Text color="gray.600">
            Manage school clients and their information
          </Text>
        </Box>
        <Spacer />
        <HStack>
          <Button leftIcon={<Plus />} colorScheme="blue" onClick={onOpen}>
            Add Client
          </Button>
        </HStack>
      </Flex>

      {/* Search and Filters */}
      <Card w={"100%"}>
        <CardBody>
          <HStack spacing={4}>
            <Box position="relative" flex={1}>
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl={10}
              />
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
              >
                <Search size={16} color="gray" />
              </Box>
            </Box>
            <Select placeholder="Filter by status" w="200px">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* User Distribution Pie Chart */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} w="100%">
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Overall User Distribution
                </Text>
                <Box w="100%" h="300px" display="flex" justifyContent="center" alignItems="center">
                  {loading.students || loading.lecturers ? (
                    <Text textAlign="center">Loading chart data...</Text>
                  ) : (
                    <Box w="250px" h="250px">
                      <Pie data={getOverallUserStats()} options={pieChartOptions} />
                    </Box>
                  )}
                </Box>
                <HStack spacing={8} justify="center">
                  <HStack spacing={2}>
                    <Box w={3} h={3} bg="rgba(54, 162, 235, 0.8)" borderRadius="full" />
                    <Text fontSize="sm">Students: {students.length}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Box w={3} h={3} bg="rgba(255, 99, 132, 0.8)" borderRadius="full" />
                    <Text fontSize="sm">Lecturers: {lecturers.length}</Text>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card height={"full"}>
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Summary Statistics
                </Text>
                <VStack spacing={3} align="stretch" w="100%">
                  <HStack justify="space-between">
                    <Text>Total Schools:</Text>
                    <Badge colorScheme="blue" fontSize="md">
                      {schools.length}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Active Schools:</Text>
                    <Badge colorScheme="green" fontSize="md">
                      {schools.filter(s => s.status === 'Active').length}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Total Users:</Text>
                    <Badge colorScheme="purple" fontSize="md">
                      {students.length + lecturers.length}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Student Ratio:</Text>
                    <Badge colorScheme="teal" fontSize="md">
                      {students.length > 0 ? ((students.length / (students.length + lecturers.length)) * 100).toFixed(1) : 0}%
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Quick Stats Cards */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} w="100%">
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {students.length}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Students
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="pink.500">
                  {lecturers.length}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Lecturers
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {schools.length}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Schools
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {schools.filter(s => s.status === 'Active').length}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Active Schools
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Schools Table */}
      <Card w={"100%"} h={"fit-content"}>
        <CardBody>
          {loading.schools || loading.students || loading.lecturers ? (
            <Text textAlign="center" py={4}>
              Loading schools and user data...
            </Text>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box display={{ base: "none", lg: "block" }}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>School Name</Th>
                        <Th>Location</Th>
                        <Th>Sub-Admin</Th>
                        <Th>Status</Th>
                        <Th>Distribution</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredSchools.map((school) => (
                        <Tr key={school._id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{school.name}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {school.address}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">{school.city}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {school.country}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>{getSchoolAdmin(school.userId)}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                school.status === "Active" ? "green" : "red"
                              }
                            >
                              {school.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Box w="100%" h="100px" display="flex" justifyContent="center" alignItems="center">
                              {loading.students || loading.lecturers ? (
                                <Text textAlign="center">Loading chart data...</Text>
                              ) : (
                                <Box w="100px" h="100px">
                                  <Pie
                                    data={{
                                      labels: ['Students', 'Lecturers'],
                                      datasets: [
                                        {
                                          data: [getStudentCount(school._id), getLecturerCount(school._id)],
                                          backgroundColor: [
                                            'rgba(54, 162, 235, 0.8)',
                                            'rgba(255, 99, 132, 0.8)',
                                          ],
                                          borderColor: [
                                            'rgba(54, 162, 235, 1)',
                                            'rgba(255, 99, 132, 1)',
                                          ],
                                          borderWidth: 2,
                                        },
                                      ],
                                    }}
                                    options={pieChartOptions}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEdit(school)}
                                leftIcon={<Edit size={16} />}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDelete(school._id, school.name)}
                                leftIcon={<Trash2 size={16} />}
                              >
                                Delete
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Accordion View */}
              <Box display={{ base: "block", lg: "none" }}>
                <Accordion allowMultiple>
                  {filteredSchools.map((school) => (
                    <AccordionItem key={school._id}>
                      <h2>
                        <AccordionButton>
                          <HStack spacing={2} justify="space-between" align="center" w="full">
                            <HStack spacing={4} flex="1" textAlign="left">
                              <Box>
                                <Text fontWeight="medium" fontSize="md">{school.name}</Text>
                                <Text fontSize="sm" color="gray.600">{school.address}</Text>
                                <Text fontSize="xs" color="gray.500">
                                  {school.city}, {school.country}
                                </Text>
                              </Box>
                            </HStack>
                            <AccordionIcon />
                          </HStack>
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={3} align="stretch">
                          <Box>
                            <Text fontWeight="semibold">Sub-Admin:</Text>
                            <Text>{getSchoolAdmin(school.userId._id)}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Status:</Text>
                            <Badge
                              colorScheme={
                                school.status === "Active" ? "green" : "red"
                              }
                            >
                              {school.status}
                            </Badge>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Users:</Text>
                            <Text fontSize="sm">
                              Students: {getStudentCount(school._id)}
                            </Text>
                            <Text fontSize="sm">
                              Staff: {getLecturerCount(school._id)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Distribution:</Text>
                            <Box w="100px" h="100px" mx="auto">
                              <Pie
                                data={getSchoolUserStats(school._id)}
                                options={{
                                  ...pieChartOptions,
                                  plugins: {
                                    ...pieChartOptions.plugins,
                                    legend: { display: false }
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                          {/* Action buttons */}
                          <HStack spacing={2} justify="center" pt={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(school)}
                              leftIcon={<Edit size={16} />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(school._id, school.name)}
                              leftIcon={<Trash2 size={16} />}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            </>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit School Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClient ? "Edit School" : "Add New School"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>School Name</FormLabel>
                <Input
                  placeholder="Enter school name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>School Administrator</FormLabel>
                <Select
                  placeholder="Select school administrator"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value || null })
                  }
                >
                  <option value="">No Administrator</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedClient ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={closeDeleteModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.600">Delete School</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete <strong>{deleteModal.schoolName}</strong>?
              </Text>
              <Text color="red.600" fontSize="md">
                ⚠️ This action will permanently delete:
              </Text>
              <VStack spacing={2} align="start" w="100%" pl={4}>
                <Text>• All student and lecturer accounts</Text>
                <Text>• All academic records (courses, modules, schedules)</Text>
                <Text>• All facility bookings and resources</Text>
                <Text>• All service records (feedback, lost items)</Text>
                <Text>• All transportation data</Text>
                <Text>• The school record itself</Text>
              </VStack>
              <Text color="red.600" fontWeight="bold">
                This action cannot be undone!
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete School & All Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
