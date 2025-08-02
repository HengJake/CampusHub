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
  Badge,
  VStack,
  HStack,
  Select,
  Input,
  Textarea,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react"
import { FiPlus, FiBell, FiEdit, FiTrash2, FiMoreVertical, FiEye } from "react-icons/fi"
import { useState } from "react"
import { useAdminStore } from "../../store/TBI/adminStore";

export function AnnouncementManagement() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    targetAudience: "",
    publishDate: "",
    expiryDate: "",
  })

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Use mock data from admin store
  const { announcements = [], addAnnouncement } = useAdminStore();
  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

  const filteredAnnouncements = safeAnnouncements.filter((announcement) => {
    if (!announcement || typeof announcement !== 'object') return false;
    const status = announcement.status || "";
    const category = announcement.category || "";
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    addAnnouncement({
      ...formData,
      status: "Draft",
    })

    toast({
      title: "Success",
      description: "Announcement created successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setFormData({
      title: "",
      content: "",
      category: "",
      targetAudience: "",
      publishDate: "",
      expiryDate: "",
    })
    onClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green"
      case "Draft":
        return "yellow"
      case "Expired":
        return "red"
      case "Scheduled":
        return "blue"
      default:
        return "gray"
    }
  }

  const activeCount = safeAnnouncements.filter((a) => a && a.status === "Active").length
  const draftCount = safeAnnouncements.filter((a) => a && a.status === "Draft").length
  const scheduledCount = safeAnnouncements.filter((a) => a && a.status === "Scheduled").length

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Announcement Management
            </Text>
            <Text color="gray.600">Create and manage campus announcements</Text>
          </Box>
          <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={onOpen}>
            Create Announcement
          </Button>
        </HStack>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Total Announcements</StatLabel>
                    <StatNumber color="#344E41">{safeAnnouncements.length}</StatNumber>
                    <StatHelpText>All time</StatHelpText>
                  </Box>
                  <Box color="#344E41" fontSize="2xl">
                    <FiBell />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Active</StatLabel>
                    <StatNumber color="#48BB78">{activeCount}</StatNumber>
                    <StatHelpText>Currently visible</StatHelpText>
                  </Box>
                  <Box color="#48BB78" fontSize="2xl">
                    <FiEye />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Drafts</StatLabel>
                    <StatNumber color="#ED8936">{draftCount}</StatNumber>
                    <StatHelpText>Pending review</StatHelpText>
                  </Box>
                  <Box color="#ED8936" fontSize="2xl">
                    <FiEdit />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Scheduled</StatLabel>
                    <StatNumber color="#4299E1">{scheduledCount}</StatNumber>
                    <StatHelpText>Future publish</StatHelpText>
                  </Box>
                  <Box color="#4299E1" fontSize="2xl">
                    <FiBell />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack spacing={4}>
              <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Expired">Expired</option>
              </Select>
              <Select w="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Facility">Facility</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Event">Event</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Announcements Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              All Announcements ({filteredAnnouncements.length})
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Target Audience</Th>
                  <Th>Status</Th>
                  <Th>Publish Date</Th>
                  <Th>Expiry Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAnnouncements.map((announcement) => (
                  <Tr key={announcement?.id || Math.random()}>
                    <Td>
                      <Text fontWeight="medium">{announcement?.title || "-"}</Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {announcement?.content || "-"}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">{announcement?.category || "-"}</Badge>
                    </Td>
                    <Td>{announcement?.targetAudience || "-"}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(announcement?.status)}>{announcement?.status || "-"}</Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{announcement?.publishDate || "-"}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{announcement?.expiryDate || "-"}</Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                          <MenuItem icon={<FiEye />}>Preview</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500">
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

        {/* Create Announcement Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Announcement</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter announcement title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Content</FormLabel>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter announcement content"
                    rows={4}
                  />
                </FormControl>

                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="Academic">Academic</option>
                      <option value="Facility">Facility</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Event">Event</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Target Audience</FormLabel>
                    <Select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    >
                      <option value="">Select Audience</option>
                      <option value="All Students">All Students</option>
                      <option value="Freshmen">Freshmen</option>
                      <option value="Sophomores">Sophomores</option>
                      <option value="Juniors">Juniors</option>
                      <option value="Seniors">Seniors</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>Publish Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Expiry Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={handleSubmit}>
                Create Announcement
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}
