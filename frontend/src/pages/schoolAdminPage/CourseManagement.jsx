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
  Textarea,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiDownload } from "react-icons/fi"
import { useState } from "react"

export function CourseManagement() {
  const { courses, addCourse, updateCourse, deleteCourse } = useAcademicStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const toast = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    description: "",
    credits: "",
    department: "",
    duration: "",
    status: "Active",
  })

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || course.status === statusFilter
    const matchesDepartment = departmentFilter === "All" || course.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleSubmit = () => {
    if (!formData.courseCode || !formData.courseName || !formData.credits) {
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
      updateCourse(selectedCourse.id, formData)
      toast({
        title: "Success",
        description: "Course updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } else {
      addCourse({ ...formData, modules: [], lecturers: [], students: [] })
      toast({
        title: "Success",
        description: "Course added successfully",
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
      courseCode: "",
      courseName: "",
      description: "",
      credits: "",
      department: "",
      duration: "",
      status: "Active",
    })
    setSelectedCourse(null)
    setIsEditing(false)
  }

  const handleEdit = (course) => {
    setSelectedCourse(course)
    setFormData(course)
    setIsEditing(true)
    onOpen()
  }

  const handleView = (course) => {
    setSelectedCourse(course)
    onViewOpen()
  }

  const handleDelete = (id) => {
    deleteCourse(id)
    toast({
      title: "Success",
      description: "Course deleted successfully",
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
              Course Management
            </Text>
            <Text color="gray.600">Manage courses and curriculum</Text>
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
              Add Course
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
                  placeholder="Search courses..."
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

        {/* Courses Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
              Courses ({filteredCourses.length})
            </Text>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Course Code</Th>
                    <Th>Course Name</Th>
                    <Th>Department</Th>
                    <Th>Credits</Th>
                    <Th>Duration</Th>
                    <Th>Modules</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCourses.map((course) => (
                    <Tr key={course.id}>
                      <Td>
                        <Text fontWeight="medium">{course.courseCode}</Text>
                      </Td>
                      <Td>
                        <Box>
                          <Text fontWeight="medium">{course.courseName}</Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {course.description}
                          </Text>
                        </Box>
                      </Td>
                      <Td>{course.department}</Td>
                      <Td>{course.credits}</Td>
                      <Td>{course.duration}</Td>
                      <Td>
                        <Badge colorScheme="blue">{course.modules?.length || 0} modules</Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={course.status === "Active" ? "green" : "red"}>{course.status}</Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(course)}>
                              View Details
                            </MenuItem>
                            <MenuItem icon={<FiEdit />} onClick={() => handleEdit(course)}>
                              Edit
                            </MenuItem>
                            <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(course.id)} color="red.500">
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

        {/* Add/Edit Course Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{isEditing ? "Edit Course" : "Add New Course"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Course Code</FormLabel>
                  <Input
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="CS101"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Credits</FormLabel>
                  <Input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    placeholder="3"
                  />
                </FormControl>
                <FormControl isRequired>
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
                  <FormLabel>Duration</FormLabel>
                  <Select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option value="">Select Duration</option>
                    <option value="1 Semester">1 Semester</option>
                    <option value="2 Semesters">2 Semesters</option>
                    <option value="1 Year">1 Year</option>
                  </Select>
                </FormControl>
              </Grid>
              <FormControl mt={4} isRequired>
                <FormLabel>Course Name</FormLabel>
                <Input
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="Introduction to Computer Science"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  rows={3}
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
                {isEditing ? "Update" : "Add"} Course
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Course Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Course Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedCourse && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Box>
                      <Text fontSize="xl" fontWeight="bold">
                        {selectedCourse.courseName}
                      </Text>
                      <Text color="gray.600">{selectedCourse.courseCode}</Text>
                      <Badge colorScheme={selectedCourse.status === "Active" ? "green" : "red"}>
                        {selectedCourse.status}
                      </Badge>
                    </Box>
                  </HStack>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                      <Text fontWeight="semibold">Department:</Text>
                      <Text>{selectedCourse.department}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Credits:</Text>
                      <Text>{selectedCourse.credits}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Duration:</Text>
                      <Text>{selectedCourse.duration}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Modules:</Text>
                      <Text>{selectedCourse.modules?.length || 0} modules</Text>
                    </Box>
                  </Grid>
                  <Box>
                    <Text fontWeight="semibold">Description:</Text>
                    <Text>{selectedCourse.description}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Assigned Modules:</Text>
                    <HStack wrap="wrap">
                      {selectedCourse.modules?.map((module) => (
                        <Badge key={module} colorScheme="blue">
                          {module}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Assigned Lecturers:</Text>
                    <HStack wrap="wrap">
                      {selectedCourse.lecturers?.map((lecturer) => (
                        <Badge key={lecturer} colorScheme="green">
                          {lecturer}
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
