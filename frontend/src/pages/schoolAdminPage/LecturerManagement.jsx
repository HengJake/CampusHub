"use client"

import {
  Box,
  Button,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  Select,
  HStack,
  VStack,
  Badge,
  Avatar,
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
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Grid,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiDownload } from "react-icons/fi"
import { useState } from "react"

export function LecturerManagement() {
  const { lecturers, addLecturer, updateLecturer, deleteLecturer } = useAcademicStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const toast = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [selectedLecturer, setSelectedLecturer] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    lecturerId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    status: "Active",
  })

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesSearch =
      lecturer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lecturerId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || lecturer.status === statusFilter
    const matchesDepartment = departmentFilter === "All" || lecturer.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.lecturerId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (isEditing) {
      updateLecturer(selectedLecturer.id, formData)
      toast({
        title: "Success",
        description: "Lecturer updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } else {
      addLecturer({ ...formData, hireDate: new Date().toISOString().split("T")[0], modules: [] })
      toast({
        title: "Success",
        description: "Lecturer added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormData({
      lecturerId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      specialization: "",
      status: "Active",
    })
    setSelectedLecturer(null)
    setIsEditing(false)
  }

  const handleEdit = (lecturer) => {
    setSelectedLecturer(lecturer)
    setFormData(lecturer)
    setIsEditing(true)
    onOpen()
  }

  const handleView = (lecturer) => {
    setSelectedLecturer(lecturer)
    onViewOpen()
  }

  const handleDelete = (id) => {
    deleteLecturer(id)
    toast({
      title: "Success",
      description: "Lecturer deleted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Lecturer Management
            </Text>
            <Text color="gray.600">Manage lecturer accounts and assignments</Text>
          </Box>
          <HStack>
            <Button leftIcon={<FiDownload />} variant="outline">
              Export
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => {
                resetForm()
                onOpen()
              }}
            >
              Add Lecturer
            </Button>
          </HStack>
        </HStack>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
              <InputGroup>
                <InputLeftElement>
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search lecturers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Lecturers Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
              Lecturers ({filteredLecturers.length})
            </Text>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Lecturer</Th>
                    <Th>Lecturer ID</Th>
                    <Th>Department</Th>
                    <Th>Specialization</Th>
                    <Th>Modules</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredLecturers.map((lecturer) => (
                    <Tr key={lecturer.id}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={`${lecturer.firstName} ${lecturer.lastName}`} />
                          <Box>
                            <Text fontWeight="medium">{`${lecturer.firstName} ${lecturer.lastName}`}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {lecturer.email}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>{lecturer.lecturerId}</Td>
                      <Td>{lecturer.department}</Td>
                      <Td>{lecturer.specialization}</Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          {lecturer.modules?.slice(0, 2).map((module) => (
                            <Badge key={module} size="sm" colorScheme="purple">
                              {module}
                            </Badge>
                          ))}
                          {lecturer.modules?.length > 2 && (
                            <Text fontSize="xs" color="gray.500">
                              +{lecturer.modules.length - 2} more
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={lecturer.status === "Active" ? "green" : "red"}>{lecturer.status}</Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(lecturer)}>
                              View Details
                            </MenuItem>
                            <MenuItem icon={<FiEdit />} onClick={() => handleEdit(lecturer)}>
                              Edit
                            </MenuItem>
                            <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(lecturer.id)} color="red.500">
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        {/* Add/Edit Lecturer Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{isEditing ? "Edit Lecturer" : "Add New Lecturer"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Lecturer ID</FormLabel>
                  <Input
                    value={formData.lecturerId}
                    onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                    placeholder="LEC001"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Dr. John"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Wilson"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="j.wilson@university.edu"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-0200"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                  </Select>
                </FormControl>
              </Grid>
              <FormControl mt={4}>
                <FormLabel>Specialization</FormLabel>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Software Engineering"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Status</FormLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit}>
                {isEditing ? "Update" : "Add"} Lecturer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Lecturer Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Lecturer Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedLecturer && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Avatar size="lg" name={`${selectedLecturer.firstName} ${selectedLecturer.lastName}`} />
                    <Box>
                      <Text fontSize="xl" fontWeight="bold">
                        {`${selectedLecturer.firstName} ${selectedLecturer.lastName}`}
                      </Text>
                      <Text color="gray.600">{selectedLecturer.lecturerId}</Text>
                      <Badge colorScheme={selectedLecturer.status === "Active" ? "green" : "red"}>
                        {selectedLecturer.status}
                      </Badge>
                    </Box>
                  </HStack>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                      <Text fontWeight="semibold">Email:</Text>
                      <Text>{selectedLecturer.email}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Phone:</Text>
                      <Text>{selectedLecturer.phone}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Department:</Text>
                      <Text>{selectedLecturer.department}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Specialization:</Text>
                      <Text>{selectedLecturer.specialization}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Hire Date:</Text>
                      <Text>{selectedLecturer.hireDate}</Text>
                    </Box>
                  </Grid>
                  <Box>
                    <Text fontWeight="semibold">Assigned Modules:</Text>
                    <HStack wrap="wrap">
                      {selectedLecturer.modules?.map((module) => (
                        <Badge key={module} colorScheme="purple">
                          {module}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}
