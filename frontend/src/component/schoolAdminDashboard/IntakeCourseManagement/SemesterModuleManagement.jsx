import {
  Box,
  Text,
  VStack,
  HStack,
  Grid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  Icon,
  Card,
  CardBody,
  Badge,
  useToast,
  useColorModeValue,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAcademicStore } from "../../../store/academic";
import { FiRefreshCw, FiCalendar, FiBookOpen, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import MultiSelectPopover from "../../common/MultiSelectPopover";

export function SemesterModuleManagement() {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState(new Set());

  // Error boundary effect
  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('SemesterModuleManagement Error:', error, errorInfo);
      setHasError(true);
      setErrorInfo(errorInfo);
    };

    // Add global error handler
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const {
    semesters,
    fetchSemestersBySchoolId,
    modules,
    fetchModulesBySchoolId,
    intakeCourses,
    fetchIntakeCoursesBySchoolId,
    semesterModules,
    fetchSemesterModulesBySchoolId,
    fetchModulesBySemester,
    getModuleCountBySemester,
    getAvailableModulesForSemester,
    addModuleToSemester,
    removeModuleFromSemester,
    updateSemesterModule,
    bulkAddModulesToSemester
  } = useAcademicStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSemesterModule, setSelectedSemesterModule] = useState(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isModuleEditMode, setIsModuleEditMode] = useState(false);

  // Toggle course expansion
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // Check if a course is expanded
  const isCourseExpanded = (courseId) => expandedCourses.has(courseId);

  const getModulesForSemester = (semesterId) => {
    try {
      if (!semesterId) return [];
      return semesterModules.filter(sm => {
        // Add null checks for semesterId and moduleId
        if (!sm || !sm.semesterId) return false;
        return sm.semesterId._id === semesterId || sm.semesterId === semesterId;
      });
    } catch (error) {
      console.error('Error in getModulesForSemester:', error);
      return [];
    }
  };

  // Helper function to get available modules for a specific course
  const getAvailableModulesForCourse = async (courseId) => {
    try {
      if (!courseId) return [];
      return modules.filter(module => {
        if (!module || !module.courseId) return false;
        if (Array.isArray(module.courseId)) {

          return module.courseId.some(course => course === courseId || (course && course._id === courseId));
        } else {
          // Fallback for single courseId (if model was changed)
          return module.courseId === courseId || (module.courseId && module.courseId._id === courseId);
        }
      });
    } catch (error) {
      console.error('Error in getAvailableModulesForCourse:', error);
      return [];
    }
  };

  // Helper function to get available modules for a semester (excluding already assigned ones)
  const getUnassignedModulesForSemester = async (semesterId, courseId, includeAssigned = false) => {
    console.log("🚀 ~ getUnassignedModulesForSemester ~ courseId:", courseId)
    console.log("🚀 ~ getUnassignedModulesForSemester ~ semesterId:", semesterId)
    try {
      if (!semesterId || !courseId) return [];
      const courseModules = await getAvailableModulesForCourse(courseId);
      console.log("🚀 ~ getUnassignedModulesForSemester ~ courseModules:", courseModules)
      const assignedModuleIds = getModulesForSemester(semesterId).map(sm => {
        if (!sm || !sm.moduleId) return null;
        return sm.moduleId._id || sm.moduleId;
      }).filter(Boolean); // Remove null values

      if (includeAssigned) {
        // Return all course modules (both assigned and unassigned)
        return courseModules;
      } else {
        // Return only unassigned modules
        return courseModules.filter(module => !assignedModuleIds.includes(module._id));
      }
    } catch (error) {
      console.error('Error in getUnassignedModulesForSemester:', error);
      return [];
    }
  };

  // Fetch available modules when selected semester changes
  useEffect(() => {
    const fetchAvailableModules = async () => {
      if (!selectedSemester) {
        setAvailableModules([]);
        return;
      }

      setIsLoadingModules(true);
      try {
        const semesterCourseId = selectedSemester.intakeCourseId.courseId && (selectedSemester.intakeCourseId.courseId._id || selectedSemester.intakeCourseId.courseId);
        if (!semesterCourseId) {
          setAvailableModules([]);
          return;
        }
        // Include assigned modules when editing to show current selections
        const includeAssigned = isModuleEditMode;
        const modules = await getUnassignedModulesForSemester(selectedSemester._id, semesterCourseId, includeAssigned);
        setAvailableModules(modules || []);
      } catch (error) {
        console.error('Error fetching available modules:', error);
        setAvailableModules([]);
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchAvailableModules();
  }, [selectedSemester, isModuleEditMode]);


  const [moduleAssignmentForm, setModuleAssignmentForm] = useState({
    moduleIds: []
  });
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'grid' or 'timeline'
  const [selectedCourseForTimeline, setSelectedCourseForTimeline] = useState(null);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchSemestersBySchoolId(),
          fetchModulesBySchoolId(),
          fetchIntakeCoursesBySchoolId(),
          fetchSemesterModulesBySchoolId()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try refreshing the page.');
      }
    };

    fetchData();
  }, []);

  // Auto-select first course with semesters when timeline view is active
  useEffect(() => {
    if (viewMode === 'timeline' && intakeCourses.length > 0 && !selectedCourseForTimeline) {
      const firstCourseWithSemesters = intakeCourses.find(ic => {
        const courseSemesters = getTimelineSemestersForCourse(ic.courseId._id);
        return courseSemesters.length > 0;
      });

      if (firstCourseWithSemesters) {
        setSelectedCourseForTimeline(firstCourseWithSemesters._id);
      }
    }
  }, [viewMode, intakeCourses, selectedCourseForTimeline]);





  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSemestersBySchoolId(),
        fetchModulesBySchoolId(),
        fetchIntakeCoursesBySchoolId(),
        fetchSemesterModulesBySchoolId()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'blue';
      case 'active': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Helper function to get semesters for a specific course sorted by start date
  const getTimelineSemestersForCourse = (courseId) => {
    try {
      if (!courseId) return [];
      return semesters
        .filter(semester => {
          if (!semester || !semester.startDate) return false;
          if (!semester.intakeCourseId.courseId._id) return false;
          return semester.intakeCourseId.courseId._id === courseId;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } catch (error) {
      console.error('Error in getTimelineSemestersForCourse:', error);
      return [];
    }
  };

  // Helper function to format date for timeline
  const formatTimelineDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'N/A';
    }
  };

  const getIntakeCourseId = (courseId) => {
    try {
      if (!courseId) return null;
      const intakeCourse = intakeCourses.find(ic => {
        if (!ic || !ic.courseId) return false;
        return ic.courseId._id === courseId;
      });
      return intakeCourse ? intakeCourse._id : null;
    } catch (error) {
      console.error('Error in getIntakeCourseId:', error);
      return null;
    }
  };

  const handleOpenModuleModal = (semester = null, semesterModule = null) => {

    if (semesterModule) {
      setSelectedSemester(semester);
      setSelectedSemesterModule(semesterModule);
      setIsModuleEditMode(true);

      // Handle both single object and array cases
      let moduleIds = [];
      if (Array.isArray(semesterModule)) {
        // Extract module IDs from array of semester modules
        moduleIds = semesterModule.map(sm => {
          if (!sm || !sm.moduleId) return null;
          return sm.moduleId._id || sm.moduleId;
        }).filter(Boolean); // Remove null values
      } else {
        // Single semester module object
        if (semesterModule && semesterModule.moduleId) {
          moduleIds = [semesterModule.moduleId._id || semesterModule.moduleId];
        }
      }
      setModuleAssignmentForm({
        moduleIds: moduleIds
      });
    } else if (semester) {
      setSelectedSemester(semester);
      setIsModuleEditMode(false);
      setModuleAssignmentForm({
        moduleIds: []
      });
    }

    setIsModuleModalOpen(true);
  };

  const handleCloseModuleModal = () => {
    setIsModuleModalOpen(false);
    setSelectedSemesterModule(null);
    setIsModuleEditMode(false);
    setModuleAssignmentForm({
      moduleIds: []
    });
  };

  const handleModuleIdsChange = (moduleIds) => {
    setModuleAssignmentForm(prev => ({
      ...prev,
      moduleIds
    }));
  };

  const handleModuleAssignmentSubmit = async () => {
    if (!selectedSemester) {
      toast({
        title: "Validation Error",
        description: "No semester selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!moduleAssignmentForm.moduleIds || moduleAssignmentForm.moduleIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one module",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const semester = selectedSemester;
      const semesterCourseId = semester.intakeCourseId.courseId && (semester.intakeCourseId.courseId._id || semester.intakeCourseId.courseId);
      if (!semesterCourseId) {
        toast({
          title: "Error",
          description: "Invalid semester course information",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const intakeCourseId = getIntakeCourseId(semesterCourseId);

      if (!intakeCourseId) {
        toast({
          title: "Error",
          description: "Intake course not found for this semester",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (isModuleEditMode) {
        // UPDATE MODE: Handle existing semester module assignments
        const currentSemesterModules = getModulesForSemester(semester._id);
        const currentModuleIds = currentSemesterModules.map(sm => {
          if (!sm || !sm.moduleId) return null;
          return sm.moduleId._id || sm.moduleId;
        }).filter(Boolean); // Remove null values
        const newModuleIds = moduleAssignmentForm.moduleIds;

        // Find modules to remove (currently assigned but not in new selection)
        const modulesToRemove = currentModuleIds.filter(id => !newModuleIds.includes(id));

        // Find modules to add (newly selected but not currently assigned)
        const modulesToAdd = newModuleIds.filter(id => !currentModuleIds.includes(id));

        const results = [];

        // Remove unselected modules
        for (const moduleId of modulesToRemove) {
          const semesterModule = currentSemesterModules.find(sm => {
            if (!sm || !sm.moduleId) return false;
            return (sm.moduleId._id || sm.moduleId) === moduleId;
          });
          if (semesterModule) {
            const result = await removeModuleFromSemester(semesterModule._id);
            results.push({ type: 'remove', result, moduleId });
          }
        }

        // Add newly selected modules
        for (const moduleId of modulesToAdd) {
          const result = await addModuleToSemester(
            semester._id,
            moduleId,
            intakeCourseId,
            {
              academicYear: semester.year,
              semesterNumber: semester.semesterNumber
            }
          );
          results.push({ type: 'add', result, moduleId });
        }

        // Check results
        const allSuccessful = results.every(item => item.result.success);

        if (allSuccessful) {
          const removedCount = modulesToRemove.length;
          const addedCount = modulesToAdd.length;

          let message = '';
          if (removedCount > 0 && addedCount > 0) {
            message = `${removedCount} module(s) removed, ${addedCount} module(s) added`;
          } else if (removedCount > 0) {
            message = `${removedCount} module(s) removed`;
          } else if (addedCount > 0) {
            message = `${addedCount} module(s) added`;
          } else {
            message = 'Module assignment updated successfully';
          }

          toast({
            title: "Success",
            description: message,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          const failedCount = results.filter(item => !item.result.success).length;
          toast({
            title: "Partial Success",
            description: `${results.length - failedCount} operations successful, ${failedCount} failed`,
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
        }
      } else {
        // ADD MODE: Add new modules to semester
        // Note: Users can now add modules even when all modules are assigned to other semesters
        // They can remove modules from other semesters and reassign them
        const semesterCourseId = selectedSemester.courseId && (selectedSemester.courseId._id || selectedSemester.courseId);
        if (!semesterCourseId) {
          toast({
            title: "Error",
            description: "Invalid semester course information",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        // Check if there are any modules available for this course
        const totalModules = await getAvailableModulesForCourse(semesterCourseId);
        if (!totalModules || totalModules.length === 0) {
          toast({
            title: "Validation Error",
            description: "No modules available for this course",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Get unassigned modules for this specific semester
        const availableModules = await getUnassignedModulesForSemester(selectedSemester._id, semesterCourseId);

        // If no unassigned modules, check if there are modules assigned to other semesters that could be moved
        if (availableModules.length === 0) {
          // Check if there are any modules for this course that could be moved from other semesters
          const courseModules = modules.filter(module =>
            module.courseId &&
            (Array.isArray(module.courseId)
              ? module.courseId.some(course => course._id === semesterCourseId || course === semesterCourseId)
              : module.courseId._id === semesterCourseId || module.courseId === semesterCourseId)
          );

          if (courseModules.length > 0) {
            // There are modules for this course, allow the user to proceed
            // They can remove modules from other semesters and reassign them
            toast({
              title: "Information",
              description: "All modules are currently assigned. You can remove modules from other semesters and reassign them to this semester.",
              status: "info",
              duration: 4000,
              isClosable: true,
            });
            // Don't return, allow the user to proceed with the assignment
          } else {
            // No modules available for this course
            toast({
              title: "Information",
              description: "No modules available for this course.",
              status: "info",
              duration: 4000,
              isClosable: true,
            });
            // Don't return, allow the user to proceed
          }
        }

        // Check if any of the selected modules are already assigned to this semester
        const currentSemesterModules = getModulesForSemester(semester._id);
        const currentModuleIds = currentSemesterModules.map(sm => {
          if (!sm || !sm.moduleId) return null;
          return sm.moduleId._id || sm.moduleId;
        }).filter(Boolean);

        const modulesToAdd = moduleAssignmentForm.moduleIds.filter(id => !currentModuleIds.includes(id));
        const modulesAlreadyAssigned = moduleAssignmentForm.moduleIds.filter(id => currentModuleIds.includes(id));

        if (modulesAlreadyAssigned.length > 0) {
          toast({
            title: "Information",
            description: `${modulesAlreadyAssigned.length} module(s) are already assigned to this semester. Only new modules will be added.`,
            status: "info",
            duration: 4000,
            isClosable: true,
          });
        }

        // Add only the new modules to the semester
        const results = [];
        for (const moduleId of modulesToAdd) {
          const result = await addModuleToSemester(
            semester._id,
            moduleId,
            intakeCourseId,
            {
              academicYear: semester.year,
              semesterNumber: semester.semesterNumber
            }
          );
          results.push(result);
        }

        // Check if all operations were successful
        if (results.length === 0) {
          toast({
            title: "Information",
            description: "No new modules to add. All selected modules are already assigned to this semester.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        } else {
          const allSuccessful = results.every(result => result.success);

          if (allSuccessful) {
            toast({
              title: "Success",
              description: `${results.length} new module(s) assigned to semester successfully`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            const failedCount = results.filter(result => !result.success).length;
            toast({
              title: "Partial Success",
              description: `${results.length - failedCount} modules assigned, ${failedCount} failed`,
              status: "warning",
              duration: 4000,
              isClosable: true,
            });
          }
        }
      }

      // Refresh data and close modal
      await fetchSemesterModulesBySchoolId();
      handleCloseModuleModal();

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (isLoading && semesters.length === 0) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading semester modules...</Text>
        </VStack>
      </Center>
    );
  }

  // Add error boundary for render errors
  if (error) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Alert status="error" borderRadius="md" maxW="500px">
            <AlertIcon />
            <AlertTitle>Something went wrong!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button colorScheme="blue" onClick={handleRefresh}>
            Try Again
          </Button>
        </VStack>
      </Center>
    );
  }

  // Global error boundary
  if (hasError) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Alert status="error" borderRadius="md" maxW="500px">
            <AlertIcon />
            <AlertTitle>Something went wrong!</AlertTitle>
            <AlertDescription>
              An unexpected error occurred. Please refresh the page or contact support.
            </AlertDescription>
          </Alert>
          <Button
            colorScheme="blue"
            onClick={() => {
              setHasError(false);
              setErrorInfo(null);
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </VStack>
      </Center>
    );
  }

  try {
    return (
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 0 }}>
          <Box textAlign={{ base: "center", lg: "left" }}>
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="bold" color="gray.800">
              Semester Module Management
            </Text>
            <Text color="gray.600" fontSize={{ base: "sm", lg: "md" }}>
              Manage module assignments and semester module relationships
            </Text>
          </Box>
          <HStack spacing={{ base: 2, lg: 3 }} flexWrap="wrap" justify={{ base: "center", lg: "flex-end" }}>
            <Button
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={handleRefresh}
              isLoading={isLoading}
              size={{ base: "sm", lg: "sm" }}
              variant="outline"
            >
              Refresh
            </Button>
            <HStack spacing={{ base: 1, lg: 2 }}>
              <Button
                size={{ base: "sm", lg: "sm" }}
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setViewMode('grid')}
                leftIcon={<Icon as={FiBookOpen} />}
              >
                <Text display={{ base: "none", sm: "block" }}>Grid View</Text>
                <Text display={{ base: "block", sm: "none" }}>Grid</Text>
              </Button>
              <Button
                size={{ base: "sm", lg: "sm" }}
                variant={viewMode === 'timeline' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setViewMode('timeline')}
                leftIcon={<Icon as={FiClock} />}
              >
                <Text display={{ base: "none", sm: "block" }}>Timeline View</Text>
                <Text display={{ base: "block", sm: "none" }}>Timeline</Text>
              </Button>
            </HStack>
          </HStack>
        </Flex>

        {/* Error Display */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Total Semesters</Text>
                <Text fontSize="2xl" fontWeight="bold">{semesters.length}</Text>
              </VStack>
            </CardBody>
          </Card>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Active Semesters</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {semesters.filter(s => s.status === 'active').length}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Total Module Assignments</Text>
                <Text fontSize="2xl" fontWeight="bold">{semesterModules.length}</Text>
              </VStack>
            </CardBody>
          </Card>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Available Modules</Text>
                <Text fontSize="2xl" fontWeight="bold">{modules.length}</Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Semesters Grouped by Course */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
              {viewMode === 'grid' ? 'Semesters by Course' : 'Semester Timeline'}
            </Text>

            {intakeCourses.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FiBookOpen} boxSize={8} color="gray.400" />
                  <Text color="gray.500">No courses available</Text>
                  <Text fontSize="sm" color="gray.400">Add courses to get started</Text>
                </VStack>
              </Center>
            ) : viewMode === 'timeline' ? (
              // Timeline View
              <Box>
                {intakeCourses.length === 0 ? (
                  <Center py={8}>
                    <VStack spacing={4}>
                      <Icon as={FiBookOpen} boxSize={8} color="gray.400" />
                      <Text color="gray.500">No courses available</Text>
                      <Text fontSize="sm" color="gray.400">Add courses to get started</Text>
                    </VStack>
                  </Center>
                ) : (
                  <Flex gap={6}>
                    {/* Course Selection Sidebar */}
                    <Box
                      w="250px"
                      bg="gray.50"
                      borderRadius="lg"
                      p={4}
                      border="1px"
                      borderColor="gray.200"
                      position="sticky"
                      top={4}
                      h="500px"
                      overflowY="auto"
                    >
                      <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
                        Select Course
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {intakeCourses.map((intakeCourse) => {
                          if (!intakeCourse || !intakeCourse.courseId) return null;
                          const courseSemesters = getTimelineSemestersForCourse(intakeCourse.courseId._id);
                          const isSelected = selectedCourseForTimeline === intakeCourse._id;
                          const hasSemesters = courseSemesters.length > 0;

                          return (
                            <Box
                              key={intakeCourse._id}
                              p={3}
                              bg={isSelected ? "blue.100" : hasSemesters ? "white" : "orange.50"}
                              borderRadius="md"
                              border="1px"
                              borderColor={isSelected ? "blue.300" : hasSemesters ? "gray.200" : "orange.200"}
                              cursor={hasSemesters ? "pointer" : "default"}
                              opacity={hasSemesters ? 1 : 0.8}
                              _hover={hasSemesters ? {
                                bg: isSelected ? "blue.200" : "gray.100",
                                transform: "translateX(4px)",
                                transition: "all 0.2s"
                              } : {
                                bg: "orange.100",
                                borderColor: "orange.300",
                                transition: "all 0.2s"
                              }}
                              onClick={() => {
                                if (hasSemesters) {
                                  setSelectedCourseForTimeline(intakeCourse._id);
                                }
                              }}
                            >
                              <VStack spacing={2} align="stretch">
                                <Text fontSize="sm" fontWeight="semibold" color="gray.800" noOfLines={1}>
                                  {intakeCourse.courseId.courseName}
                                </Text>
                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                  {intakeCourse.courseId.courseCode}
                                </Text>
                                <HStack justify="space-between" align="center">
                                  <Text fontSize="xs" color={hasSemesters ? "blue.600" : "gray.500"} fontWeight="medium">
                                    {courseSemesters.length} semester{courseSemesters.length !== 1 ? 's' : ''}
                                  </Text>
                                  {!hasSemesters && (
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                      No semesters yet
                                    </Text>
                                  )}
                                </HStack>

                              </VStack>
                            </Box>
                          );
                        })}
                      </VStack>
                    </Box>

                    {/* Main Content Area */}
                    <Box flex="1" h={"500px"} overflowY="auto">
                      {!selectedCourseForTimeline ? (
                        <Center py={12}>
                          <VStack spacing={4}>
                            <Icon as={FiClock} boxSize={12} color="gray.400" />
                            <Text fontSize="lg" color="gray.600" fontWeight="medium">
                              Select a course to view timeline
                            </Text>
                            <Text fontSize="sm" color="gray.500" textAlign="center">
                              Choose a course from the sidebar to see its semester timeline
                            </Text>
                          </VStack>
                        </Center>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {/* Course Header */}
                          {(() => {
                            const selectedCourse = intakeCourses.find(ic => ic._id === selectedCourseForTimeline);
                            const courseSemesters = getTimelineSemestersForCourse(selectedCourse.courseId._id);

                            // Calculate total semester modules for this intake course
                            const totalSemesterModules = courseSemesters.reduce((total, semester) => {
                              const semesterModules = getModulesForSemester(semester._id);
                              return total + semesterModules.length;
                            }, 0);

                            return (
                              <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                                <HStack justify="space-between" align="center">
                                  <Box>
                                    <Text fontSize="xl" fontWeight="bold" color="blue.700">
                                      {selectedCourse.courseId.courseName}
                                    </Text>
                                    <Text fontSize="sm" color="blue.600">
                                      {selectedCourse.courseId.courseCode} • {courseSemesters.length} semester{courseSemesters.length !== 1 ? 's' : ''} • {totalSemesterModules} module{totalSemesterModules !== 1 ? 's' : ''} total
                                    </Text>
                                  </Box>
                                </HStack>
                              </Box>
                            );
                          })()}

                          {/* Timeline Semesters */}
                          {(() => {
                            const selectedCourse = intakeCourses.find(ic => ic._id === selectedCourseForTimeline);
                            const courseSemesters = getTimelineSemestersForCourse(selectedCourse.courseId._id);

                            if (courseSemesters.length === 0) {
                              return (
                                <Center py={8}>
                                  <VStack spacing={4}>
                                    <Icon as={FiCalendar} boxSize={8} color="gray.400" />
                                    <Text color="gray.500">No semesters with dates for this course</Text>
                                    <Text fontSize="sm" color="gray.400">Add semesters with start dates to view timeline</Text>

                                  </VStack>
                                </Center>
                              );
                            }

                            return (
                              <VStack spacing={4} align="stretch">
                                {courseSemesters
                                  .filter(semester => semester && semester._id) // Filter out invalid semesters
                                  .map((semester, index) => {
                                    const semesterModules = getModulesForSemester(semester._id);
                                    const isActive = semester.status === 'active';

                                    return (
                                      <Card
                                        key={semester._id}
                                        id={`semester-${semester._id}`}
                                        bg={isActive ? "blue.50" : "white"}
                                        borderColor={isActive ? "blue.200" : "gray.200"}
                                        borderWidth="1px"
                                        _hover={{
                                          transform: "translateY(-2px)",
                                          boxShadow: "lg",
                                          borderColor: isActive ? "blue.300" : "gray.300",
                                          transition: "all 0.2s"
                                        }}
                                      >
                                        <CardBody p={5}>
                                          <VStack spacing={4} align="stretch">
                                            {/* Semester Header with Timeline Info */}
                                            <HStack justify="space-between" align="start">
                                              <Box flex="1">
                                                <HStack spacing={3} align="center" mb={2}>
                                                  <Icon as={FiCalendar} color="blue.500" />
                                                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                                    {semester.semesterName}
                                                  </Text>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600" mb={1}>
                                                  Year {semester.year} - Semester {semester.semesterNumber}
                                                </Text>
                                                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                                  📅 {formatTimelineDate(semester.startDate)} - {formatTimelineDate(semester.endDate)}
                                                </Text>
                                              </Box>
                                              <Badge
                                                colorScheme={getStatusColor(semester.status)}
                                                size="md"
                                                variant="subtle"
                                              >
                                                {semester.status}
                                              </Badge>
                                            </HStack>

                                            <Divider />

                                            {/* Module Count and Assign Button */}
                                            <HStack justify="space-between" align="center">
                                              <HStack spacing={2}>
                                                <Icon as={FiBookOpen} boxSize={4} color="blue.500" />
                                                <Text fontSize="sm" color="gray.600">
                                                  {semesterModules.length} module{semesterModules.length !== 1 ? 's' : ''} assigned
                                                </Text>
                                              </HStack>
                                              <Button
                                                size="sm"
                                                colorScheme="blue"
                                                variant="outline"
                                                onClick={() => handleOpenModuleModal(semester, semesterModules.length > 0 ? semesterModules : null)}
                                              >
                                                Assign Module
                                              </Button>
                                            </HStack>

                                            {/* Module List */}
                                            {semesterModules.length > 0 && (
                                              <Box>
                                                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
                                                  Assigned Modules:
                                                </Text>
                                                <VStack spacing={1} align="stretch" maxH="120px" overflowY="auto">
                                                  {semesterModules.map((sm, idx) => {
                                                    if (!sm || !sm.moduleId) return null;
                                                    const module = sm.moduleId;
                                                    return (
                                                      <HStack
                                                        key={idx}
                                                        p={2}
                                                        bg="gray.50"
                                                        borderRadius="md"
                                                        spacing={2}
                                                        justify="space-between"
                                                      >
                                                        <Box flex="1">
                                                          <Text fontSize="xs" fontWeight="medium" color="gray.700" noOfLines={1}>
                                                            {module.moduleName}
                                                          </Text>
                                                          <Text fontSize="xs" color="gray.500">
                                                            {module.code}
                                                          </Text>
                                                        </Box>
                                                        <Text fontSize="xs" color="gray.400">
                                                          {module.totalCreditHours || 'N/A'} total credit hours
                                                        </Text>
                                                      </HStack>
                                                    );
                                                  })}
                                                </VStack>
                                              </Box>
                                            )}

                                            <HStack spacing={2} justify="center" pt={2}>

                                            </HStack>
                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    );
                                  })}


                              </VStack>
                            );
                          })()}
                        </VStack>
                      )}
                    </Box>
                  </Flex>
                )}
              </Box>
            ) : (
              <>
                {/* Grid View Controls */}
                <HStack justify="space-between" align="center" mb={4}>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                    Course Overview
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const allCourseIds = intakeCourses.map(ic => ic._id);
                        setExpandedCourses(new Set(allCourseIds));
                      }}
                    >
                      Expand All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedCourses(new Set())}
                    >
                      Collapse All
                    </Button>
                  </HStack>
                </HStack>

                {/* Grid View (Original) */}
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                  {intakeCourses.map((intakeCourse) => {
                    if (!intakeCourse || !intakeCourse.courseId) return null;
                    const courseSemesters = semesters.filter(s =>
                      s && s.intakeCourseId?.courseId && (s.intakeCourseId.courseId._id === intakeCourse.courseId._id || s.intakeCourseId.courseId === intakeCourse.courseId._id)
                    );

                    if (courseSemesters.length === 0) {
                      return (
                        <Card key={intakeCourse._id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                          <CardBody p={6}>
                            <VStack spacing={4} align="center">
                              <Icon as={FiBookOpen} boxSize={8} color="gray.400" />
                              <Box textAlign="center">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={1}>
                                  {intakeCourse.courseId.courseName}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {intakeCourse.courseId.courseCode} • No semesters yet
                                </Text>
                              </Box>

                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    }

                    return (
                      <Card key={intakeCourse._id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody p={{ base: 4, lg: 5 }}>
                          <VStack spacing={{ base: 4, lg: 5 }} align="stretch">
                            {/* Course Header */}
                            <Box textAlign="center" pb={{ base: 3, lg: 4 }} borderBottom="1px" borderColor={borderColor}>
                              <HStack justify="space-between" align="center">
                                <Box flex="1">
                                  <Text fontSize={{ base: "md", lg: "lg" }} fontWeight="bold" color="blue.600" mb={1}>
                                    {intakeCourse.courseId.courseName}
                                  </Text>
                                  <Text fontSize={{ base: "xs", lg: "sm" }} color="gray.600">
                                    {intakeCourse.intakeId.intakeName}
                                  </Text>
                                  <Text fontSize={{ base: "xs", lg: "sm" }} color="gray.600">
                                    {courseSemesters.length} semester{courseSemesters.length !== 1 ? 's' : ''} • {intakeCourse.courseId.courseCode}
                                  </Text>
                                </Box>
                                <Button
                                  size={{ base: "xs", lg: "sm" }}
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => toggleCourseExpansion(intakeCourse._id)}
                                  aria-label={isCourseExpanded(intakeCourse._id) ? "Collapse course" : "Expand course"}
                                >
                                  <Icon as={isCourseExpanded(intakeCourse._id) ? FiChevronUp : FiChevronDown} />
                                </Button>
                              </HStack>
                            </Box>

                            {/* Course Summary - Always Visible */}
                            <Box
                              p={3}
                              bg="gray.50"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => toggleCourseExpansion(intakeCourse._id)}
                              _hover={{
                                bg: "gray.100",
                                transform: "translateY(-1px)",
                                transition: "all 0.2s"
                              }}
                            >
                              <HStack justify="space-between" align="center">
                                <HStack spacing={4}>
                                  <HStack spacing={2}>
                                    <Icon as={FiCalendar} color="blue.500" />
                                    <Text fontSize="sm" color="gray.600">
                                      {courseSemesters.length} semester{courseSemesters.length !== 1 ? 's' : ''}
                                    </Text>
                                  </HStack>
                                  <HStack spacing={2}>
                                    <Icon as={FiBookOpen} color="green.500" />
                                    <Text fontSize="sm" color="gray.600">
                                      {(() => {
                                        const totalModules = courseSemesters.reduce((total, semester) => {
                                          return total + getModulesForSemester(semester._id).length;
                                        }, 0);
                                        return `${totalModules} module${totalModules !== 1 ? 's' : ''} total`;
                                      })()}
                                    </Text>
                                  </HStack>
                                </HStack>
                                <HStack spacing={2} align="center">
                                  <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                    {isCourseExpanded(intakeCourse._id) ? 'Click to collapse' : 'Click to expand'}
                                  </Text>
                                  <Icon
                                    as={isCourseExpanded(intakeCourse._id) ? FiChevronUp : FiChevronDown}
                                    color="blue.500"
                                    transition="transform 0.2s"
                                  />
                                </HStack>
                              </HStack>
                            </Box>

                            {/* Semesters List */}
                            <Box
                              overflow="hidden"
                              transition="all 0.3s ease-in-out"
                              maxH={isCourseExpanded(intakeCourse._id) ? "2000px" : "0px"}
                              opacity={isCourseExpanded(intakeCourse._id) ? 1 : 0}
                            >
                              <VStack spacing={4} align="stretch">
                                {courseSemesters
                                  .filter(semester => semester && semester.year && semester.semesterNumber) // Filter out invalid semesters
                                  .sort((a, b) => {
                                    // Sort by year first, then by semester number
                                    if (a.year !== b.year) return a.year - b.year;
                                    return a.semesterNumber - b.semesterNumber;
                                  })
                                  .map((semester) => {
                                    const semesterModules = getModulesForSemester(semester._id);
                                    const isActive = semester.status === 'active';
                                    return (
                                      <Card
                                        key={semester._id}
                                        bg={isActive ? "blue.50" : "white"}
                                        borderColor={isActive ? "blue.200" : "gray.200"}
                                        borderWidth="1px"
                                        cursor="pointer"
                                        _hover={{
                                          transform: "translateY(-2px)",
                                          boxShadow: "lg",
                                          borderColor: isActive ? "blue.300" : "gray.300",
                                          transition: "all 0.2s"
                                        }}
                                      >
                                        <CardBody p={4}>
                                          <VStack spacing={3} align="stretch">
                                            {/* Semester Header */}
                                            <HStack justify="space-between" align="start">
                                              <Box flex="1">
                                                <Text fontSize="md" fontWeight="semibold" color="gray.800">
                                                  {semester.semesterName}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                  Year {semester.year} - Semester {semester.semesterNumber}
                                                </Text>
                                              </Box>
                                              <Badge
                                                colorScheme={getStatusColor(semester.status)}
                                                size="sm"
                                                variant="subtle"
                                              >
                                                {semester.status}
                                              </Badge>
                                            </HStack>

                                            {/* Semester Details */}
                                            <Box>
                                              <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                                                Duration:
                                              </Text>
                                              <Text fontSize="sm" color="gray.700">
                                                {semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'N/A'} -
                                                {semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'N/A'}
                                              </Text>
                                            </Box>

                                            {/* Module Count and Assign Button */}
                                            <HStack justify="space-between" align="center">
                                              <HStack spacing={2}>
                                                <Icon as={FiBookOpen} boxSize={4} color="blue.500" />
                                                <Text fontSize="sm" color="gray.600">
                                                  {semesterModules.length} module{semesterModules.length !== 1 ? 's' : ''} assigned
                                                </Text>
                                              </HStack>
                                              <Button
                                                size="sm"
                                                colorScheme="blue"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenModuleModal(semester, semesterModules.length > 0 ? semesterModules : null);
                                                }}
                                              >
                                                Assign Module
                                              </Button>
                                            </HStack>

                                            {/* Module List */}
                                            {semesterModules.length > 0 && (
                                              <Box>
                                                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
                                                  Assigned Modules:
                                                </Text>
                                                <VStack spacing={1} align="stretch" maxH="100px" overflowY="auto">
                                                  {semesterModules.map((sm, idx) => {
                                                    if (!sm || !sm.moduleId) return null;
                                                    const module = sm.moduleId;
                                                    return (
                                                      <HStack
                                                        key={idx}
                                                        p={1.5}
                                                        bg="gray.50"
                                                        borderRadius="md"
                                                        spacing={2}
                                                        justify="space-between"
                                                      >
                                                        <Box flex="1">
                                                          <Text fontSize="xs" fontWeight="medium" color="gray.700" noOfLines={1}>
                                                            {module.moduleName}
                                                          </Text>
                                                          <Text fontSize="xs" color="gray.500">
                                                            {module.code}
                                                          </Text>
                                                        </Box>
                                                        <Text fontSize="xs" color="gray.400">
                                                          {module.totalCreditHours || 'N/A'} Total CH
                                                        </Text>
                                                      </HStack>
                                                    );
                                                  })}
                                                </VStack>
                                              </Box>
                                            )}

                                            {/* Helpful Information */}
                                            {semesterModules.length > 0 && (
                                              <Text fontSize="xs" color="gray.500" textAlign="center" fontStyle="italic">
                                                💡 You can modify existing assignments or add new modules
                                              </Text>
                                            )}


                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    );
                                  })}
                              </VStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </Grid>
              </>
            )}
          </CardBody>
        </Card>



        {/* Add/Edit Module Assignment Modal */}
        <Modal isOpen={isModuleModalOpen} onClose={handleCloseModuleModal} size="xl" >
          <ModalOverlay />
          <ModalContent bg="rgba(220, 252, 231, 0.1)" backdropFilter="blur(10px)" color="white">
            <ModalHeader>
              {isModuleEditMode ? "Edit Module Assignment" : "Assign Modules to Semester"}
              {!isModuleEditMode && availableModules.length === 0 && (
                <Text fontSize="sm" color="blue.600" fontWeight="normal" mt={2}>
                  💡 All modules are assigned - you can still proceed to modify assignments
                </Text>
              )}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Semester Info */}
                {selectedSemester && (
                  <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                    <Text fontSize="lg" fontWeight="semibold" color="blue.700">
                      {selectedSemester.semesterName}
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      Year {selectedSemester.year} - Semester {selectedSemester.semesterNumber}
                    </Text>
                    {!isModuleEditMode && (
                      <Text fontSize="xs" color="blue.600" mt={2} fontStyle="italic">
                        💡 You can assign modules even when all are currently assigned to other semesters
                      </Text>
                    )}
                  </Box>
                )}

                {/* Module Selection */}
                {!selectedSemester ? (
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Please select a semester first
                  </Text>
                ) : isLoadingModules ? (
                  <Center>
                    <Spinner size="md" color="blue.500" />
                    <Text ml={2} color="gray.500">Loading available modules...</Text>
                  </Center>
                ) : (
                  <>
                    {availableModules.length === 0 && (
                      <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200" mb={4}>
                        <Text color="blue.600" fontSize="sm" textAlign="center" mb={3}>
                          {(() => {
                            const courseId = selectedSemester.courseId && (selectedSemester.courseId._id || selectedSemester.courseId);

                            if (!courseId) return "Invalid course information";
                            const courseModules = modules.filter(module =>
                              module.courseId &&
                              (Array.isArray(module.courseId)
                                ? module.courseId.some(course => course._id === courseId || course === courseId)
                                : module.courseId._id === courseId || module.courseId === courseId)
                            );

                            if (courseModules.length === 0) {
                              return "No modules available for this course. Please add modules first.";
                            } else {
                              return "All modules are currently assigned. You can still proceed to modify assignments.";
                            }
                          })()}
                        </Text>
                        <Text color="blue.700" fontSize="xs" textAlign="center" fontStyle="italic">
                          💡 You can still assign modules by removing them from other semesters first
                        </Text>
                      </Box>
                    )}

                    {/* Always show module selection, even when no unassigned modules */}
                    <MultiSelectPopover
                      items={availableModules.length > 0 ? availableModules : []}
                      selectedIds={moduleAssignmentForm.moduleIds}
                      onChange={handleModuleIdsChange}
                      label="Select Modules"
                      isRequired={true}
                      getLabel={(module) => `${module.moduleName} (${module.code})`}
                      getId={(module) => module._id}
                      placeholder={availableModules.length === 0 ? "No unassigned modules available. You can still proceed to modify existing assignments." : "Select modules to assign"}
                    />
                  </>
                )}


              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModuleModal}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleModuleAssignmentSubmit}
                isDisabled={!moduleAssignmentForm.moduleIds || moduleAssignmentForm.moduleIds.length === 0}
              >
                {isModuleEditMode ? "Update" : "Assign"} Modules
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    );
  } catch (error) {
    console.error('Error rendering SemesterModuleManagement:', error);
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Alert status="error" borderRadius="md" maxW="500px">
            <AlertIcon />
            <AlertTitle>Render Error!</AlertTitle>
            <AlertDescription>
              An error occurred while rendering the component. Please refresh the page.
            </AlertDescription>
          </Alert>
          <Button
            colorScheme="blue"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </VStack>
      </Center>
    );
  }
}
