// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: Locker.jsx
// Description: Student locker booking page providing interface for viewing available lockers, making reservations, and managing existing bookings
// First Written on: July 20, 2024
// Edited on: Friday, August 8, 2024

"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Button,
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
  Input,
  Textarea,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Switch,
  InputGroup,
  InputLeftElement,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react"
import {
  FiLock,
  FiUnlock,
  FiMapPin,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiAlertCircle,
  FiSettings,
} from "react-icons/fi"

const Locker = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sizeFilter, setSizeFilter] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedLocker, setSelectedLocker] = useState(null)
  const [bookingType, setBookingType] = useState("temporary")
  const [duration, setDuration] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const toast = useToast()

  // Sample real data from your MongoDB (for demonstration)
  const sampleRealData = [
    {
      _id: "68a1f602a56d9e2a32e3b1d9",
      name: "Library Locker 1",
      resourceId: "68a1f602a56d9e2a32e3b1ae",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:18.886+00:00",
      updatedAt: "2025-08-17T15:32:18.886+00:00"
    },
    {
      _id: "68a1f602a56d9e2a32e3b1df",
      name: "Library Locker 2",
      resourceId: "68a1f602a56d9e2a32e3b1b3",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:18.926+00:00",
      updatedAt: "2025-08-17T15:32:18.926+00:00"
    },
    {
      _id: "68a1f602a56d9e2a32e3b1e5",
      name: "Library Locker 3",
      resourceId: "68a1f602a56d9e2a32e3b1b8",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Maintenance",
      isAvailable: false,
      createdAt: "2025-08-17T15:32:18.968+00:00",
      updatedAt: "2025-08-17T15:32:18.968+00:00"
    },
    {
      _id: "68a1f603a56d9e2a32e3b1eb",
      name: "Computer Lab Locker 1",
      resourceId: "68a1f602a56d9e2a32e3b1bd",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:19.017+00:00",
      updatedAt: "2025-08-17T15:32:19.017+00:00"
    },
    {
      _id: "68a1f603a56d9e2a32e3b1f1",
      name: "Computer Lab Locker 2",
      resourceId: "68a1f602a56d9e2a32e3b1c2",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:19.060+00:00",
      updatedAt: "2025-08-17T15:32:19.060+00:00"
    },
    {
      _id: "68a1f603a56d9e2a32e3b1f7",
      name: "Computer Lab Locker 3",
      resourceId: "68a1f602a56d9e2a32e3b1c7",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:19.101+00:00",
      updatedAt: "2025-08-17T15:32:19.101+00:00"
    },
    {
      _id: "68a1f603a56d9e2a32e3b1fd",
      name: "Sports Complex Locker 1",
      resourceId: "68a1f602a56d9e2a32e3b1cc",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:19.144+00:00",
      updatedAt: "2025-08-17T15:32:19.144+00:00"
    },
    {
      _id: "68a1f603a56d9e2a32e3b203",
      name: "Sports Complex Locker 2",
      resourceId: "68a1f602a56d9e2a32e3b1d1",
      schoolId: "68a1c4eb898fac74ed4df1e6",
      status: "Available",
      isAvailable: true,
      createdAt: "2025-08-17T15:32:19.186+00:00",
      updatedAt: "2025-08-17T15:32:19.186+00:00"
    }
  ]

  // API function to fetch real locker data
  const fetchRealLockerData = async () => {
    try {
      setLoading(true)

      // For now, return sample data. Replace this with actual API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // TODO: Replace with actual API endpoint
      /*
      const response = await fetch('/api/lockers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch locker data')
      }
      
      const data = await response.json()
      return data
      */

      return sampleRealData
    } catch (error) {
      console.error('Error fetching locker data:', error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load real locker data. Using mock data instead.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Function to transform real data to match our interface format
  const transformRealData = (realData) => {
    return realData.map(locker => ({
      _id: locker._id,
      name: locker.name || `Locker ${locker._id.slice(-4)}`,
      resourceId: {
        _id: locker.resourceId,
        name: locker.name || `Resource ${locker.resourceId}`,
        location: getLocationFromName(locker.name),
        type: "locker",
        capacity: 1,
        status: locker.isAvailable,
        timeslots: getDefaultTimeslots()
      },
      schoolId: locker.schoolId,
      status: locker.status || (locker.isAvailable ? "Available" : "Occupied"),
      isAvailable: locker.isAvailable,
      createdAt: locker.createdAt,
      updatedAt: locker.updatedAt
    }))
  }

  // Helper function to extract location from locker name
  const getLocationFromName = (name) => {
    if (!name) return "Unknown Location"

    if (name.includes("Library")) return "Library - Ground Floor"
    if (name.includes("Computer Lab")) return "Computer Lab - 2nd Floor"
    if (name.includes("Sports Complex")) return "Sports Complex - Ground Floor"
    if (name.includes("Gym")) return "Main Gym - Ground Floor"

    return "Campus Facility"
  }

  // Helper function to provide default timeslots
  const getDefaultTimeslots = () => [
    {
      dayOfWeek: "Monday",
      slots: [{ start: "08:00", end: "20:00" }]
    },
    {
      dayOfWeek: "Tuesday",
      slots: [{ start: "08:00", end: "20:00" }]
    },
    {
      dayOfWeek: "Wednesday",
      slots: [{ start: "08:00", end: "20:00" }]
    },
    {
      dayOfWeek: "Thursday",
      slots: [{ start: "08:00", end: "20:00" }]
    },
    {
      dayOfWeek: "Friday",
      slots: [{ start: "08:00", end: "20:00" }]
    },
    {
      dayOfWeek: "Saturday",
      slots: [{ start: "09:00", end: "17:00" }]
    },
    {
      dayOfWeek: "Sunday",
      slots: [{ start: "10:00", end: "16:00" }]
    }
  ]

  // Combined real and mock data for locker units
  const [lockers, setLockers] = useState([
    {
      _id: "674a1b2c3d4e5f6789012345",
      name: "L001",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012301",
        name: "Cardio Section Locker L001",
        location: "Main Gym - Ground Floor, Cardio Section",
        type: "locker",
        capacity: 1,
        status: true,
        timeslots: [
          {
            dayOfWeek: "Monday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Tuesday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Wednesday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Thursday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Friday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Saturday",
            slots: [{ start: "08:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Sunday",
            slots: [{ start: "08:00", end: "22:00" }]
          }
        ]
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      status: "Available",
      isAvailable: true,
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-01-20T08:00:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012346",
      name: "L002",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012302",
        name: "Weight Training Locker L002",
        location: "Main Gym - Ground Floor, Weight Training Area",
        type: "locker",
        capacity: 1,
        status: true,
        timeslots: [
          {
            dayOfWeek: "Monday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Tuesday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Wednesday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Thursday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Friday",
            slots: [{ start: "06:00", end: "23:00" }]
          },
          {
            dayOfWeek: "Saturday",
            slots: [{ start: "08:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Sunday",
            slots: [{ start: "08:00", end: "22:00" }]
          }
        ]
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      status: "Occupied",
      isAvailable: false,
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-01-20T08:00:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012347",
      name: "L003",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012303",
        name: "Pool Area Locker L003",
        location: "Sports Complex - 1st Floor, Swimming Pool Area",
        type: "locker",
        capacity: 1,
        status: true,
        timeslots: [
          {
            dayOfWeek: "Monday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Tuesday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Wednesday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Thursday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Friday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Saturday",
            slots: [{ start: "08:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Sunday",
            slots: [{ start: "08:00", end: "21:00" }]
          }
        ]
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      status: "Available",
      isAvailable: true,
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-01-20T09:00:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012348",
      name: "L004",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012304",
        name: "Basketball Court Locker L004",
        location: "Sports Complex - 1st Floor, Basketball Court",
        type: "locker",
        capacity: 1,
        status: false,
        timeslots: []
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      status: "Maintenance",
      isAvailable: false,
      maintenanceNote: "Lock repair in progress - ETA: 2 hours",
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-01-19T16:00:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012349",
      name: "L005",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012305",
        name: "Group Fitness Locker L005",
        location: "Main Gym - 1st Floor, Group Fitness Studio",
        type: "locker",
        capacity: 1,
        status: true,
        timeslots: [
          {
            dayOfWeek: "Monday",
            slots: [{ start: "07:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Tuesday",
            slots: [{ start: "07:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Wednesday",
            slots: [{ start: "07:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Thursday",
            slots: [{ start: "07:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Friday",
            slots: [{ start: "07:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Saturday",
            slots: [{ start: "09:00", end: "18:00" }]
          }
        ]
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      status: "Available",
      isAvailable: true,
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-01-20T07:30:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012350",
      name: "L006",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012306",
        name: "Tennis Court Locker L006",
        location: "Sports Complex - Ground Floor, Tennis Courts",
        type: "locker",
        capacity: 1,
        status: true,
        timeslots: [
          {
            dayOfWeek: "Monday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Tuesday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Wednesday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Thursday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Friday",
            slots: [{ start: "06:00", end: "22:00" }]
          },
          {
            dayOfWeek: "Saturday",
            slots: [{ start: "07:00", end: "21:00" }]
          },
          {
            dayOfWeek: "Sunday",
            slots: [{ start: "07:00", end: "21:00" }]
          }
        ]
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      status: "Available",
      isAvailable: true,
      createdAt: "2024-01-15T08:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z"
    }
  ])

  // Mock data for user's bookings (aligned with backend schema)
  const [myBookings, setMyBookings] = useState([
    {
      _id: "674a1b2c3d4e5f6789012401",
      studentId: "674a1b2c3d4e5f6789012201", // Current student ID
      resourceId: {
        _id: "674a1b2c3d4e5f6789012301",
        name: "Cardio Section Locker L001",
        location: "Main Gym - Ground Floor, Cardio Section",
        type: "locker"
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      bookingDate: "2024-01-15",
      startTime: "09:00",
      endTime: "17:00",
      status: "confirmed",
      createdAt: "2024-01-15T09:30:00.000Z",
      updatedAt: "2024-01-15T09:30:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012402",
      studentId: "674a1b2c3d4e5f6789012201",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012303",
        name: "Pool Area Locker L003",
        location: "Sports Complex - 1st Floor, Swimming Pool Area",
        type: "locker"
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      bookingDate: "2024-01-10",
      startTime: "14:00",
      endTime: "18:00",
      status: "completed",
      createdAt: "2024-01-10T14:15:00.000Z",
      updatedAt: "2024-01-10T18:00:00.000Z"
    },
    {
      _id: "674a1b2c3d4e5f6789012403",
      studentId: "674a1b2c3d4e5f6789012201",
      resourceId: {
        _id: "674a1b2c3d4e5f6789012305",
        name: "Group Fitness Locker L005",
        location: "Main Gym - 1st Floor, Group Fitness Studio",
        type: "locker"
      },
      schoolId: "674a1b2c3d4e5f6789012300",
      bookingDate: "2024-01-25",
      startTime: "10:00",
      endTime: "16:00",
      status: "pending",
      createdAt: "2024-01-20T16:45:00.000Z",
      updatedAt: "2024-01-20T16:45:00.000Z"
    }
  ])

  // Load real data on component mount
  useEffect(() => {
    const loadLockerData = async () => {
      const realData = await fetchRealLockerData()
      if (realData && realData.length > 0) {
        const transformedData = transformRealData(realData)
        setLockers(transformedData)
        setLastUpdated(new Date())
      }
      // If real data fails, keep existing mock data as fallback
    }

    loadLockerData()
  }, [])

  // Auto-refresh real data
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      // Refresh real data
      const realData = await fetchRealLockerData()
      if (realData && realData.length > 0) {
        const transformedData = transformRealData(realData)
        setLockers(transformedData)
      }
      setLastUpdated(new Date())
    }, 8000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "green"
      case "Occupied":
        return "red"
      case "Maintenance":
        return "orange"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Available":
        return FiUnlock
      case "Occupied":
        return FiLock
      case "Maintenance":
        return FiAlertCircle
      default:
        return FiLock
    }
  }



  const filteredLockers = lockers.filter((locker) => {
    const matchesSearch =
      locker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locker.resourceId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locker.resourceId.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = !locationFilter || locker.resourceId.location.includes(locationFilter)
    const matchesStatus = !statusFilter || locker.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesLocation && matchesStatus
  })

  const availableCount = lockers.filter((l) => l.status === "Available").length
  const occupiedCount = lockers.filter((l) => l.status === "Occupied").length
  const maintenanceCount = lockers.filter((l) => l.status === "Maintenance").length


  const handleBookLocker = (locker) => {
    setSelectedLocker(locker)
    onBookingOpen()
  }

  const handleViewDetails = (locker) => {
    setSelectedLocker(locker)
    onDetailsOpen()
  }

  const handleSubmitBooking = () => {
    if (!startDate || !duration || !endDate || !contactInfo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including date, start time, end time, and contact info",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const newBooking = {
      _id: `674a1b2c3d4e5f67890124${Date.now().toString().slice(-2)}`,
      studentId: "674a1b2c3d4e5f6789012201", // Current student ID (would come from auth context)
      resourceId: {
        _id: selectedLocker.resourceId._id,
        name: selectedLocker.resourceId.name,
        location: selectedLocker.resourceId.location,
        type: selectedLocker.resourceId.type
      },
      schoolId: selectedLocker.schoolId,
      bookingDate: startDate,
      startTime: "09:00", // Default start time, could be made configurable
      endTime: "17:00", // Default end time, could be made configurable
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setMyBookings((prev) => [newBooking, ...prev])

    toast({
      title: "Booking Submitted",
      description: `Your locker booking for ${selectedLocker.resourceId.name} has been submitted successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setBookingType("temporary")
    setDuration("")
    setStartDate("")
    setEndDate("")
    setContactInfo("")
    setNotes("")
    onBookingClose()
  }

  const handleCancelBooking = (bookingId) => {
    setMyBookings((prev) =>
      prev.map((booking) => (booking._id === bookingId ? { ...booking, status: "cancelled" } : booking)),
    )

    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleRefresh = async () => {
    const realData = await fetchRealLockerData()
    if (realData && realData.length > 0) {
      const transformedData = transformRealData(realData)
      setLockers(transformedData)
      toast({
        title: "Data Refreshed",
        description: "Locker availability has been updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    }
    setLastUpdated(new Date())
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Gym Locker Booking System
            </Text>
            <Text color="gray.600">Reserve temporary or extended gym locker rentals across campus facilities</Text>
          </Box>
          <HStack spacing={3}>
            <HStack>
              <Switch isChecked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} colorScheme="blue" />
              <Text fontSize="sm">Auto-refresh</Text>
            </HStack>
            <Button leftIcon={<FiRefreshCw />} onClick={handleRefresh} size="sm" isLoading={loading}>
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Stats Dashboard */}
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiUnlock} color="green.500" boxSize={8} />
                  <Box>
                    <StatNumber color="green.500" fontSize="2xl">
                      {availableCount}
                    </StatNumber>
                    <StatLabel>Available Lockers</StatLabel>
                    <StatHelpText>Ready to book</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiLock} color="red.500" boxSize={8} />
                  <Box>
                    <StatNumber color="red.500" fontSize="2xl">
                      {occupiedCount}
                    </StatNumber>
                    <StatLabel>Occupied</StatLabel>
                    <StatHelpText>Currently in use</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiAlertCircle} color="orange.500" boxSize={8} />
                  <Box>
                    <StatNumber color="orange.500" fontSize="2xl">
                      {maintenanceCount}
                    </StatNumber>
                    <StatLabel>Maintenance</StatLabel>
                    <StatHelpText>Under repair</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>


        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Available Lockers ({filteredLockers.length})</Tab>
            <Tab>My Bookings ({myBookings.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Available Lockers Tab */}
            <TabPanel>
              {/* Advanced Filters */}
              <Card mb={6}>
                <CardBody>
                  <Text fontWeight="bold" mb={4}>
                    Search & Filter Options
                  </Text>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search lockers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>

                    <Select
                      placeholder="All Locations"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="Main Gym">Main Gym</option>
                      <option value="Sports Complex">Sports Complex</option>
                    </Select>

                    <Select
                      placeholder="All Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </Select>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">
                        Last Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        {filteredLockers.length} lockers found
                      </Text>

                    </VStack>
                  </Grid>
                </CardBody>
              </Card>

              {/* Lockers Grid */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {filteredLockers.map((locker) => (
                  <Card
                    key={locker.id}
                    _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                    transition="all 0.3s"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        {/* Header */}
                        <HStack justify="space-between">
                          <HStack>
                            <Icon
                              as={getStatusIcon(locker.status)}
                              color={`${getStatusColor(locker.status)}.500`}
                              boxSize={6}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">
                                {locker.name}
                              </Text>
                              <Badge colorScheme="blue" variant="subtle">
                                {locker.resourceId.type.toUpperCase()}
                              </Badge>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getStatusColor(locker.status)} variant="solid">
                            {locker.status.toUpperCase()}
                          </Badge>
                        </HStack>



                        {/* Location Info */}
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FiMapPin} color="gray.500" size="sm" />
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                              {locker.resourceId.location}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Resource: {locker.resourceId.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Capacity: {locker.resourceId.capacity} person
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Available: {locker.isAvailable ? "Yes" : "No"}
                          </Text>
                        </VStack>

                        <Divider />

                        {/* Available Time Slots */}
                        {locker.resourceId.timeslots && locker.resourceId.timeslots.length > 0 && (
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.700">
                              Available Hours:
                            </Text>
                            <VStack align="start" spacing={1}>
                              {locker.resourceId.timeslots.slice(0, 3).map((slot, index) => (
                                <HStack key={index} spacing={2}>
                                  <Text fontSize="xs" color="gray.600" minW="60px">
                                    {slot.dayOfWeek.slice(0, 3)}:
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {slot.slots.map(s => `${s.start}-${s.end}`).join(", ")}
                                  </Text>
                                </HStack>
                              ))}
                              {locker.resourceId.timeslots.length > 3 && (
                                <Text fontSize="xs" color="blue.500">
                                  +{locker.resourceId.timeslots.length - 3} more days
                                </Text>
                              )}
                            </VStack>
                          </VStack>
                        )}

                        {/* Status-specific Information */}
                        {locker.status === "Occupied" && (
                          <Alert status="error" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Currently Occupied</AlertTitle>
                              <AlertDescription fontSize="xs">This locker is currently in use</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {locker.status === "Maintenance" && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Under Maintenance</AlertTitle>
                              <AlertDescription fontSize="xs">
                                {locker.maintenanceNote || "Temporarily unavailable for maintenance"}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {!locker.resourceId.status && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Resource Inactive</AlertTitle>
                              <AlertDescription fontSize="xs">This resource is currently inactive</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(locker)}
                            leftIcon={<FiSettings />}
                            flex={1}
                          >
                            Details
                          </Button>
                          {locker.status === "Available" && locker.isAvailable && locker.resourceId.status ? (
                            <Button
                              colorScheme="blue"
                              onClick={() => handleBookLocker(locker)}
                              leftIcon={<FiCalendar />}
                              size="sm"
                              flex={2}
                            >
                              Book Now
                            </Button>
                          ) : (
                            <Button isDisabled size="sm" flex={2}>
                              Unavailable
                            </Button>
                          )}
                        </HStack>

                        {/* Last Updated */}
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Last updated:
                          </Text>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            {new Date(locker.updatedAt).toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>

              {filteredLockers.length === 0 && (
                <Card>
                  <CardBody textAlign="center" py={10}>
                    <Icon as={FiSearch} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600" mb={2}>
                      No lockers found
                    </Text>
                    <Text color="gray.500">Try adjusting your search criteria</Text>
                  </CardBody>
                </Card>
              )}
            </TabPanel>

            {/* My Bookings Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {myBookings.length === 0 ? (
                  <Card>
                    <CardBody textAlign="center" py={10}>
                      <Icon as={FiCalendar} boxSize={12} color="gray.400" mb={4} />
                      <Text fontSize="lg" color="gray.600" mb={2}>
                        No bookings yet
                      </Text>
                      <Text color="gray.500">Book your first locker to get started</Text>
                    </CardBody>
                  </Card>
                ) : (
                  <>
                    {/* Bookings Summary */}
                    <Card>
                      <CardBody>
                        <Text fontWeight="bold" mb={4}>
                          Booking Summary
                        </Text>
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                          <Stat>
                            <StatLabel>Confirmed Bookings</StatLabel>
                            <StatNumber color="green.500">
                              {myBookings.filter((b) => b.status === "confirmed").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Pending Bookings</StatLabel>
                            <StatNumber color="yellow.500">
                              {myBookings.filter((b) => b.status === "pending").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Completed</StatLabel>
                            <StatNumber color="blue.500">
                              {myBookings.filter((b) => b.status === "completed").length}
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Bookings List */}
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Resource</Th>
                            <Th>Location</Th>
                            <Th>Date</Th>
                            <Th>Time</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myBookings.map((booking) => (
                            <Tr key={booking._id}>
                              <Td fontWeight="medium">{booking.resourceId.name}</Td>
                              <Td>{booking.resourceId.location}</Td>
                              <Td>
                                <Text fontSize="sm">
                                  {new Date(booking.bookingDate).toLocaleDateString()}
                                </Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">
                                  {booking.startTime} - {booking.endTime}
                                </Text>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    booking.status === "confirmed"
                                      ? "green"
                                      : booking.status === "pending"
                                        ? "yellow"
                                        : booking.status === "cancelled"
                                          ? "red"
                                          : booking.status === "completed"
                                            ? "blue"
                                            : "gray"
                                  }
                                >
                                  {booking.status.toUpperCase()}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  {(booking.status === "confirmed" || booking.status === "pending") && (
                                    <Button
                                      size="sm"
                                      colorScheme="red"
                                      variant="outline"
                                      onClick={() => handleCancelBooking(booking._id)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Booking Modal */}
      <Modal isOpen={isBookingOpen} onClose={onBookingClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book Locker: {selectedLocker?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Locker Information</AlertTitle>
                  <AlertDescription>
                    {selectedLocker?.resourceId.name} - {selectedLocker?.resourceId.location}
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <FormLabel>Booking Date</FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Start Time</FormLabel>
                  <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                    <option value="">Select start time</option>
                    {selectedLocker?.resourceId.timeslots?.map((daySlot) =>
                      daySlot.slots.map((slot, index) => (
                        <option key={`${daySlot.dayOfWeek}-${index}`} value={slot.start}>
                          {slot.start} ({daySlot.dayOfWeek})
                        </option>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>End Time</FormLabel>
                  <Select value={endDate} onChange={(e) => setEndDate(e.target.value)}>
                    <option value="">Select end time</option>
                    {selectedLocker?.resourceId.timeslots?.map((daySlot) =>
                      daySlot.slots.map((slot, index) => (
                        <option key={`${daySlot.dayOfWeek}-${index}`} value={slot.end}>
                          {slot.end} ({daySlot.dayOfWeek})
                        </option>
                      ))
                    )}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Contact Information</FormLabel>
                <Input
                  placeholder="Phone number or email"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </FormControl>


            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBookingClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmitBooking}>
              Submit Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Locker Details: {selectedLocker?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={2} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Resource Information</Text>
                  <Text fontSize="sm">Name: {selectedLocker?.resourceId.name}</Text>
                  <Text fontSize="sm">Location: {selectedLocker?.resourceId.location}</Text>
                  <Text fontSize="sm">Type: {selectedLocker?.resourceId.type}</Text>
                  <Text fontSize="sm">Capacity: {selectedLocker?.resourceId.capacity} person</Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Locker Details</Text>
                  <Text fontSize="sm">Unit Name: {selectedLocker?.name}</Text>
                  <Text fontSize="sm">Status: {selectedLocker?.status}</Text>
                  <Text fontSize="sm">Available: {selectedLocker?.isAvailable ? "Yes" : "No"}</Text>
                  <Text fontSize="sm">Last Updated: {new Date(selectedLocker?.updatedAt).toLocaleDateString()}</Text>
                </VStack>
              </SimpleGrid>

              {selectedLocker?.resourceId.timeslots && selectedLocker.resourceId.timeslots.length > 0 && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Available Time Slots</Text>
                  <SimpleGrid columns={2} spacing={2} w="full">
                    {selectedLocker.resourceId.timeslots.map((daySlot, index) => (
                      <VStack key={index} align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">{daySlot.dayOfWeek}</Text>
                        {daySlot.slots.map((slot, slotIndex) => (
                          <Text key={slotIndex} fontSize="sm" color="gray.600">
                            {slot.start} - {slot.end}
                          </Text>
                        ))}
                      </VStack>
                    ))}
                  </SimpleGrid>
                </VStack>
              )}


            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            {selectedLocker?.status === "Available" && selectedLocker?.isAvailable && selectedLocker?.resourceId.status && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  onDetailsClose()
                  handleBookLocker(selectedLocker)
                }}
              >
                Book This Locker
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Locker
