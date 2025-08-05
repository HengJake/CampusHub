import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  VStack,
  HStack,
  Flex,
  Heading,
  Text,
  IconButton,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CheckboxGroup,
  Checkbox,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Container,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  ViewIcon,
  EditIcon,
  DeleteIcon,
  AddIcon,
  CalendarIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { useFacilityStore } from '../../store/facility.js';
import { utcToTimeString, timeStringToUTC, utcToMalaysiaDate, malaysiaToUTC } from '../../../../utility/dateTimeConversion.js';

const FacilityManagement = () => {
  const {
    resources,
    loading,
    errors,
    fetchFacilities,
    createFacility,
    updateFacility,
    deleteFacility,
    formatTimeslotsForDisplay,
    formatTimeslotsForAPI
  } = useFacilityStore();

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'locker',
    location: '',
    capacity: 1
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    days: [],
    startTime: '',
    endTime: ''
  });
  const [currentAvailability, setCurrentAvailability] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState('');
  const toast = useToast();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const resourceTypes = [
    { value: 'locker', label: 'Locker' },
    { value: 'court', label: 'Court' },
    { value: 'study_room', label: 'Study Room' },
    { value: 'meeting_room', label: 'Meeting Room' },
    { value: 'seminar_room', label: 'Seminar Room' }
  ];

  // Load facilities on component mount
  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    const result = await fetchFacilities();
    if (!result.success) {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFacilitySubmit = async () => {
    if (!facilityForm.name || !facilityForm.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const facilityData = {
      ...facilityForm,
      timeslots: formatTimeslotsForAPI(currentAvailability)
    };

    let result;
    if (selectedFacility) {
      result = await updateFacility(selectedFacility._id, facilityData);
    } else {
      result = await createFacility(facilityData);
    }

    if (result.success) {
      toast({
        title: 'Success',
        description: selectedFacility ? 'Facility updated successfully' : 'Facility created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadFacilities();
      resetForms();
      onClose();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddAvailability = () => {
    if (!availabilityForm.days.length || !availabilityForm.startTime || !availabilityForm.endTime) {
      toast({
        title: 'Error',
        description: 'Please select days and times',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(availabilityForm.startTime) || !timeRegex.test(availabilityForm.endTime)) {
      toast({
        title: 'Error',
        description: 'Please enter valid time format (HH:MM)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate that end time is after start time
    const startTime = new Date(`2000-01-01T${availabilityForm.startTime}:00`);
    const endTime = new Date(`2000-01-01T${availabilityForm.endTime}:00`);
    if (endTime <= startTime) {
      toast({
        title: 'Error',
        description: 'End time must be after start time',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newSlots = availabilityForm.days.map(day => ({
      day,
      startTime: availabilityForm.startTime,
      endTime: availabilityForm.endTime
    }));

    setCurrentAvailability([...currentAvailability, ...newSlots]);
    setAvailabilityForm({ days: [], startTime: '', endTime: '' });
  };

  const handleDeleteAvailability = (index) => {
    setCurrentAvailability(currentAvailability.filter((_, i) => i !== index));
  };

  const handleDeleteFacility = async (id) => {
    const result = await deleteFacility(id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Facility deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadFacilities();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditFacility = (facility) => {
    setSelectedFacility(facility);
    setFacilityForm({
      name: facility.name,
      type: facility.type,
      description: facility.description || '',
      location: facility.location,
      capacity: facility.capacity || 1
    });
    const displayTimeslots = formatTimeslotsForDisplay(facility.timeslots);
    setCurrentAvailability(displayTimeslots);
    setModalType('edit');
    onOpen();
  };

  const handleViewFacility = (facility) => {
    setSelectedFacility(facility);
    setModalType('view');
    onOpen();
  };

  const resetForms = () => {
    setFacilityForm({ name: '', type: 'locker', description: '', location: '', capacity: 1 });
    setAvailabilityForm({ days: [], startTime: '', endTime: '' });
    setCurrentAvailability([]);
    setSelectedFacility(null);
  };

  const openCreateModal = () => {
    resetForms();
    setModalType('create');
    onOpen();
  };

  const getResourceTypeLabel = (type) => {
    const resourceType = resourceTypes.find(rt => rt.value === type);
    return resourceType ? resourceType.label : type;
  };

  const getAvailabilitySummary = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return 'No availability set';
    const displayTimeslots = formatTimeslotsForDisplay(timeslots);
    return `${displayTimeslots.length} time slot${displayTimeslots.length > 1 ? 's' : ''} configured`;
  };

  // Helper function to format time with timezone info
  const formatTimeWithTimezone = (timeString) => {
    if (!timeString) return '';
    return `${timeString} (MYT)`;
  };

  // Helper function to get current Malaysia time for default values
  const getCurrentMalaysiaTime = () => {
    const now = new Date();
    const malaysiaTime = utcToMalaysiaDate(now);
    return malaysiaTime.toTimeString().slice(0, 5); // HH:MM format
  };

  const filteredFacilities = activeTab === 0 ? resources :
    activeTab === 1 ? resources.filter(f => f.type === 'study_room' || f.type === 'meeting_room' || f.type === 'seminar_room') :
      resources.filter(f => f.type === 'court');

  if (loading.resources) {
    return (
      <Container maxW="8xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading facilities...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="8xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="xl" color="blue.600">
            Facility Management System
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={openCreateModal}
            size="lg"
          >
            Add New Facility
          </Button>
        </Flex>

        {/* Error Alert */}
        {errors.resources && (
          <Alert status="error">
            <AlertIcon />
            {errors.resources}
          </Alert>
        )}

        {/* Facility List Section */}
        <Box bg="white" borderRadius="lg" shadow="md" p={6}>
          <Heading size="lg" mb={6} color="gray.700">
            Facilities Overview
          </Heading>

          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>All Facilities ({resources.length})</Tab>
              <Tab>Academic ({resources.filter(f => f.type === 'study_room' || f.type === 'meeting_room' || f.type === 'seminar_room').length})</Tab>
              <Tab>Sport ({resources.filter(f => f.type === 'court').length})</Tab>
            </TabList>

            <TabPanels>
              {[0, 1, 2].map(tabIndex => (
                <TabPanel key={tabIndex} px={0}>
                  {filteredFacilities.length === 0 ? (
                    <Box textAlign="center" py={12}>
                      <InfoIcon color="gray.400" boxSize={12} mb={4} />
                      <Text color="gray.500" fontSize="lg">
                        No facilities found for this category
                      </Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6}>
                      {filteredFacilities.map((facility) => (
                        <Card key={facility._id} variant="outline" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
                          <CardHeader pb={3}>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={1}>
                                <Heading size="md" color="gray.700" noOfLines={1}>
                                  {facility.name}
                                </Heading>
                                <Badge
                                  colorScheme={facility.type === 'court' ? 'green' : 'purple'}
                                  variant="subtle"
                                  borderRadius="full"
                                  px={3}
                                >
                                  {getResourceTypeLabel(facility.type)}
                                </Badge>
                              </VStack>
                              <HStack spacing={1}>
                                <IconButton
                                  icon={<ViewIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewFacility(facility)}
                                  aria-label="View facility"
                                />
                                <IconButton
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="orange"
                                  onClick={() => handleEditFacility(facility)}
                                  aria-label="Edit facility"
                                />
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteFacility(facility._id)}
                                  aria-label="Delete facility"
                                />
                              </HStack>
                            </HStack>
                          </CardHeader>
                          <CardBody pt={0}>
                            <VStack align="start" spacing={3}>
                              <Text color="gray.600" fontSize="sm" noOfLines={2}>
                                {facility.description || 'No description available'}
                              </Text>
                              <Text color="gray.500" fontSize="sm">
                                📍 {facility.location}
                              </Text>
                              <Text color="gray.500" fontSize="sm">
                                👥 Capacity: {facility.capacity}
                              </Text>
                              <HStack>
                                <CalendarIcon color="gray.400" boxSize={4} />
                                <Text color="gray.500" fontSize="sm">
                                  {getAvailabilitySummary(facility.timeslots)}
                                </Text>
                              </HStack>
                              <Text color="gray.400" fontSize="xs">
                                ⏰ All times in Malaysia Time (UTC+8)
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>

        {/* Modal for Create/Edit/View */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {modalType === 'create' && 'Create New Facility'}
              {modalType === 'edit' && 'Edit Facility'}
              {modalType === 'view' && 'Facility Details'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {modalType === 'view' ? (
                <VStack align="start" spacing={4}>
                  <Box w="full">
                    <Text fontWeight="bold" color="gray.600">Name:</Text>
                    <Text fontSize="lg">{selectedFacility?.name}</Text>
                  </Box>
                  <Box w="full">
                    <Text fontWeight="bold" color="gray.600">Type:</Text>
                    <Badge colorScheme={selectedFacility?.type === 'court' ? 'green' : 'purple'}>
                      {getResourceTypeLabel(selectedFacility?.type)}
                    </Badge>
                  </Box>
                  <Box w="full">
                    <Text fontWeight="bold" color="gray.600">Description:</Text>
                    <Text>{selectedFacility?.description || 'No description available'}</Text>
                  </Box>
                  <Box w="full">
                    <Text fontWeight="bold" color="gray.600">Location:</Text>
                    <Text>{selectedFacility?.location}</Text>
                  </Box>
                  <Box w="full">
                    <Text fontWeight="bold" color="gray.600">Capacity:</Text>
                    <Text>{selectedFacility?.capacity}</Text>
                  </Box>
                  <Box w="full">
                    <Text fontWeight="bold" color="gray.600" mb={2}>Weekly Availability:</Text>
                    {selectedFacility?.timeslots?.length > 0 ? (
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Day</Th>
                            <Th>Start Time (MYT)</Th>
                            <Th>End Time (MYT)</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {formatTimeslotsForDisplay(selectedFacility.timeslots).map((slot, index) => (
                            <Tr key={index}>
                              <Td>{slot.day}</Td>
                              <Td>{formatTimeWithTimezone(slot.startTime)}</Td>
                              <Td>{formatTimeWithTimezone(slot.endTime)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text color="gray.500">No availability configured</Text>
                    )}
                  </Box>
                </VStack>
              ) : (
                <VStack spacing={6} align="stretch">
                  <Accordion defaultIndex={[0]} allowMultiple>
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                          Facility Information
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4}>
                          <FormControl isRequired>
                            <FormLabel>Facility Name</FormLabel>
                            <Input
                              value={facilityForm.name}
                              onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                              placeholder="Enter facility name"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Facility Type</FormLabel>
                            <Select
                              value={facilityForm.type}
                              onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })}
                            >
                              {resourceTypes.map(type => {

                                if (type.label !== 'Locker') {
                                  return (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  )
                                }

                              })}
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Location</FormLabel>
                            <Input
                              value={facilityForm.location}
                              onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })}
                              placeholder="Enter facility location"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Capacity</FormLabel>
                            <Input
                              type="number"
                              value={facilityForm.capacity}
                              onChange={(e) => setFacilityForm({ ...facilityForm, capacity: parseInt(e.target.value) || 1 })}
                              placeholder="Enter capacity"
                              min={1}
                            />
                          </FormControl>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                          Weekly Availability
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4}>
                          <FormControl>
                            <FormLabel>Days of Week</FormLabel>
                            <CheckboxGroup
                              value={availabilityForm.days}
                              onChange={(value) => setAvailabilityForm({ ...availabilityForm, days: value })}
                            >
                              <SimpleGrid columns={2} spacing={2}>
                                {daysOfWeek.map(day => (
                                  <Checkbox key={day} value={day}>{day}</Checkbox>
                                ))}
                              </SimpleGrid>
                            </CheckboxGroup>
                          </FormControl>

                          <HStack w="full">
                            <FormControl>
                              <FormLabel>Start Time (MYT)</FormLabel>
                              <Input
                                type="time"
                                value={availabilityForm.startTime}
                                onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                                placeholder="HH:MM"
                              />
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                Malaysia Time (UTC+8)
                              </Text>
                            </FormControl>

                            <FormControl>
                              <FormLabel>End Time (MYT)</FormLabel>
                              <Input
                                type="time"
                                value={availabilityForm.endTime}
                                onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                                placeholder="HH:MM"
                              />
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                Malaysia Time (UTC+8)
                              </Text>
                            </FormControl>
                          </HStack>

                          <Button
                            leftIcon={<AddIcon />}
                            onClick={handleAddAvailability}
                            colorScheme="green"
                            size="sm"
                            w="full"
                          >
                            Add Time Slot
                          </Button>

                          {currentAvailability.length > 0 && (
                            <Box w="full">
                              <Text fontWeight="bold" mb={2}>Current Availability:</Text>
                              <Table size="sm" variant="simple">
                                <Thead>
                                  <Tr>
                                    <Th>Day</Th>
                                    <Th>Start (MYT)</Th>
                                    <Th>End (MYT)</Th>
                                    <Th>Action</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {currentAvailability.map((slot, index) => (
                                    <Tr key={index}>
                                      <Td>{slot.day}</Td>
                                      <Td>{formatTimeWithTimezone(slot.startTime)}</Td>
                                      <Td>{formatTimeWithTimezone(slot.endTime)}</Td>
                                      <Td>
                                        <IconButton
                                          icon={<DeleteIcon />}
                                          size="xs"
                                          colorScheme="red"
                                          variant="ghost"
                                          onClick={() => handleDeleteAvailability(index)}
                                          aria-label="Delete time slot"
                                        />
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          )}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              )}
            </ModalBody>

            {modalType !== 'view' && (
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleFacilitySubmit}>
                  {modalType === 'edit' ? 'Update Facility' : 'Create Facility'}
                </Button>
              </ModalFooter>
            )}
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default FacilityManagement;