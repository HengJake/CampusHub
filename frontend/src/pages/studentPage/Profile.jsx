"use client"

import {
  Box,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Avatar,
  Button,
  useColorModeValue,
  Grid,
  Badge,
  Divider,
  Icon,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiDownload, FiSave } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useAcademicStore } from "../../store/academic.js"
import { useFacilityStore } from "../../store/facility.js"
import { useAuthStore } from "../../store/auth.js"
import { useUserStore } from "../../store/user.js"
import ProfilePicture from "../../component/common/ProfilePicture"
import { useToast } from "@chakra-ui/react"

export default function Profile() {
  const { currentUser, getCurrentUser, getStudent } = useAuthStore()
  const {
    results,
    attendance,
    fetchResultsByStudentId,
    fetchAttendanceByStudentId,
    fetchIntakeCoursesBySchoolId,
    intakeCourses,
    loading: academicLoading,
    errors: academicErrors
  } = useAcademicStore()


  const {
    bookings,
    fetchBookingsByStudentId,
    fetchBookingsByUserId,
    loading: facilityLoading,
    errors: facilityErrors
  } = useFacilityStore()

  const toast = useToast()

  const [studentProfile, setStudentProfile] = useState(null)
  const [academicResults, setAcademicResults] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [authData, setAuthData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableProfile, setEditableProfile] = useState({})

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Get student object from auth store
  const student = getStudent()

  // Debug logging for auth data

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDataLoaded) {
        setLoadingTimeout(true)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timer)
  }, [isDataLoaded])

  // Fetch authentication data on component mount
  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await fetch('/auth/is-auth', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthData(data);
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
      }
    };

    fetchAuthData();
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    // Prevent multiple executions
    if (isDataLoaded) {
      return
    }

    const fetchProfileData = async () => {
      try {

        await fetchIntakeCoursesBySchoolId()

        // Use authData if available, otherwise fall back to currentUser
        const user = authData || currentUser;

        if (!user) {
          setIsDataLoaded(true) // Mark as loaded to prevent infinite loading
          return
        }

        // Determine the student ID to use for fetching data
        let studentId = null;
        if (user.student && user.student._id) {
          studentId = user.student._id;
        } else if (user.studentId) {
          studentId = user.studentId;
        }

        if (!studentId) {
          setIsDataLoaded(true) // Mark as loaded to prevent infinite loading
          return
        }

        // Fetch academic results by student ID
        const resultsPromise = fetchResultsByStudentId(studentId)

        // Fetch attendance records by student ID
        const attendancePromise = fetchAttendanceByStudentId(studentId)

        // Fetch user's bookings by student ID
        const bookingsPromise = fetchBookingsByStudentId(studentId)

        // Wait for all promises to complete
        await Promise.all([resultsPromise, attendancePromise, bookingsPromise])

        setIsDataLoaded(true)

      } catch (error) {
        console.error('Error fetching profile data:', error)
        setIsDataLoaded(true) // Mark as loaded even on error to prevent infinite loading
      }
    }

    if (authData || currentUser) {
      fetchProfileData()
    }
  }, [fetchResultsByStudentId, fetchAttendanceByStudentId, fetchBookingsByStudentId, currentUser, isDataLoaded, authData])

  // Process student profile from auth data
  useEffect(() => {

    if (authData) {
      const { user, student, school } = authData;
      console.log("🚀 ~ Profile ~ student:", student)

      if (user && student) {
        const profileData = {
          id: user._id,
          name: user.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student Name',
          email: user.email,
          studentId: student._id,
          program: intakeCourses.find(course => course._id == student.intakeCourseId)?.courseId?.courseName || 'Not specified',
          intake: intakeCourses.find(course => course._id == student.intakeCourseId)?.intakeId?.intakeName || 'Not specified',
          year: student.currentYear || 1,
          semester: student.currentSemester || 'Current',
          profilePicture: user.profilePicture || null,
          phone: user.phoneNumber || 'Not provided',
          address: school?.address || 'Not provided',
          schoolName: school?.name || 'Not specified'
        };
        setStudentProfile(profileData);
        setEditableProfile(profileData);
      }
    } else if (student) {
      const profileData = {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        studentId: student.studentId,
        program: student.program || student.course || 'Not specified',
        year: student.year || 1,
        semester: student.semester || 'Current',
        profilePicture: student.profilePicture || null,
        phone: student.phone || 'Not provided',
        address: student.address || 'Not provided'
      };
      setStudentProfile(profileData);
      setEditableProfile(profileData);
    } else {
      // No student data available
    }
  }, [authData, student])

  // Process fetched data
  useEffect(() => {
    if (results.length > 0 && authData?.student?._id) {
      const studentResults = results.filter(r =>
        r.studentId === authData.student._id || r.student === authData.student._id
      )
      setAcademicResults(studentResults.map(result => ({
        id: result._id,
        course: result.moduleName || result.course || 'Unknown Course',
        grade: result.grade || 'N/A',
        gpa: result.gpa || 0,
        semester: result.semester || 'Unknown Semester',
        credits: result.credits || 0
      })))
    }
  }, [results, authData])

  useEffect(() => {
    if (attendance.length > 0 && authData?.student?._id) {
      const studentAttendance = attendance.filter(a =>
        a.studentId === authData.student._id || a.student === authData.student._id
      )
      setAttendanceRecords(studentAttendance.map(record => ({
        id: record._id,
        course: record.moduleName || record.course || 'Unknown Course',
        attended: record.attended || 0,
        total: record.total || 0,
        percentage: record.percentage || 0,
        status: record.percentage >= 80 ? 'good' : record.percentage >= 60 ? 'warning' : 'poor'
      })))
    }
  }, [attendance, authData])

  useEffect(() => {
    if (bookings.length > 0 && authData?.student?._id) {
      const studentBookings = bookings.filter(b =>
        b.studentId === authData.student._id || b.student === authData.student._id
      )
      setMyBookings(studentBookings.map(booking => ({
        id: booking._id,
        type: booking.resourceType || 'Resource',
        resource: booking.resourceName || booking.resource || 'Unknown Resource',
        date: new Date(booking.date).toLocaleDateString(),
        time: `${booking.startTime} - ${booking.endTime}`,
        status: booking.status || 'pending'
      })))
    }
  }, [bookings, authData])

  // Debug logging for loading states

  // Show loading state only if we're actually loading and have a student, and haven't timed out
  if (authData?.student && !loadingTimeout && (academicLoading.results || academicLoading.attendance || facilityLoading.bookings)) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading profile data...</Text>
          {loadingTimeout && <Text fontSize="sm" color="gray.500">Taking longer than expected...</Text>}
        </VStack>
      </Box>
    )
  }

  // Show a simple loading state if we don't have any data yet
  if (!authData?.student && !currentUser) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Initializing profile...</Text>
        </VStack>
      </Box>
    )
  }

  // Show error state
  if (academicErrors.results || academicErrors.attendance || facilityErrors.bookings) {
    return (
      <Box minH="100vh" p={6}>
        <Alert status="error">
          <AlertIcon />
          <Text>Error loading profile data. Please try again later.</Text>
        </Alert>
      </Box>
    )
  }

  // Show message if no student profile found
  if (!studentProfile && !authData?.student) {
    return (
      <Box minH="100vh" p={6}>
        <Alert status="info">
          <AlertIcon />
          <Text>Student profile not found. Please contact your administrator.</Text>
        </Alert>
      </Box>
    )
  }

  // If we don't have a student profile but we have student data, create a basic one
  if (!studentProfile && authData?.student) {
    // This will be handled by the useEffect, but we can show a basic version
    const { user, student, school } = authData;
    const basicProfile = {
      id: user._id,
      name: user.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student Name',
      email: user.email,
      studentId: student._id,
      program: student.intakeCourseId || 'Not specified',
      year: student.currentYear || 1,
      semester: student.currentSemester || 'Current',
      profilePicture: user.profilePicture || null,
      phone: user.phoneNumber || 'Not provided',
      address: school?.address || 'Not provided',
      schoolName: school?.name || 'Not specified'
    }

    // Use the basic profile for now
    return (
      <Box minH="100vh">
        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Student Profile
            </Text>
            <Text color="gray.600">Loading profile data...</Text>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <Text>Profile data is still loading. Some information may be incomplete.</Text>
          </Alert>

          {/* Basic profile display */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
            <CardBody>
              <VStack spacing={4}>
                <ProfilePicture
                  src={basicProfile.profilePicture}
                  name={basicProfile.name}
                  size="2xl"
                  bgColor="#3182ce"
                  onPhotoChange={() => { }}
                />
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="bold">
                    {basicProfile.name}
                  </Text>
                  <Text color="gray.600">{basicProfile.studentId}</Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {basicProfile.program}
                  </Badge>
                  {basicProfile.schoolName && (
                    <Text fontSize="sm" color="gray.500">{basicProfile.schoolName}</Text>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    )
  }

  const handleProfilePictureChange = async (file, formData) => {
    try {
      // Get current user ID from auth data
      if (!authData?.user?._id) {
        throw new Error('User ID not found');
      }

      if (file === null) {
        // Remove profile picture using user store
        const result = await useUserStore.getState().updateUserProfilePicture(authData.user._id, null);

        if (result.success) {
          // Update local state
          setStudentProfile(prev => ({ ...prev, profilePicture: null }));
          // Refresh user data
          const userResult = await useUserStore.getState().getUser(authData.user._id);
          if (userResult.success && userResult.data) {
            setStudentProfile(prev => ({
              ...prev,
              profilePicture: userResult.data.profilePicture || ""
            }));
          }

          toast({
            title: "Profile Picture Removed",
            description: "Your profile picture has been successfully removed from the database.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error(result.message || 'Failed to remove profile picture from database');
        }
      } else {
        // Upload new profile picture

        // Convert file to base64 for demo purposes (not recommended for production)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target.result;

          // Update using user store (calls API)
          const result = await useUserStore.getState().updateUserProfilePicture(authData.user._id, base64String);

          if (result.success) {
            // Update local state
            setStudentProfile(prev => ({ ...prev, profilePicture: base64String }));

            // Refresh user data from API
            const userResult = await useUserStore.getState().getUser(authData.user._id);
            if (userResult.success && userResult.data) {
              setStudentProfile(prev => ({
                ...prev,
                profilePicture: userResult.data.profilePicture || ""
              }));
            }

            toast({
              title: "Profile Picture Updated",
              description: "Your profile picture has been successfully saved to the database.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            throw new Error(result.message || 'Failed to update profile picture in database');
          }
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Profile Picture Update Failed",
        description: error.message || "Failed to update profile picture. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error; // Re-throw to let the ProfilePicture component handle the error
    }
  }

  const calculateGPA = () => {
    if (academicResults.length === 0) return "0.00"
    const totalPoints = academicResults.reduce((sum, result) => sum + (result.gpa || 0) * (result.credits || 0), 0)
    const totalCredits = academicResults.reduce((sum, result) => sum + (result.credits || 0), 0)
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
  }

  const getAttendanceAverage = () => {
    if (attendanceRecords.length === 0) return 0
    return Math.round(attendanceRecords.reduce((acc, record) => acc + (record.percentage || 0), 0) / attendanceRecords.length)
  }

  const handleSave = async () => {
    try {
      if (!authData?.user?._id) {
        toast({
          title: "Error",
          description: "User not authenticated",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Update user profile
      const updateResponse = await fetch(`/api/user/${authData.user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editableProfile.name,
          phoneNumber: editableProfile.phone || "",
        }),
      });

      if (updateResponse.ok) {
        // Update local state
        setStudentProfile(editableProfile);

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsEditing(false);
      } else {
        const errorData = await updateResponse.json();
        toast({
          title: "Update Failed",
          description: errorData.message || "Failed to update profile",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const handleCancel = () => {
    setEditableProfile(studentProfile || {});
    setIsEditing(false);
  }

  return (
    <Box minH="100%">
      <VStack spacing={6} align="stretch">

        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
          {/* Profile Information */}
          <VStack spacing={6} >
            {/* Basic Info Card */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full" h={"full"} >
              <CardBody>
                <VStack spacing={4} h={"full"} justify={"center"}>
                  <ProfilePicture
                    src={studentProfile?.profilePicture}
                    name={studentProfile?.name || "Student"}
                    size="2xl"
                    bgColor="#3182ce"
                    onPhotoChange={handleProfilePictureChange}
                  />
                  <VStack spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">
                      {studentProfile?.name || "Student Name"}
                    </Text>
                    <Text color="gray.600">{studentProfile?.studentId || "N/A"}</Text>
                    <Badge colorScheme="blue" variant="subtle">
                      {studentProfile?.program || "Not specified"}
                    </Badge>
                    <Badge colorScheme="blue" variant="outline">
                      {studentProfile?.intake || "Not specified"}
                    </Badge>
                    {studentProfile?.schoolName && (
                      <Text fontSize="sm" color="gray.500">{studentProfile.schoolName}</Text>
                    )}
                  </VStack>
                  <HStack spacing={2}>
                    {isEditing ? (
                      <>
                        <Button leftIcon={<FiSave />} colorScheme="green" size="sm" onClick={handleSave}>
                          Save
                        </Button>
                        <Button colorScheme="gray" size="sm" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button leftIcon={<FiEdit />} colorScheme="blue" size="sm" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Editable Profile Information */}
            {isEditing && (
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Edit Profile Information
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">Full Name</FormLabel>
                      <Input
                        value={editableProfile.name || ""}
                        onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
                        placeholder="Enter full name"
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Phone Number</FormLabel>
                      <Input
                        value={editableProfile.phone || ""}
                        onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                        placeholder="Enter phone number"
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Address</FormLabel>
                      <Input
                        value={editableProfile.address || ""}
                        onChange={(e) => setEditableProfile({ ...editableProfile, address: e.target.value })}
                        placeholder="Enter address"
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* Detailed Information */}
          <VStack spacing={6}>
            {/* Contact Information */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Contact Information
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Icon as={FiMail} color="gray.400" />
                    <Text fontSize="sm">{studentProfile?.email || "N/A"}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiPhone} color="gray.400" />
                    <Text fontSize="sm">{studentProfile?.phone || "N/A"}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiMapPin} color="gray.400" />
                    <Text fontSize="sm">{studentProfile?.address || "N/A"}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} color="gray.400" />
                    <Text fontSize="sm">
                      Year {studentProfile?.year || "N/A"} • {studentProfile?.semester || "N/A"}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} color="gray.400" />
                    <Text fontSize="sm" fontFamily="mono" >
                      Student ID: {studentProfile?.studentId || "N/A"}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Academic Summary */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Academic Summary
                </Text>
                <VStack spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Current GPA
                    </Text>
                    <Text fontWeight="bold" color="green.500">
                      {calculateGPA()}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Total Credits
                    </Text>
                    <Text fontWeight="medium">{academicResults.reduce((sum, result) => sum + (result.credits || 0), 0)}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Avg Attendance
                    </Text>
                    <Text fontWeight="medium">{getAttendanceAverage()}%</Text>
                  </HStack>
                  <Progress value={getAttendanceAverage()} colorScheme="blue" size="sm" w="full" />
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  )
}
