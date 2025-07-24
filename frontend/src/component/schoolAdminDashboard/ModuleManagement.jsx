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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Grid,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  TagCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Checkbox,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiDownload } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../store/academic";
import { useShowToast } from "../../store/utils/toast";
import ComfirmationMessage from "../common/ComfirmationMessage.jsx";

export function ModuleManagement() {
  const {
    modules,
    courses,
    createModule,
    updateModule,
    deleteModule,
    fetchModules,
    fetchCourses
  } = useAcademicStore()


  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const showToast = useShowToast();

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [courseFilter, setCourseFilter] = useState("All")
  const [selectedModule, setSelectedModule] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    moduleName: "",
    code: "",
    moduleDescription: "",
    totalCreditHour: "",
    courseId: [], // Now always an array
    prerequisites: [], // Now always an array
    learningOutcomes: [],
    assessmentMethods: [],
    isActive: true,
  })
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);



  const openDeleteDialog = (moduleId) => {
    setModuleToDelete(moduleId);
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
    setModuleToDelete(null);
  };

  useEffect(() => {
    if (modules.length === 0) {
      fetchModules();
    }
    if (courses.length === 0) {
      fetchCourses();
    }
  }, [])
  // console.log("🚀 ~ useEffect ~ modules:", modules)
  // console.log("🚀 ~ useEffect ~ courses:", courses)

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const filteredModules = modules.filter((module) => {
    // Defensive programming: Check if module exists and has required properties
    if (!module) return false;

    const moduleName = module.moduleName ? module.moduleName : "";
    const code = module.code ? module.code : "";
    const description = module.moduleDescription ? module.moduleDescription : "";

    const matchesSearch =
      moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" ||
      (statusFilter === "true" && module.isActive === true) ||
      (statusFilter === "false" && module.isActive === false)

    // Handle courseId as an array of course documents
    const matchesCourse = courseFilter === "All" ||
      (module.courseId && Array.isArray(module.courseId) &&
        module.courseId.some(course => course.courseName === courseFilter));

    return matchesSearch && matchesStatus && matchesCourse
  })

  const handleSubmit = async () => {
    if (!formData.moduleName || !formData.code || !formData.moduleDescription || !formData.totalCreditHour || !formData.courseId.length) {
      showToast.error("Error", "Please fill in all required fields", "module-validation");
      return
    }

    const submitData = {
      ...formData,
      courseId: formData.courseId, // array of course IDs
      prerequisites: formData.prerequisites, // array of module IDs
    }
    // console.log("🚀 ~ handleSubmit ~ submitData:", submitData)

    if (isEditing) {
      if (!selectedModule || !selectedModule._id) {
        showToast.error("Error", "No module selected for editing", "module-edit-error");
        return;
      }
      const res = await updateModule(selectedModule._id, submitData)
      if (!res.success) {
        showToast.error("Error", res.message, "module-edit");
        return
      }
      showToast.success("Success", res.message, "module-edit");
    } else {
      const res = await createModule(submitData)
      if (!res.success) {
        showToast.error("Error", res.message, "module-add");
        return
      }
      showToast.success("Success", res.message, "module-add");
    }

    fetchCourses();
    fetchModules();
    resetForm();
    onClose();
  }

  const resetForm = () => {
    setFormData({
      moduleName: "",
      code: "",
      moduleDescription: "",
      totalCreditHour: "",
      courseId: [],
      prerequisites: [],
      learningOutcomes: [],
      assessmentMethods: [],
      isActive: true,
    })
    setSelectedModule(null)
    setIsEditing(false)
  }

  const handleEdit = (module) => {
    if (!module) {
      showToast.error("Error", "Invalid module data", "module-edit-error");
      return;
    }
    setSelectedModule(module)
    setFormData({
      moduleName: module.moduleName || "",
      code: module.code || "",
      moduleDescription: module.moduleDescription || "",
      totalCreditHour: module.totalCreditHour || "",
      courseId: Array.isArray(module.courseId)
        ? module.courseId.filter(c => c && c._id).map(c => c._id)
        : module.courseId?._id
          ? [module.courseId._id]
          : [],

      prerequisites: Array.isArray(module.prerequisites)
        ? module.prerequisites.map(p => typeof p === "string" ? p : p._id)
        : [],

      learningOutcomes: module.learningOutcomes || [],
      assessmentMethods: module.assessmentMethods || [],
      isActive: module.isActive !== undefined ? module.isActive : true,
    })
    setIsEditing(true)
    onOpen()
  }

  const handleView = (module) => {
    if (!module) {
      showToast.error("Error", "Invalid module data", "module-view-error");
      return;
    }

    setSelectedModule(module)
    onViewOpen()
  }

  const handleDelete = async () => {
    if (!moduleToDelete) {
      showToast.error("Error", "Invalid module ID", "module-delete-error");
      return;
    }
    await deleteModule(moduleToDelete);
    showToast.success("Success", "Module deleted successfully", "module-delete");
    fetchModules();
    closeDeleteDialog();
  };

  const exportModules = () => {
    const csvContent = [
      ["Module Code", "Module Name", "Description", "Credit Hours", "Courses", "Assessment Methods", "Status"],
      ...filteredModules.map((module) => [
        module.code || "N/A",
        module.moduleName || "N/A",
        module.moduleDescription || "N/A",
        module.totalCreditHour || "N/A",
        Array.isArray(module.courseId)
          ? module.courseId.map(c => c.courseName || c).join("; ")
          : "N/A",
        (module.assessmentMethods || []).join("; "),
        module.isActive ? "Active" : "Inactive",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "modules.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const assessmentOptions = [
    { value: "exam", label: "Exam" },
    { value: "assignment", label: "Assignment" },
    { value: "project", label: "Project" },
    { value: "presentation", label: "Presentation" },
    { value: "quiz", label: "Quiz" },
  ]

  useEffect(() => {
    // console.log("🚀 ~ ModuleManagement ~ formData:", formData)
  }, [formData])

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Module Management
            </Text>
            <Text color="gray.600">Manage modules and curriculum</Text>
          </Box>
          <HStack>
            <Button leftIcon={<FiDownload />} variant="outline" onClick={exportModules}>
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
              Add Module
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
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="All">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course.courseName}>
                    {course.courseName}
                  </option>
                ))}
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Modules Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
              Modules ({filteredModules.length})
            </Text>
            {/* Desktop Table View */}
            <Box display={{ base: "none", lg: "block" }}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Module Code</Th>
                    <Th>Module Name</Th>
                    <Th>Course</Th>
                    <Th>Credit Hours</Th>
                    <Th>Assessment Methods</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredModules.map((module) => {
                    if (!module) return null;

                    return (
                      <Tr key={module._id || module.id}>
                        <Td>
                          <Text fontWeight="medium">{module.code || "N/A"}</Text>
                        </Td>
                        <Td>
                          <Box>
                            <Text fontWeight="medium">{module.moduleName || "N/A"}</Text>
                            <Text fontSize="sm" color="gray.600" noOfLines={1}>
                              {module.moduleDescription || "No description"}
                            </Text>
                          </Box>
                        </Td>
                        <Td>
                          {/* Show all course names */}
                          {Array.isArray(module.courseId)
                            ? module.courseId.map((c, idx) => (
                              <Text key={c._id || idx}>{c.courseName || c}</Text>
                            ))
                            : "N/A"}
                        </Td>
                        <Td>{module.totalCreditHour || "N/A"}</Td>
                        <Td>
                          <HStack wrap="wrap">
                            {(module.assessmentMethods || []).map((method, idx) => (
                              <Badge key={idx} colorScheme="blue" size="sm">
                                {method}
                              </Badge>
                            ))}
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={module.isActive ? "green" : "red"}>
                            {module.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                            <MenuList>
                              <MenuItem icon={<FiEye />} onClick={() => handleView(module)}>
                                View Details
                              </MenuItem>
                              <MenuItem icon={<FiEdit />} onClick={() => handleEdit(module)}>
                                Edit
                              </MenuItem>
                              <MenuItem icon={<FiTrash2 />} onClick={() => openDeleteDialog(module._id || module.id)} color="red.500">
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* Mobile Accordion View */}
            <Box display={{ base: "block", lg: "none" }}>
              <Accordion allowMultiple>
                {filteredModules.map((module) => {
                  if (!module) return null;

                  return (
                    <AccordionItem key={module._id || module.id}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            <Text fontWeight="medium">{module.moduleName || "N/A"}</Text>
                            <Text fontSize="sm" color="gray.600">{module.code || "N/A"}</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={3} align="stretch">
                          <Box>
                            <Text fontWeight="semibold">Course:</Text>
                            <Box>
                              {Array.isArray(module.courseId)
                                ? module.courseId.map((c, idx) => (
                                  <Text key={c._id || idx}>{c.courseName || c.code}</Text>
                                ))
                                : "N/A"}
                            </Box>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Credit Hours:</Text>
                            <Text>{module.totalCreditHour || "N/A"}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Assessment Methods:</Text>
                            <HStack wrap="wrap">
                              {(module.assessmentMethods || []).map((method, idx) => (
                                <Badge key={idx} colorScheme="blue" size="sm">
                                  {method}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">Status:</Text>
                            <Badge colorScheme={module.isActive ? "green" : "red"}>
                              {module.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </Box>
                          <HStack spacing={2} justify="center" pt={2}>
                            <Button size="sm" colorScheme="blue" onClick={() => handleView(module)}>
                              <FiEye />
                            </Button>
                            <Button size="sm" colorScheme="blue" onClick={() => handleEdit(module)}>
                              <FiEdit />
                            </Button>
                            <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(module._id || module.id)}>
                              <FiTrash2 />
                            </Button>
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </Box>
          </CardBody>
        </Card>

        {/* Add/Edit Module Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{isEditing ? "Edit Module" : "Add New Module"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Module Code</FormLabel>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS101"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Total Credit Hours</FormLabel>
                  <Input
                    type="number"
                    value={formData.totalCreditHour}
                    onChange={(e) => setFormData({ ...formData, totalCreditHour: e.target.value })}
                    placeholder="3"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Courses</FormLabel>
                  <Popover placement="bottom-start" closeOnBlur={false}>
                    {({ onClose }) => (
                      <>
                        <PopoverTrigger>
                          <Button w="100%" variant="outline">
                            {formData.courseId.length > 0
                              ? `${formData.courseId.length} selected`
                              : "Select Courses"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent minW="240px">
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>Select Courses</PopoverHeader>
                          <PopoverBody maxH="180px" overflowY="auto">
                            <VStack align="start">
                              {courses.map(course => (
                                <Checkbox
                                  key={course._id}
                                  isChecked={formData.courseId.includes(course._id)}
                                  onChange={e => {
                                    let updated;
                                    if (e.target.checked) {
                                      updated = [...formData.courseId, course._id]
                                    } else {
                                      updated = formData.courseId.filter(id => id !== course._id)
                                    }
                                    setFormData({ ...formData, courseId: updated })
                                  }}
                                >
                                  {course.courseName}
                                </Checkbox>
                              ))}
                            </VStack>
                          </PopoverBody>
                          <PopoverFooter>
                            <Button colorScheme="blue" size="sm" onClick={onClose} w="100%">Done</Button>
                          </PopoverFooter>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
                  {/* Show selected as tags */}
                  <HStack wrap="wrap" mt={2}>
                    {formData.courseId.map(cid => {
                      const course = courses.find(c => c._id === cid)
                      return course ? (
                        <Tag key={cid} size="sm" colorScheme="blue" borderRadius="full">
                          <TagLabel>{course.courseName}</TagLabel>
                          <TagCloseButton onClick={() => setFormData({ ...formData, courseId: formData.courseId.filter(id => id !== cid) })} />
                        </Tag>
                      ) : null
                    })}
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}>
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </Select>
                </FormControl>
              </Grid>
              <FormControl mt={4} isRequired>
                <FormLabel>Module Name</FormLabel>
                <Input
                  value={formData.moduleName}
                  onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                  placeholder="Introduction to Programming"
                />
              </FormControl>
              <FormControl mt={4} isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.moduleDescription}
                  onChange={(e) => setFormData({ ...formData, moduleDescription: e.target.value })}
                  placeholder="Module description..."
                  rows={3}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Prerequisites</FormLabel>
                <Popover placement="bottom-start" closeOnBlur={false}>
                  {({ onClose }) => (
                    <>
                      <PopoverTrigger>
                        <Button w="100%" variant="outline">
                          {formData.prerequisites.length > 0
                            ? `${formData.prerequisites.length} selected`
                            : "Select Prerequisites"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent minW="240px">
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Select Prerequisites</PopoverHeader>
                        <PopoverBody maxH="180px" overflowY="auto">
                          <VStack align="start">
                            {modules
                              .filter(m => !isEditing || (selectedModule && m._id !== selectedModule._id))
                              .map(m => (
                                <Checkbox
                                  key={m._id}
                                  isChecked={formData.prerequisites.includes(m._id)}
                                  onChange={e => {
                                    let updated;
                                    if (e.target.checked) {
                                      updated = [...formData.prerequisites, m._id]
                                    } else {
                                      updated = formData.prerequisites.filter(id => id !== m._id)
                                    }
                                    setFormData({ ...formData, prerequisites: updated })
                                  }}
                                >
                                  {m.moduleName}
                                </Checkbox>
                              ))}
                          </VStack>
                        </PopoverBody>
                        <PopoverFooter>
                          <Button colorScheme="blue" size="sm" onClick={onClose} w="100%">Done</Button>
                        </PopoverFooter>
                      </PopoverContent>
                    </>
                  )}
                </Popover>
                {/* Show selected as tags */}
                <HStack wrap="wrap" mt={2}>
                  {formData.prerequisites.map(pid => {
                    const mod = modules.find(m => m._id === pid)
                    return mod ? (
                      <Tag key={pid._id} size="sm" colorScheme="purple" borderRadius="full">
                        <TagLabel>{mod.moduleName}</TagLabel>
                        <TagCloseButton onClick={() => setFormData({ ...formData, prerequisites: formData.prerequisites.filter(id => id !== pid) })} />
                      </Tag>
                    ) : null
                  })}
                </HStack>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Assessment Methods</FormLabel>
                <HStack wrap="wrap">
                  {assessmentOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={formData.assessmentMethods.includes(option.value) ? "solid" : "outline"}
                      colorScheme="blue"
                      onClick={() => {
                        const updatedMethods = formData.assessmentMethods.includes(option.value)
                          ? formData.assessmentMethods.filter(m => m !== option.value)
                          : [...formData.assessmentMethods, option.value]
                        setFormData({ ...formData, assessmentMethods: updatedMethods })
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </HStack>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit}>
                {isEditing ? "Update" : "Add"} Module
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Module Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Module Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedModule && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Box>
                      <Text fontSize="xl" fontWeight="bold">
                        {selectedModule.moduleName || "N/A"}
                      </Text>
                      <Text color="gray.600">{selectedModule.code || "N/A"}</Text>
                      <Badge colorScheme={selectedModule.isActive ? "green" : "red"}>
                        {selectedModule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Box>
                  </HStack>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                      <Text fontWeight="semibold">Course:</Text>
                      <Text>
                        {Array.isArray(selectedModule.courseId)
                          ? selectedModule.courseId.map((course, idx) => (
                            <Text key={course._id || idx}>{course.courseName || course}</Text>
                          ))
                          : "N/A"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Credit Hours:</Text>
                      <Text>{selectedModule.totalCreditHour || "N/A"}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Prerequisites:</Text>
                      <Text>
                        {Array.isArray(selectedModule.prerequisites) && selectedModule.prerequisites.length > 0
                          ? selectedModule.prerequisites
                            .map(pid => {
                              const mod = modules.find(m => m._id === pid)
                              return mod ? mod.moduleName : pid
                            })
                            .join(", ")
                          : "None"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Assessment Methods:</Text>
                      <HStack wrap="wrap">
                        {(selectedModule.assessmentMethods || []).map((method, idx) => (
                          <Badge key={idx} colorScheme="blue">
                            {method}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  </Grid>
                  <Box>
                    <Text fontWeight="semibold">Description:</Text>
                    <Text>{selectedModule.moduleDescription || "No description available"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">Learning Outcomes:</Text>
                    <VStack align="start">
                      {(selectedModule.learningOutcomes || []).length > 0
                        ? selectedModule.learningOutcomes.map((outcome, idx) => (
                          <Badge key={idx} colorScheme="purple">{outcome}</Badge>
                        ))
                        : <Text color="gray.500">None</Text>
                      }
                    </VStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <ComfirmationMessage
          title="Confirm delete module?"
          description="This module will be permanently deleted and cannot be restored."
          isOpen={isDeleteOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDelete}
        />
      </VStack>
    </Box>
  )
}