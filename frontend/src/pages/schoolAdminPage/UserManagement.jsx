"use client"

import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Text,
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
  useColorModeValue,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spacer,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiDownload } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAdminStore } from "../../store/TBI/adminStore.js"
import { useAcademicStore } from "../../store/academic.js";

export function StudentManagement() {

  const { students, fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent } = useAcademicStore();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // Changed from "All" to "all"
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

  useEffect(() => {
    fetchStudents();
  }, [])
  console.log("🚀 ~ StudentManagement ~ students:", students)

  let filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student._id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleSubmit = () => {
    console.log("add student")

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

    console.log("delete user")

    setSelectedStudent(student)
    setFormData(student)
    onOpen()
  }

  const handleDelete = (id) => {

    console.log("delete user")

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
        student.userId.name,
        student.userId.email,
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
            <HStack spacing={4} mb={4} flexWrap="wrap" gap={2}>
              <Box flex="1" minW="200px">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="md"
                />
              </Box>
              <Select
                w={{ base: "full", sm: "200px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="dropped">Dropped</option>
                <option value="suspended">Suspended</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Students Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            {/* Desktop Table View */}
            <Box display={{ base: "none", lg: "block" }}>
              {filteredStudents.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No students found</Text>
                </Box>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Student</Th>
                      <Th>Student ID</Th>
                      <Th>Course</Th>
                      <Th>Intake</Th>
                      <Th>Year</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredStudents.map((student) => (
                      <Tr key={student._id}>
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={student.userId.name} />
                            <Box>
                              <Text fontWeight="medium">{student.userId.name}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {student.userId.email}
                              </Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td>{student._id}</Td>
                        <Td>{student.intakeCourseId.courseId.courseName}</Td>
                        <Td>{student.intakeCourseId.intakeId.intakeName}</Td>
                        <Td>{student.year}</Td>
                        <Td>
                          <Badge colorScheme={student.status === "active" ? "green" : "red"}>{student.status}</Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button size="sm" colorScheme="blue" onClick={() => handleEdit(student)}>
                              <FiEdit />
                            </Button>
                            <Button size="sm" colorScheme="red" onClick={() => handleDelete(student._id)}>
                              <FiTrash2 />
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {/* Mobile Accordion View */}
            <Box display={{ base: "block", lg: "none" }}>
              {filteredStudents.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No students found</Text>
                </Box>
              ) : (
                <Accordion allowMultiple>
                  {filteredStudents.map((student) => (
                    <AccordionItem key={student._id}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            <HStack>
                              <Avatar size="sm" name={student.userId.name} />
                              <Box>
                                <Text fontWeight="medium">{student.userId.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {student.userId.email}
                                </Text>
                              </Box>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={3} align="stretch">
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Student ID:</Text>
                            <Text>{student._id}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Course:</Text>
                            <Text>{student.intakeCourseId.courseId.courseName}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Intake:</Text>
                            <Text>{student.intakeCourseId.intakeId.intakeName}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Year:</Text>
                            <Text>{student.year}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Status:</Text>
                            <Badge colorScheme={student.status === "active" ? "green" : "red"}>
                              {student.status}
                            </Badge>
                          </Flex>
                          <HStack spacing={2} justify="center" pt={2}>
                            <Button size="sm" colorScheme="blue" onClick={() => handleEdit(student)}>
                              <FiEdit />
                            </Button>
                            <Button size="sm" colorScheme="red" onClick={() => handleDelete(student._id)}>
                              <FiTrash2 />
                            </Button>
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </Box>
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

