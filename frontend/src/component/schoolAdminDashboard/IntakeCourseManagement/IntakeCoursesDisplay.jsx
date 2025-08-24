
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
    useToast
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAcademicStore } from "../../../store/academic";
import { FiRefreshCw } from "react-icons/fi";
import { IntakeCourseCard } from "./intakeCourse/IntakeCourseCard";
import SemesterDetailsModal from "./intakeCourse/SemesterDetailsModal";
import { SemesterFormModal } from "./intakeCourse/SemesterFormModal";

// Intake Courses Display Component
export function IntakeCoursesDisplay() {
    const navigate = useNavigate();
    const { intakeCourses, fetchIntakeCoursesBySchoolId, students, fetchStudentsBySchoolId, semesters, fetchSemestersBySchoolId, createSemester, updateSemester } = useAcademicStore();
    const [isLoading, setIsLoading] = useState(false);
    const [studentCounts, setStudentCounts] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIntakeCourse, setSelectedIntakeCourse] = useState(null);
    const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
    const [currentSemesters, setCurrentSemesters] = useState([]);
    const [isAddSemesterModalOpen, setIsAddSemesterModalOpen] = useState(false);
    const [isAddingLoading, setIsAddingLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [semesterForm, setSemesterForm] = useState({
        courseId: '',
        semesterNumber: '',
        year: '',
        semesterName: '',
        startDate: '',
        endDate: '',
        durationMonths: '',
        registrationStartDate: '',
        registrationEndDate: '',
        registrationDurationDays: '',
        examStartDate: '',
        examEndDate: '',
        examDurationDays: '',
        status: 'upcoming'
    });
    const toast = useToast();

    useEffect(() => {
        if (intakeCourses.length === 0) {
            fetchIntakeCoursesBySchoolId();
        }
        if (students.length === 0) {
            fetchStudentsBySchoolId();
        }
        if (semesters.length === 0) {
            fetchSemestersBySchoolId();
        }
    }, []);

    // Calculate student counts when data is available
    useEffect(() => {
        if (intakeCourses.length > 0 && students.length > 0) {
            const counts = {};
            intakeCourses.forEach(intakeCourse => {
                const studentCount = students.filter(student =>
                    student.intakeCourseId?._id === intakeCourse._id
                ).length;
                counts[intakeCourse._id] = studentCount;
            });
            setStudentCounts(counts);
        }
    }, [intakeCourses, students]);

    const getNumberOfStudents = (intakeCourse) => {
        return studentCounts[intakeCourse._id] || 0;
    }

    // Helper functions for add semester functionality
    const resetSemesterForm = () => {
        setSemesterForm({
            courseId: '',
            semesterNumber: '',
            year: '',
            semesterName: '',
            startDate: '',
            endDate: '',
            durationMonths: '',
            registrationStartDate: '',
            registrationEndDate: '',
            registrationDurationDays: '',
            examStartDate: '',
            examEndDate: '',
            examDurationDays: '',
            status: 'upcoming'
        });
    };

    const handleOpenAddSemesterModal = () => {
        // Find the latest semester end date to calculate the next start date
        const latestSemester = currentSemesters
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];

        let calculatedStartDate = '';
        if (latestSemester && latestSemester.endDate) {
            const latestEndDate = new Date(latestSemester.endDate);
            const nextStartDate = new Date(latestEndDate);
            nextStartDate.setDate(nextStartDate.getDate() + 1); // Add one day
            calculatedStartDate = nextStartDate.toISOString().split('T')[0];
        } else {
            // If no existing semesters, use current date + 1 month
            const currentDate = new Date();
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            calculatedStartDate = nextMonth.toISOString().split('T')[0];
        }


        setSemesterForm({
            courseId: selectedIntakeCourse?.courseId?._id || '',
            semesterNumber: latestSemester.semesterNumber + 1,
            year: latestSemester.year,
            semesterName: `Year ${latestSemester.year} Semester ${latestSemester.semesterNumber + 1}`,
            startDate: calculatedStartDate,
            endDate: '', // Will be calculated based on start date
            durationMonths: '',
            registrationStartDate: '',
            registrationEndDate: '',
            registrationDurationDays: '',
            examStartDate: '',
            examEndDate: '',
            examDurationDays: '',
            status: 'upcoming'
        });

        setIsEditMode(false);
        setSelectedSemester(null);
        setIsAddSemesterModalOpen(true);
    };

    const handleOpenEditSemesterModal = () => {
        if (currentSemesters.length > 0 && currentSemesters[currentSemesterIndex]) {
            const semester = currentSemesters[currentSemesterIndex];
            setSelectedSemester(semester);
            setIsEditMode(true);

            // Use the original semester's start date instead of recalculating
            const originalStartDate = semester.startDate ? new Date(semester.startDate).toISOString().split('T')[0] : '';

            // Populate form with current semester data
            setSemesterForm({
                courseId: semester.courseId._id,
                semesterNumber: semester.semesterNumber?.toString() || '',
                year: semester.year?.toString() || '',
                semesterName: semester.semesterName || '',
                startDate: originalStartDate, // Use original start date
                endDate: semester.endDate ? new Date(semester.endDate).toISOString().split('T')[0] : '',
                durationMonths: '', // Will be calculated by the modal component
                registrationStartDate: semester.registrationStartDate ? new Date(semester.registrationStartDate).toISOString().split('T')[0] : '',
                registrationEndDate: semester.registrationEndDate ? new Date(semester.registrationEndDate).toISOString().split('T')[0] : '',
                registrationDurationDays: '', // Will be calculated by the modal component
                examStartDate: semester.examStartDate ? new Date(semester.examStartDate).toISOString().split('T')[0] : '',
                examEndDate: semester.examEndDate ? new Date(semester.examEndDate).toISOString().split('T')[0] : '',
                examDurationDays: '', // Will be calculated by the modal component
                status: semester.status || 'upcoming'
            });

            setIsAddSemesterModalOpen(true);
        }
    };

    const handleCloseAddSemesterModal = () => {
        setIsAddSemesterModalOpen(false);
        setIsEditMode(false);
        setSelectedSemester(null);
        resetSemesterForm();
    };

    const handleSemesterFormChange = (field, value) => {
        setSemesterForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddSemester = async () => {
        if (!selectedIntakeCourse?.courseId?._id) {
            toast({
                title: "Error",
                description: "No course selected",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Validate required fields
        const requiredFields = ['semesterNumber', 'year', 'semesterName', 'startDate', 'endDate', 'registrationStartDate', 'registrationEndDate', 'examStartDate', 'examEndDate'];
        const missingFields = requiredFields.filter(field => !semesterForm[field]);

        if (missingFields.length > 0) {
            toast({
                title: "Validation Error",
                description: `Please fill in all required fields: ${missingFields.join(', ')}`,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsAddingLoading(true);
        try {
            const semesterData = {
                ...semesterForm,
                courseId: selectedIntakeCourse.courseId._id,
                semesterNumber: parseInt(semesterForm.semesterNumber),
                year: parseInt(semesterForm.year)
            };

            const result = await createSemester(semesterData);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Semester added successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Refresh semesters and close modal
                await fetchSemestersBySchoolId();
                await handleRefreshCurrentSemesters(); // Add this line to refresh current semesters
                handleCloseAddSemesterModal();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to add semester",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
                return;
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            await fetchIntakeCoursesBySchoolId();
            await fetchSemestersBySchoolId();
            await handleRefreshCurrentSemesters(); // Add this line to refresh current semesters
            setIsAddingLoading(false);
        }
    };

    const handleEditSemester = async () => {
        if (!selectedSemester?._id) {
            toast({
                title: "Error",
                description: "No semester selected for editing",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Validate required fields
        const requiredFields = ['semesterNumber', 'year', 'semesterName', 'startDate', 'endDate', 'registrationStartDate', 'registrationEndDate', 'examStartDate', 'examEndDate'];
        const missingFields = requiredFields.filter(field => !semesterForm[field]);

        if (missingFields.length > 0) {
            toast({
                title: "Validation Error",
                description: `Please fill in all required fields: ${missingFields.join(', ')}`,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsAddingLoading(true);
        try {
            const semesterData = {
                ...semesterForm,
                semesterNumber: parseInt(semesterForm.semesterNumber),
                year: parseInt(semesterForm.year)
            };

            // exam end date must be with in date
            const result = await updateSemester(selectedSemester._id, semesterData);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Semester updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Refresh semesters and close modal
                await fetchSemestersBySchoolId();
                await handleRefreshCurrentSemesters(); // Add this line to refresh current semesters
                handleCloseAddSemesterModal();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update semester",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
                return;
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            await fetchIntakeCoursesBySchoolId();
            await fetchSemestersBySchoolId();
            await handleRefreshCurrentSemesters(); // Add this line to refresh current semesters
            setIsAddingLoading(false);
        }
    };



    const handleCardClick = (intakeCourse) => {
        // Navigate to student management with intake course filter
        navigate('/student-management', {
            state: {
                selectedIntakeCourse: intakeCourse,
                filterBy: 'intakeCourse',
                defaultTab: 1// Switch to Students tab (index 1)
            }
        });
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchIntakeCoursesBySchoolId(),
            fetchStudentsBySchoolId(),
            fetchSemestersBySchoolId()
        ]);
        setIsLoading(false);
    };

    const handleViewSemester = (intakeCourse) => {
        // Filter semesters for this specific intake course
        const courseSemesters = semesters.filter(s =>
            s.courseId._id === intakeCourse.courseId._id
        );

        if (courseSemesters.length === 0) {
            console.log("No semesters found for this intake course");
            return;
        }

        setSelectedIntakeCourse(intakeCourse);
        setCurrentSemesters(courseSemesters);
        setCurrentSemesterIndex(0); // Start with first semester
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIntakeCourse(null);
        setCurrentSemesters([]);
        setCurrentSemesterIndex(0);
    };

    const handlePreviousSemester = () => {
        if (currentSemesterIndex > 0) {
            setCurrentSemesterIndex(prev => prev - 1);
        }
    };

    const handleNextSemester = () => {
        if (currentSemesterIndex < currentSemesters.length - 1) {
            setCurrentSemesterIndex(prev => prev + 1);
        }
    };

    const handleSemesterClick = (index) => {
        setCurrentSemesterIndex(index);
    };

    const handleRefreshCurrentSemesters = async () => {
        if (selectedIntakeCourse) {
            // Refresh semesters data
            await fetchSemestersBySchoolId();

            // Re-filter semesters for the current intake course
            const courseSemesters = semesters.filter(s =>
                s.courseId._id === selectedIntakeCourse.courseId._id
            );

            setCurrentSemesters(courseSemesters);

            // Adjust current semester index if needed
            if (currentSemesterIndex >= courseSemesters.length && courseSemesters.length > 0) {
                setCurrentSemesterIndex(courseSemesters.length - 1);
            } else if (courseSemesters.length === 0) {
                setCurrentSemesterIndex(0);
            }
        }
    };

    if (isLoading && intakeCourses.length === 0) {
        return (
            <Center h="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" />
                    <Text>Loading intake courses...</Text>
                </VStack>
            </Center>
        );
    }

    if (!intakeCourses || intakeCourses.length === 0) {
        return (
            <Alert status="info">
                <AlertIcon />
                <AlertTitle>No Intake Courses Found!</AlertTitle>
                <AlertDescription>
                    No intake courses have been created yet. Create intakes and courses first, then link them together.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <VStack spacing={6} align="stretch" p={4}>
            {/* Header with Refresh Button */}
            <Flex justify="space-between" align="center">
                <Box>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        All Intake Courses ({intakeCourses.length})
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        View all intake and course combinations with enrollment capacity; update course's semester details
                    </Text>
                    <HStack spacing={4} mt={1}>
                        <Text fontSize="xs" color="gray.500">
                            Total Students: {Object.values(studentCounts).reduce((sum, count) => sum + count, 0)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Total Capacity: {intakeCourses.reduce((sum, intakeCourse) => sum + (intakeCourse.maxStudents || 0), 0)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Overall: {((Object.values(studentCounts).reduce((sum, count) => sum + count, 0) / (intakeCourses.reduce((sum, intakeCourse) => sum + (intakeCourse.maxStudents || 0), 0))) * 100).toFixed(1)}%
                        </Text>
                    </HStack>
                </Box>
                <Button
                    leftIcon={<Icon as={FiRefreshCw} />}
                    onClick={handleRefresh}
                    isLoading={isLoading}
                    size="sm"
                    variant="outline"
                >
                    Refresh
                </Button>
            </Flex>

            {/* Intake Courses Grid */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {intakeCourses.map((intakeCourse) => (
                    <IntakeCourseCard
                        key={intakeCourse._id}
                        intakeCourse={intakeCourse}
                        studentCount={getNumberOfStudents(intakeCourse)}
                        semesters={semesters}
                        onCardClick={handleCardClick}
                        onViewSemester={handleViewSemester}
                    />
                ))}
            </Grid>

            {/* Semester Details Modal */}
            <SemesterDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedIntakeCourse={selectedIntakeCourse}
                currentSemesters={currentSemesters}
                currentSemesterIndex={currentSemesterIndex}
                onPreviousSemester={handlePreviousSemester}
                onNextSemester={handleNextSemester}
                onOpenAddSemesterModal={handleOpenAddSemesterModal}
                onOpenEditSemesterModal={handleOpenEditSemesterModal}
                onSemesterClick={handleSemesterClick}
                onRefresh={handleRefresh}
                onRefreshCurrentSemesters={handleRefreshCurrentSemesters}
            />

            {/* Add/Edit Semester Modal */}
            <SemesterFormModal
                isOpen={isAddSemesterModalOpen}
                onClose={handleCloseAddSemesterModal}
                isEditMode={isEditMode}
                semesterForm={semesterForm}
                onFormChange={handleSemesterFormChange}
                onSubmit={isEditMode ? handleEditSemester : handleAddSemester}
                isLoading={isAddingLoading}
            />
        </VStack >
    );
}