"use client";


import React, { useEffect, useState } from "react";

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
} from "@chakra-ui/react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useAcademicStore } from "../../store/academic.js";

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    status: "Active",
    userId: ""
  });
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSubAdminOpen,
    onOpen: onSubAdminOpen,
    onClose: onSubAdminClose,
  } = useDisclosure();
  const toast = useToast();

  // Get academic store functions
  const {
    schools,
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


  // Load data on component mount
  useEffect(() => {
    // loadData();
    fetchSchools();
  }, []);


  const loadData = async () => {
    try {
      // Fetch all students and lecturers to get user counts
      await fetchStudents();
      await fetchLecturers();
      
      // Mock school admins data
      setSchoolAdmins([
        {
          _id: "admin1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@apu.edu.my",
          role: "schoolAdmin",
          clients: ["Asia Pacific University"]
        },
        {
          _id: "admin2", 
          name: "Prof. Michael Chen",
          email: "michael.chen@bpu.edu.my",
          role: "schoolAdmin",
          clients: ["Borneo Pacific University"]
        }
      ]);
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
      userId: school.userId
    });
    onOpen();
  };

  const handleDelete = async (schoolId) => {
    try {
      const result = await deleteSchool(schoolId);
      if (!result.success) throw new Error(result.message);
      toast({
        title: "School deleted",
        description: "School has been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting school",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
        userId: ""
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

  const getSchoolStats = (schoolId) => {
    // This fetch from academic store by schoolId
    return {
      students: Math.floor(Math.random() * 1000) + 500,
      staff: Math.floor(Math.random() * 100) + 50
    };
  };

  const getSchoolAdmin = (userId) => {
    const admin = schoolAdmins.find(admin => admin._id === userId);
    return admin ? admin.name : "Unassigned";
  };

  return (
    <VStack w={"100%"} h={"100%"} pr={10} pl={7} gap={8}>
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
        <Spacer/>
        <HStack>
          <Button leftIcon={<Plus />} colorScheme="blue" onClick={onOpen}>
            Add Client
          </Button>
          <Button leftIcon={<Eye />} variant="outline" onClick={onSubAdminOpen}>
            View Sub-Admins
          </Button>
        </HStack>
      </Flex>

      {/* Search and Filters */}
      <Card  w={"100%"}>
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

      {/* Schools Table */}
      <Card w={"100%"} h={"fit-content"}>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>School Name</Th>
                  <Th>Location</Th>
                  <Th>Sub-Admin</Th>
                  <Th>Users</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSchools.map((school) => {
                  const stats = getSchoolStats(school._id);
                  return (
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
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">Students: {stats.students}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Staff: {stats.staff}
                          </Text>
                        </VStack>
                      </Td>
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
                        <HStack>
                          <IconButton
                            icon={<Edit />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(school)}
                          />
                          <IconButton
                            icon={<Trash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(school._id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
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
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input 
                  placeholder="Enter address" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input 
                  placeholder="Enter city" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input 
                  placeholder="Enter country" 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Assign School Admin</FormLabel>
                <Select 
                  placeholder="Select school admin"
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                >
                  {schoolAdmins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name}
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

      {/* Sub-Admins Modal */}
      <Modal isOpen={isSubAdminOpen} onClose={onSubAdminClose} size="xl">
        <ModalOverlay />
        <ModalContent w={"100%"}>
          <ModalHeader>School Admins Management</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Assigned Schools</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {schoolAdmins.map((admin) => (
                    <Tr key={admin._id}>
                      <Td>{admin.name}</Td>
                      <Td>{admin.email}</Td>
                      <Td>
                        {admin.clients.length > 0 ? (
                          admin.clients.map((client) => (
                            <Badge key={client} mr={1} mb={1}>
                              {client}
                            </Badge>
                          ))
                        ) : (
                          <Text color="gray.500">No schools assigned</Text>
                        )}
                      </Td>
                      <Td>
                        <HStack>
                          <Button size="sm" variant="outline">
                            Reassign
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit Role
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSubAdminClose} fontWeight={"bold"} w={"100%"} _hover={{bgColor:"red", color:"white"}}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
