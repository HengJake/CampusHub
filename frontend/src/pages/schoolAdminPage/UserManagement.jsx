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
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiDownload } from "react-icons/fi"
import { useState } from "react"
import { useAdminStore } from "../../store/TBI/adminStore.js"

export function StudentManagement() {
  const { students, addStudent, updateStudent, deleteStudent } = useAdminStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    year: "",
    phone: "",
    address: "",
  })

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.studentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (selectedStudent) {
      updateStudent(selectedStudent.id, formData)
      toast({
        title: "Success",
        description: "Student updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } else {
      addStudent({ ...formData, status: "Active", joinDate: new Date().toISOString().split("T")[0] })
      toast({
        title: "Success",
        description: "Student added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }

    setFormData({
      name: "",
      email: "",
      studentId: "",
      department: "",
      year: "",
      phone: "",
      address: "",
    })
    setSelectedStudent(null)
    onClose()
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setFormData(student)
    onOpen()
  }

  const handleDelete = (id) => {
    deleteStudent(id)
    toast({
      title: "Success",
      description: "Student deleted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const exportStudents = () => {
    const csvContent = [
      ["Name", "Email", "Student ID", "Department", "Year", "Status"],
      ...filteredStudents.map((student) => [
        student.name,
        student.email,
        student.studentId,
        student.department,
        student.year,
        student.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Box p={6} flex={1} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Student Management
            </Text>
            <Text color="gray.600">Manage student accounts and information</Text>
          </Box>
          <HStack>
            <Button leftIcon={<FiDownload />} variant="outline" onClick={exportStudents}>
              Export
            </Button>
            <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={onOpen}>
              Add Student
            </Button>
          </HStack>
        </HStack>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack spacing={4}>
              <Box flex="1">
                <Input
                  placeholder="Search students..."
                  leftElement={<FiSearch />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
              <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Students Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Student ID</Th>
                  <Th>Department</Th>
                  <Th>Year</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredStudents.map((student) => (
                  <Tr key={student.id}>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={student.name} />
                        <Box>
                          <Text fontWeight="medium">{student.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {student.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>{student.studentId}</Td>
                    <Td>{student.department}</Td>
                    <Td>{student.year}</Td>
                    <Td>
                      <Badge colorScheme={student.status === "Active" ? "green" : "red"}>{student.status}</Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit />} onClick={() => handleEdit(student)}>
                            Edit
                          </MenuItem>
                          <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(student.id)} color="red.500">
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

        {/* Add/Edit Student Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedStudent ? "Edit Student" : "Add New Student"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Student ID</FormLabel>
                  <Input
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
                <FormControl>
                  <FormLabel>Year</FormLabel>
                  <Select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={handleSubmit}>
                {selectedStudent ? "Update" : "Add"} Student
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}
