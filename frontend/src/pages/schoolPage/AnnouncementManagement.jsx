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
  Flex,
  Center,
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
    <Box p={6} minH="100vh" flex={1} position="relative">
      {/* Coming Soon Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.7)"
        zIndex={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="lg"
      >
        <Center>
          <VStack spacing={6} textAlign="center" color="white">
            <Box fontSize="6xl" mb={4}>
              🚧
            </Box>
            <Text fontSize="3xl" fontWeight="bold">
              Coming Soon!
            </Text>
            <Text fontSize="lg" maxW="400px">
              The Announcement Management feature is currently under development.
              You'll be able to create and manage campus announcements soon.
            </Text>
            <Badge colorScheme="blue" fontSize="md" p={3}>
              Feature in Development
            </Badge>
          </VStack>
        </Center>
      </Box>
    </Box>
  )
}
