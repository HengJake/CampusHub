import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useAcademicStore } from '../../store/academic';
import { useAuth } from '../../hooks/useAuth';
import { SchoolAdminComponent } from '../../component/common/RoleBasedComponent';
import { useShowToast } from "../../store/utils/toast.js"

export const AcademicManagement = () => {
  const {
    students,
    courses,
    intakes,
    intakeCourses,
    departments,
    lecturers,
    modules,
    loading,
    errors,
    fetchStudents,
    fetchCourses,
    // fetchIntakes,
    fetchIntakeCourses,
    fetchDepartments,
    fetchLecturers,
    fetchModules,
    getCourseCompletionRate,
    getAllCourseCompletionRate,
    getExamPassRate,
    getAverageAttendance
  } = useAcademicStore();

  const showToast = useShowToast();
  const { user, schoolId, userRole, logIn } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    completionRate: 0,
    passRate: 0,
    avgAttendance: 0
  });

  // Load all academic data for schoolAdmin
  const loadAcademicData = async () => {
    try {
      // All these calls automatically include schoolId for schoolAdmin
      const results = await Promise.allSettled([
        // fetchStudents(),
        // fetchCourses(),
        // fetchIntakes(),
        // fetchIntakeCourses(),
        // fetchDepartments(),
        // fetchLecturers(),
        // fetchModules()
      ]);

      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some data failed to load:', failures);
      }
    } catch (error) {
      toast({
        title: 'Error Loading Data',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Calculate statistics
  useEffect(() => {
    if (students.length > 0 || courses.length > 0) {
      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        completionRate: getAllCourseCompletionRate(),
        passRate: modules.length > 0 ? getExamPassRate(modules[0]?._id) : 0,
        avgAttendance: students.length > 0 ? getAverageAttendance(students[0]?._id) : 0
      });
    }
  }, [students, courses, modules]);

  // Auto-load data when component mounts
  useEffect(() => {
    loadAcademicData();
  }, []);

  return (
    <SchoolAdminComponent
      onAuthSuccess={({ schoolId, role }) => {
        showToast.success("Data Loaded", `Successfully loaded academic data for school ${schoolId}`, "data1")
        loadAcademicData();
      }}
      onAuthError={(error) => {
        console.error('❌ SchoolAdmin authentication failed:', error);
      }}
    >

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header with role and school context */}
          <Box>
            <Heading size="lg" mb={2}>
              Academic Management Dashboard
            </Heading>
            <Text color="gray.600" fontSize="lg">
              School: {schoolId} | Role: {userRole}
            </Text>
            <Badge colorScheme="green" mt={2}>
              ✅ Automatic schoolId injection active
            </Badge>
          </Box>

          {/* Loading States */}
          {Object.values(loading).some(Boolean) && (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>Loading Data</AlertTitle>
              <AlertDescription>
                Fetching academic data for your school...
              </AlertDescription>
            </Alert>
          )}

          {/* Error States */}
          {Object.values(errors).some(error => error) && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Data Loading Errors</AlertTitle>
              <AlertDescription>
                Some data failed to load. Check console for details.
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics Grid */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Students</StatLabel>
                    <StatNumber>{stats.totalStudents}</StatNumber>
                    <StatHelpText>
                      {loading.students ? 'Loading...' : 'Enrolled students'}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Courses</StatLabel>
                    <StatNumber>{stats.totalCourses}</StatNumber>
                    <StatHelpText>
                      {loading.courses ? 'Loading...' : 'Active courses'}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Completion Rate</StatLabel>
                    <StatNumber>{stats.completionRate.toFixed(1)}%</StatNumber>
                    <StatHelpText>Course completion rate</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Pass Rate</StatLabel>
                    <StatNumber>{stats.passRate.toFixed(1)}%</StatNumber>
                    <StatHelpText>Exam pass rate</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Data Summary */}
          <Box>
            <Heading size="md" mb={4}>Data Summary</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              <Card>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Students</Text>
                    <Text>{students.length} students loaded</Text>
                    <Text fontSize="sm" color="gray.500">
                      {loading.students ? 'Loading...' : 'Ready'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Courses</Text>
                    <Text>{courses.length} courses loaded</Text>
                    <Text fontSize="sm" color="gray.500">
                      {loading.courses ? 'Loading...' : 'Ready'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Intakes</Text>
                    <Text>{intakes.length} intakes loaded</Text>
                    <Text fontSize="sm" color="gray.500">
                      {loading.intakes ? 'Loading...' : 'Ready'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Departments</Text>
                    <Text>{departments.length} departments loaded</Text>
                    <Text fontSize="sm" color="gray.500">
                      {loading.departments ? 'Loading...' : 'Ready'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </Box>

          {/* Actions */}
          <Box>
            <Heading size="md" mb={4}>Actions</Heading>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={loadAcademicData}
                isLoading={Object.values(loading).some(Boolean)}
              >
                Refresh Data
              </Button>
              <Button
                colorScheme="green"
                onClick={() => {
                  toast({
                    title: 'School Context',
                    description: `Current schoolId: ${schoolId}`,
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                Show School Context
              </Button>
            </HStack>
          </Box>

          {/* Debug Information */}
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="bold" mb={2}>Debug Information:</Text>
            <Text fontSize="xs" fontFamily="mono">
              SchoolId: {schoolId} | Role: {userRole} | User: {user?.email}
            </Text>
            <Text fontSize="xs" fontFamily="mono">
              All API calls automatically include schoolId for schoolAdmin operations
            </Text>
          </Box>
        </VStack>
      </Container>
    </SchoolAdminComponent>
  );
};
